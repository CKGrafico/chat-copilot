// TODO: Implement audio processing pipeline using ffmpeg.wasm.
// Converts incoming audio formats to 16kHz mono WAV (required by Whisper),
// splits long audio into chunks, and emits progress events.
// See M3 issues for full implementation.

export type AudioChunk = {
  index: number;
  buffer: ArrayBuffer;
  startMs: number;
  endMs: number;
};

export async function processAudio(_file: File): Promise<AudioChunk[]> {
  // TODO: decode with ffmpeg.wasm, resample to 16kHz mono, split into chunks
  throw new Error('Not implemented');
}
