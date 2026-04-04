// Cross-feature transcription types. Moved from src/shared/types.ts (Issue #5).

export type TranscriptionStatus = 'idle' | 'loading-model' | 'processing' | 'done' | 'error';

export type Transcription = {
  id: string;
  audioItemId: string;
  text: string;
  language?: string;
  createdAt: Date;
  status: TranscriptionStatus;
};
