import { transcribeAudio, decodeAudioFile } from '../../features/transcription/whisperService';
import type { TranscribeAudioInput, TranscribeAudioOutput } from './types';

export async function transcribeCapability(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  // Decode compressed audio to Float32Array via Web Audio API, then transcribe
  // input.audioBuffer is a raw File or ArrayBuffer — we need to decode it first
  // For now we create a dummy blob and decode via Web Audio API
  const blob = new Blob([input.audioBuffer]);
  const file = new File([blob], 'audio');
  const audio = await decodeAudioFile(file);
  const result = await transcribeAudio(audio);

  return {
    text: result.text,
    language: result.language,
    durationMs: result.duration ? Math.round(result.duration * 1000) : undefined,
  };
}
