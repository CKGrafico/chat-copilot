import { loadModel } from '@xenova/transformers';

export type TranscriptionResult = {
  text: string;
  language?: string;
  duration?: number;
};

let _model: any = null;
let _loading: Promise<any> | null = null;

export type ProgressCallback = (percent: number) => void;

export async function loadWhisperModel(onProgress?: ProgressCallback) {
  if (_model) return _model;
  if (_loading) return _loading;

  _loading = (async () => {
    try {
      const model = await loadModel('openai/whisper-tiny', {
        // Transformers.js may provide a progress callback; adapt if available
        progress: (p: number) => {
          try { onProgress?.(Math.round(p * 100)); } catch (e) {}
        },
      });

      _model = model;
      return _model;
    } catch (err: any) {
      _loading = null;
      throw err;
    }
  })();

  return _loading;
}

export function getWhisperModel() {
  return _model;
}

export function resetWhisperModelForTests() {
  _model = null;
  _loading = null;
}

export async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<TranscriptionResult> {
  if (!_model) throw new Error('Model not loaded. Call loadWhisperModel first.');
  // For now, if model has a transcribe method use it; otherwise throw
  if (typeof _model.transcribe === 'function') {
    const res = await _model.transcribe(audioBuffer);
    return { text: res.text ?? '', language: res.language ?? undefined, duration: res?.duration };
  }

  throw new Error('Model runtime does not expose transcribe; integrate runtime-specific API.');
}
