import { describe, it, expect } from 'vitest';
import { squadService } from './squadService';

describe('squadService', () => {
  it('initializes without error', () => {
    expect(squadService).toBeDefined();
    expect(typeof squadService.run).toBe('function');
  });

  it('rejects transcribeAudio with not-implemented error', async () => {
    await expect(
      squadService.run('transcribeAudio', { audioBuffer: new ArrayBuffer(0) }),
    ).rejects.toThrow('not implemented');
  });

  it('rejects generateReply with not-implemented error', async () => {
    await expect(
      squadService.run('generateReply', { transcriptionText: 'hello' }),
    ).rejects.toThrow('not implemented');
  });
});
