import { vi, describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import * as squad from '../../shared/squad/squadService';
import { useTranscriptionWithRetry } from '../useTranscriptionWithRetry';

vi.mock('../../shared/squad/squadService');

describe('useTranscriptionWithRetry console logging', () => {
  it('logs internal errors via console.error during retries', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockRun = (squad.squadService.run as any);
    mockRun.mockImplementation(async () => { throw new Error('fatal'); });

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTranscriptionWithRetry());

    await act(async () => {
      const p = result.current.transcribe(new ArrayBuffer(8));
      // advance through retry delays
      vi.advanceTimersByTime(3000);
      await expect(p).rejects.toThrow();
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});