// TODO: Shared types for the transcription feature.

export type TranscriptionStatus = 'idle' | 'loading-model' | 'processing' | 'done' | 'error';

export type Transcription = {
  id: string;
  audioItemId: string;
  text: string;
  language?: string;
  createdAt: Date;
  status: TranscriptionStatus;
};
