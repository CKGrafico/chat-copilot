import { createContext, type ReactNode, useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '../utils/settingsStorage';
import type { AppSettings, WhisperModel } from './settings';
import { applyTheme } from './themeUtils';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  clearModelCache: () => Promise<void>;
  clearConversationHistory: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  whisperModel: 'base',
  theme: 'dark',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    try {
      const loaded = loadSettings();
      setSettings(loaded);
      applyTheme(loaded.theme);
      setError(null);
    } catch (err) {
      console.error('[SettingsProvider] Failed to load settings:', err);
      setError('Failed to load settings');
      applyTheme(DEFAULT_SETTINGS.theme);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    try {
      const newSettings: AppSettings = { ...settings, ...updates };
      setSettings(newSettings);
      saveSettings(newSettings);

      // Apply theme if it changed
      if (updates.theme) {
        applyTheme(updates.theme);
      }

      setError(null);
    } catch (err) {
      console.error('[SettingsProvider] Failed to update settings:', err);
      setError('Failed to save settings');
    }
  };

  const clearModelCache = async () => {
    try {
      // 1. Clear Transformers.js cache (Whisper model)
      //    Transformers.js stores model files under 'transformers-cache' in the Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name =>
              name === 'transformers-cache' ||
              name.includes('whisper') ||
              name.includes('transformers') ||
              name.includes('model')
            )
            .map(name => caches.delete(name))
        );
      }

      // 2. Clear WebLLM cache (LLM model)
      //    WebLLM provides deleteModelAllInfoInCache() which cleanly removes
      //    model weights, chat config, and WASM binaries from Cache API + IndexedDB
      try {
        const { deleteModelAllInfoInCache, prebuiltAppConfig } = await import('@mlc-ai/web-llm');
        const modelIds = prebuiltAppConfig.model_list.map((m: { model_id: string }) => m.model_id);
        await Promise.all(
          modelIds.map((id: string) =>
            deleteModelAllInfoInCache(id, prebuiltAppConfig).catch(() => {
              // Ignore — model may not be cached
            })
          )
        );
      } catch {
        // WebLLM not available in this build — skip silently
      }

      // 3. Also wipe any IndexedDB DBs that look model-related (belt-and-suspenders)
      const dbList = await indexedDB.databases?.() ?? [];
      await Promise.all(
        dbList
          .filter(db => db.name && (
            db.name.includes('whisper') ||
            db.name.includes('model') ||
            db.name.includes('mlc') ||
            db.name.includes('webllm')
          ))
          .map(db => new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(db.name!);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve(); // resolve anyway
          }))
      );

      // 4. Reset the in-memory singletons so next use re-loads fresh
      try {
        const { resetWhisperModelForTests } = await import('../../features/transcription/whisperService');
        resetWhisperModelForTests();
      } catch { /* not critical */ }
      try {
        const { resetLLMForTests } = await import('../../features/reply/llmService');
        resetLLMForTests();
      } catch { /* not critical */ }

      setError(null);
    } catch (err) {
      console.error('[SettingsProvider] Failed to clear model cache:', err);
      setError('Failed to clear model cache');
      throw err;
    }
  };

  const clearConversationHistory = async () => {
    try {
      // Delete the conversation database
      indexedDB.deleteDatabase('chat-copilot');
      setError(null);
    } catch (err) {
      console.error('[SettingsProvider] Failed to clear conversation history:', err);
      setError('Failed to clear conversation history');
      throw err;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        clearModelCache,
        clearConversationHistory,
        isLoading,
        error,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export type { AppSettings, WhisperModel };
export { SettingsContext };
