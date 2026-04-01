// TODO: Implement Whisper transcription service using @xenova/transformers.
// Loads the Whisper model in a Web Worker, accepts audio chunks, and returns
// transcription text. See M4 issues for full implementation.

export type TranscriptionResult = {
  text: string;
  language?: string;
  duration?: number;
};

export async function transcribeAudio(_audioBuffer: ArrayBuffer): Promise<TranscriptionResult> {
  // TODO: pass audioBuffer to Whisper model running in worker, return transcript
  throw new Error('Not implemented');
}
