import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@ffmpeg/ffmpeg', () => {
  const createFFmpegMock = vi.fn(() => {
    const files = new Map<string, Uint8Array>();
    const instance: any = {
      load: vi.fn(async () => { /* simulate load */ }),
      FS: {
        writeFile: (name: string, data: Uint8Array) => files.set(name, data instanceof Uint8Array ? data : new Uint8Array(data)),
        readFile: (name: string) => files.get(name),
      },
      run: vi.fn(async (...args: any[]) => {
        instance.lastRunArgs = args;
        // create a minimal WAV-like buffer starting with 'RIFF'
        const encoder = new TextEncoder();
        const riff = encoder.encode('RIFF');
        const wav = new Uint8Array(100);
        wav.set(riff, 0);
        files.set('output.wav', wav);
      }),
      setProgress: (cb: any) => { instance._progressCb = cb; },
      setLogger: (cb: any) => { instance._logger = cb; }
    };
    return instance;
  });

  return { createFFmpeg: createFFmpegMock };
});

import { normalizeAudio } from './audioProcessor';
import * as ffmpegModule from '@ffmpeg/ffmpeg';

describe('audioProcessor.normalizeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads ffmpeg on first call and reuses instance', async () => {
    const input = new Uint8Array([1,2,3]).buffer;
    const progress = vi.fn();

    const out1 = await normalizeAudio(input, progress);
    const out2 = await normalizeAudio(input, progress);

    expect((ffmpegModule as any).createFFmpeg).toHaveBeenCalledTimes(1);
    // returned buffer starts with 'RIFF'
    const dv = new Uint8Array(out1);
    const header = new TextDecoder().decode(dv.subarray(0,4));
    expect(header).toBe('RIFF');

    // Ensure ffmpeg was called with mono 16k params
    const instance = (ffmpegModule as any).createFFmpeg.mock.results[0].value;
    expect(instance.lastRunArgs).toContain('-ac');
    expect(instance.lastRunArgs).toContain('1');
    expect(instance.lastRunArgs).toContain('-ar');
    expect(instance.lastRunArgs).toContain('16000');
  });
});
