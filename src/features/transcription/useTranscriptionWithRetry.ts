import { useState, useCallback } from 'react';
import { squadService } from '../../shared/squad/squadService';

export type TranscriptionState = {
  loading: boolean;
  error?: string | null;
  attempts: number;
  result?: { text: string; language?: string; durationMs?: number } | null;
};

export function useTranscriptionWithRetry() {
  const [state, setState] = useState<TranscriptionState>({ loading: false, attempts: 0, result: null });

  const transcribe = useCallback(async (audioBuffer: ArrayBuffer) => {
    setState({ loading: true, attempts: 0, result: null, error: null });

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts += 1;
        const res = await squadService.run('transcribeAudio', { audioBuffer });
        setState({ loading: false, attempts, result: res, error: null });
        return res;
      } catch (err: any) {
        const isOffline = !navigator.onLine;
        const msg = isOffline
          ? 'Device appears offline. Check your connection and retry.'
          : (err?.message ?? 'Transcription failed due to an unexpected error.');

        setState({ loading: false, attempts, result: null, error: msg });

        if (attempts >= maxAttempts) {
          // permanent failure
          return Promise.reject(new Error(msg));
        }

        // wait briefly before retrying
        await new Promise(r => setTimeout(r, 800));
      }
    }
  }, []);

  const retry = useCallback((audioBuffer: ArrayBuffer) => {
    return transcribe(audioBuffer);
  }, [transcribe]);

  return { state, transcribe, retry };
}
