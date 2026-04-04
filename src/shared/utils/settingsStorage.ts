import { AppSettings } from './settings';

const SETTINGS_KEY = 'chat-copilot:settings';

const DEFAULT_SETTINGS: AppSettings = {
  whisperModel: 'base',
  analyticsEnabled: false,
  theme: 'dark',
};

/**
 * Load settings from localStorage.
 * Returns default settings if not found or if parsing fails.
 */
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(stored) as Partial<AppSettings>;
    // Merge with defaults to ensure all properties exist
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('[settingsStorage] Failed to parse settings:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage.
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('[settingsStorage] Failed to save settings:', err);
    throw new Error('Failed to save settings to localStorage');
  }
}

/**
 * Clear all stored settings and reset to defaults.
 */
export function clearSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.error('[settingsStorage] Failed to clear settings:', err);
    throw new Error('Failed to clear settings');
  }
}
