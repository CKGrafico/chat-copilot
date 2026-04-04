import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import * as squad from '../../../shared/squad/squadService';
import { useTranscriptionWithRetry } from '../useTranscriptionWithRetry';

vi.mock('../../shared/squad/squadService');

describe('useTranscriptionWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('retries on failure and succeeds', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockRun = (squad.squadService.run as any);
    let calls = 0;
    mockRun.mockImplementation(async () => {
      calls += 1;
      if (calls < 2) throw new Error('runtime');
      return { text: 'ok' };
    });

    const { result } = renderHook(() => useTranscriptionWithRetry());

    await act(async () => {
      const promise = result.current.transcribe(new ArrayBuffer(8));
      // loading should be true immediately
      expect(result.current.state.loading).toBe(true);

      // advance timers to allow retry delay
      vi.advanceTimersByTime(1000);
      const res = (await promise) as { text: string };
      expect(res.text).toBe('ok');

      // after success loading becomes false
      expect(result.current.state.loading).toBe(false);
    });

    expect(mockRun).toHaveBeenCalledTimes(2);
    expect(result.current.state.attempts).toBe(2);
  });

  it('fails after max attempts', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockRun = (squad.squadService.run as any);
    mockRun.mockImplementation(async () => { throw new Error('fatal'); });

    const { result } = renderHook(() => useTranscriptionWithRetry());

    await act(async () => {
      const p = result.current.transcribe(new ArrayBuffer(8));
      // advance through all retry delays (3 attempts => 2 delays)
      vi.advanceTimersByTime(3000);
      await expect(p).rejects.toThrow();
    });

    expect(mockRun).toHaveBeenCalledTimes(3);
    expect(result.current.state.attempts).toBe(3);
  });
});
