// Squad capability types — the type-safe interface contract between the service layer
// and the AI pipeline. Components never reference these directly; they go through
// squadService.run() only.

export type TranscribeAudioInput = {
  audioBuffer: ArrayBuffer;
};

export type TranscribeAudioOutput = {
  text: string;
  language?: string;
  durationMs?: number;
};

export type GenerateReplyInput = {
  transcriptionText: string;
  profileName?: string;
  profileTone?: string;
  profileInstructions?: string;
  profileLanguage?: string;
  profileReplyLength?: 'short' | 'medium' | 'long';
};

export type GenerateReplyOutput = {
  replies: Array<{
    id: string;
    text: string;
    length: 'short' | 'medium' | 'long';
    tone: string;
  }>;
};

export type CapabilityMap = {
  transcribeAudio: { input: TranscribeAudioInput; output: TranscribeAudioOutput };
  generateReply: { input: GenerateReplyInput; output: GenerateReplyOutput };
};

export type CapabilityName = keyof CapabilityMap;
