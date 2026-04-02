import { vi, describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import * as squad from '../../shared/squad/squadService';
import { useTranscriptionWithRetry } from '../useTranscriptionWithRetry';

vi.mock('../../shared/squad/squadService');

describe('useTranscriptionWithRetry', () => {
  it('retries on failure and succeeds', async () => {
    const mockRun = (squad.squadService.run as any);
    let calls = 0;
    mockRun.mockImplementation(async () => {
      calls += 1;
      if (calls < 2) throw new Error('runtime');
      return { text: 'ok' };
    });

    const { result } = renderHook(() => useTranscriptionWithRetry());

    await act(async () => {
      const res = await result.current.transcribe(new ArrayBuffer(8));
      expect(res.text).toBe('ok');
    });

    expect(calls).toBe(2);
  });

  it('fails after max attempts', async () => {
    const mockRun = (squad.squadService.run as any);
    mockRun.mockImplementation(async () => { throw new Error('fatal'); });

    const { result } = renderHook(() => useTranscriptionWithRetry());

    await act(async () => {
      await expect(result.current.transcribe(new ArrayBuffer(8))).rejects.toThrow();
    });
  });
});
