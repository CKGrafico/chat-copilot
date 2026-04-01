// AudioFile represents an audio file as it enters the pipeline (from share target or direct upload).

export type AudioFile = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  file: File;
  importedAt: Date;
};
