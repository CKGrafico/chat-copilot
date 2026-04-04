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
const WHISPER_SAMPLE_RATE = 16000;

// Maps ISO 639-1 codes → Whisper language names (English lowercase)
const ISO_TO_WHISPER: Record<string, string> = {
  en: 'english', es: 'spanish', fr: 'french', de: 'german', it: 'italian',
  pt: 'portuguese', nl: 'dutch', ru: 'russian', zh: 'chinese', ja: 'japanese',
  ko: 'korean', ar: 'arabic', hi: 'hindi', pl: 'polish', sv: 'swedish',
  da: 'danish', fi: 'finnish', nb: 'norwegian', tr: 'turkish', cs: 'czech',
  ro: 'romanian', hu: 'hungarian', uk: 'ukrainian', el: 'greek', he: 'hebrew',
};

/**
 * Converts an ISO 639-1 code or full language name to the Whisper-expected format.
 * Falls back to undefined (auto-detect) if not recognised.
 */
export function toWhisperLanguage(lang?: string): string | undefined {
  if (!lang) return undefined;
  const lower = lang.toLowerCase().trim();
  return ISO_TO_WHISPER[lower] ?? (lower.length > 2 ? lower : undefined);
}

export async function decodeAudioFile(file: File): Promise<{ data: Float32Array; sampling_rate: number }> {
  const arrayBuffer = await file.arrayBuffer();
  // Force 16kHz so AudioContext resamples during decode — Transformers.js passes
  // Float32Array through without resampling, so we must deliver 16kHz ourselves.
  const audioContext = new AudioContext({ sampleRate: WHISPER_SAMPLE_RATE });
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    void audioContext.close();
  }

  const { numberOfChannels, length } = audioBuffer;

  // Mix all channels down to mono
  const mono = new Float32Array(length);
  for (let c = 0; c < numberOfChannels; c++) {
    const channelData = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      mono[i] += channelData[i] / numberOfChannels;
    }
  }

  return { data: mono, sampling_rate: WHISPER_SAMPLE_RATE };
}

/**
 * Transcribe decoded audio using the cached Whisper pipeline.
 * Call loadWhisperModel() first.
 * Pass the output of decodeAudioFile() directly.
 * @param language - Optional ISO 639-1 code or English language name (e.g. 'es', 'spanish')
 */
export async function transcribeAudio(
  audio: { data: Float32Array; sampling_rate: number },
  language?: string,
): Promise<TranscriptionResult> {
  if (!_pipeline) throw new Error('Whisper model not loaded. Call loadWhisperModel() first.');

  const whisperLang = toWhisperLanguage(language);
  const options: Record<string, unknown> = { sampling_rate: audio.sampling_rate };
  if (whisperLang) {
    options.language = whisperLang;
    options.task = 'transcribe';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await (_pipeline as any)(audio.data, options);

  return {
    text: result?.text ?? '',
    language: result?.chunks?.[0]?.language ?? undefined,
    duration: result?.chunks?.length
      ? result.chunks[result.chunks.length - 1]?.timestamp?.[1]
      : undefined,
  };
}
