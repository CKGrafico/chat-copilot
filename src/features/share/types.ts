// TODO: Shared types for the share feature.
// Defines the shape of a shared audio item as it moves through the pipeline.

export type ShareStatus = 'pending' | 'processing' | 'done' | 'error';

export type SharedAudioItem = {
  id: string;
  file: File;
  receivedAt: Date;
  status: ShareStatus;
};
