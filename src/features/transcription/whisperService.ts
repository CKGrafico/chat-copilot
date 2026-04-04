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
 * Decode a compressed audio file (ogg, opus, m4a, mp3, wav, etc.) using the
 * browser's native Web Audio API, then mix down to mono Float32Array.
 * Returns the samples and the native sample rate (Transformers.js will resample).
 */
export async function decodeAudioFile(file: File): Promise<{ data: Float32Array; sampling_rate: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    void audioContext.close();
  }

  const { numberOfChannels, length, sampleRate } = audioBuffer;

  // Mix all channels down to mono
  const mono = new Float32Array(length);
  for (let c = 0; c < numberOfChannels; c++) {
    const channelData = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      mono[i] += channelData[i] / numberOfChannels;
    }
  }

  return { data: mono, sampling_rate: sampleRate };
}

/**
 * Transcribe decoded audio using the cached Whisper pipeline.
 * Call loadWhisperModel() first.
 * Pass the output of decodeAudioFile() directly.
 */
export async function transcribeAudio(
  audio: { data: Float32Array; sampling_rate: number },
): Promise<TranscriptionResult> {
  if (!_pipeline) throw new Error('Whisper model not loaded. Call loadWhisperModel() first.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await (_pipeline as any)(audio.data, { sampling_rate: audio.sampling_rate });

  return {
    text: result?.text ?? '',
    language: result?.chunks?.[0]?.language ?? undefined,
    duration: result?.chunks?.length
      ? result.chunks[result.chunks.length - 1]?.timestamp?.[1]
      : undefined,
  };
}
