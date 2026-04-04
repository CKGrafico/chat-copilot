export type WhisperModel = 'tiny' | 'base' | 'small';

export interface AppSettings {
  whisperModel: WhisperModel;
  theme: 'light' | 'dark';
}
