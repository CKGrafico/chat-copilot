export type WhisperModel = 'tiny' | 'base' | 'small';

export interface AppSettings {
  whisperModel: WhisperModel;
  analyticsEnabled: boolean;
  theme: 'light' | 'dark';
}
