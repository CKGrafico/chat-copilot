import { transcribeAudio } from '../../features/transcription/whisperService';
import type { TranscribeAudioInput, TranscribeAudioOutput } from './types';

export async function transcribeCapability(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  // The whisperService.transcribeAudio expects a 16kHz mono Float32 ArrayBuffer.
  // Here the input.audioBuffer is already expected to be prepared by audioProcessor.
  const result = await transcribeAudio(input.audioBuffer);

  return {
    text: result.text,
    language: result.language,
    durationMs: result.duration ? Math.round(result.duration * 1000) : undefined,
  };
}
