import { describe, it, expect, beforeEach, vi } from 'vitest';
import { squadService } from './squadService';
import * as whisper from '../../features/transcription/whisperService';

vi.mock('../../features/transcription/whisperService');

describe('squadService transcribeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to whisperService.transcribeAudio and returns combined text', async () => {
    const mockResult = { text: 'Hello world', language: 'en', duration: 3.0 };
    (whisper.transcribeAudio as any).mockResolvedValue(mockResult);

    const res = await squadService.run('transcribeAudio', { audioBuffer: new ArrayBuffer(8) });
    expect(res.text).toBe('Hello world');
    expect(res.language).toBe('en');
    expect(res.durationMs).toBe(3000);
  });
});
