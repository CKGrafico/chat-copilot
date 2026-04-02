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

  const transcribe = useCallback(async (audioBuffer: ArrayBuffer, opts?: { maxAttempts?: number; retryDelayMs?: number }) => {
    const maxAttempts = opts?.maxAttempts ?? 3;
    const retryDelayMs = opts?.retryDelayMs ?? 800;

    setState(prev => ({ ...prev, loading: true, attempts: 0, result: null, error: null }));

    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        attempts += 1;
        const res = await squadService.run('transcribeAudio', { audioBuffer });
        setState({ loading: false, attempts, result: res, error: null });
        return res;
      } catch (err: any) {
        const isOffline = !navigator.onLine;
        // Keep a friendly user message while logging the raw error for debugging
        const userMsg = isOffline
          ? 'Device appears offline. Check your connection and retry.'
          : 'Transcription failed. We attempted to retry automatically.';

        // Log the internal error for debugging (local console/storage)
        try { console.error('transcribeAudio error:', err); } catch (_) {}

        setState({ loading: true, attempts, result: null, error: userMsg });

        if (attempts >= maxAttempts) {
          // permanent failure — set loading false and reject
          setState({ loading: false, attempts, result: null, error: userMsg });
          return Promise.reject(new Error(userMsg));
        }

        // wait before retrying
        await new Promise(r => setTimeout(r, retryDelayMs));
      }
    }
  }, []);

  const retry = useCallback((audioBuffer: ArrayBuffer) => {
    return transcribe(audioBuffer);
  }, [transcribe]);

  return { state, transcribe, retry };
}
