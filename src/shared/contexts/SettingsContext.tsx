import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '../utils/settingsStorage';
import { AppSettings, WhisperModel } from '../types/settings';

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
  analyticsEnabled: false,
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
      // Clear Service Worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const modelCaches = cacheNames.filter((name) =>
          name.includes('whisper') || name.includes('model')
        );
        await Promise.all(modelCaches.map((name) => caches.delete(name)));
      }

      // Clear IndexedDB model stores
      const dbNames = await indexedDB.databases?.() || [];
      for (const db of dbNames) {
        if (db.name?.includes('whisper') || db.name?.includes('model')) {
          indexedDB.deleteDatabase(db.name);
        }
      }

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

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
}

// Re-export types for backwards compatibility
export type { AppSettings, WhisperModel };
