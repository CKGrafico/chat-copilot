import { pipeline, env } from '@xenova/transformers';

// Allow model files to be cached by the browser's Cache API (IndexedDB-backed)
env.allowLocalModels = false;
env.useBrowserCache = true;

export type TranscriptionResult = {
  text: string;
  language?: string;
  duration?: number;
};

export type ProgressCallback = (percent: number) => void;

// Singleton pipeline — loaded once and reused
let _pipeline: unknown = null;
let _loading: Promise<unknown> | null = null;

/**
 * Loads openai/whisper-tiny via Transformers.js.
 * Model files are cached by the browser after the first load.
 * Concurrent callers share a single in-flight Promise.
 *
 * @param onProgress - Optional callback called with 0-100 as files download
 */
export async function loadWhisperModel(onProgress?: ProgressCallback): Promise<unknown> {
  if (_pipeline) return _pipeline;
  if (_loading) return _loading;

  _loading = (async () => {
    try {
      const pipe = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        {
          progress_callback: (progress: { status: string; progress?: number }) => {
            if (progress.status === 'progress' && typeof progress.progress === 'number') {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              try { onProgress?.(Math.round(progress.progress)); } catch (_e) {
                // ignore
              }
            } else if (progress.status === 'done') {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              try { onProgress?.(100); } catch (_e) {
                // ignore
              }
            }
          },
        },
      );
      _pipeline = pipe;
      return _pipeline;
    } catch (err: unknown) {
      _loading = null;
      const isOffline = !navigator.onLine;
      const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as Record<string, unknown>).message) : String(err);
      throw new Error(
        isOffline
          ? 'Device is offline. Whisper model files could not be downloaded. Connect to a network and try again.'
          : `Failed to load Whisper model: ${msg}`,
      );
    }
  })();

  return _loading;
}

export function getWhisperModel(): unknown {
  return _pipeline;
}

/** Reset state — for use in tests only */
export function resetWhisperModelForTests(): void {
  _pipeline = null;
  _loading = null;
}

/**
 * Transcribe a 16kHz mono WAV ArrayBuffer using the cached Whisper pipeline.
 * Call loadWhisperModel() first.
 */
export async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<TranscriptionResult> {
  if (!_pipeline) throw new Error('Whisper model not loaded. Call loadWhisperModel() first.');

  // Convert ArrayBuffer → Float32Array (PCM samples expected by Transformers.js)
  const floatArray = new Float32Array(audioBuffer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await (_pipeline as any)(floatArray, { sampling_rate: 16000 });

  return {
    text: result?.text ?? '',
    language: result?.chunks?.[0]?.language ?? undefined,
    duration: result?.chunks?.length
      ? result.chunks[result.chunks.length - 1]?.timestamp?.[1]
      : undefined,
  };
}
