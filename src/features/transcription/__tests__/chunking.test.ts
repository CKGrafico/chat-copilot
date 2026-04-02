import { describe, it, expect, beforeEach } from 'vitest';
import { chunkAudio } from '../audioProcessor';

// Helper to build a fake AudioBuffer-like object
function makeFakeAudioBuffer(sampleRate: number, durationSec: number) {
  const length = Math.floor(sampleRate * durationSec);
  const channelData = new Float32Array(length);
  const freq = 440;
  for (let i = 0; i < length; i++) {
    channelData[i] = Math.sin(2 * Math.PI * freq * (i / sampleRate));
  }
  return {
    sampleRate,
    length,
    numberOfChannels: 1,
    getChannelData: (n: number) => channelData,
  } as any;
}

describe('chunkAudio', () => {
  beforeEach(() => {
    // mock AudioContext
    (globalThis as any).AudioContext = class {
      async decodeAudioData(_ab: ArrayBuffer) {
        return makeFakeAudioBuffer(16000, 180);
      }
    } as any;
  });

  it('produces expected number of chunks and valid WAVs', async () => {
    const dummy = new ArrayBuffer(1);
    const chunks = await chunkAudio(dummy, 30, 2);
    // Expect 7 chunks for 180s, step 28s -> starts at 0,28,56,84,112,140,168
    expect(chunks.length).toBe(7);
    // Check chunks are WAV files starting with RIFF and durations
    const durations: number[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const ab = chunks[i];
      const dv = new DataView(ab);
      const tag = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
      expect(tag).toBe('RIFF');
      const sampleRate = dv.getUint32(24, true);
      const dataSize = dv.getUint32(40, true);
      const bytesPerSample = dv.getUint16(34, true) / 8;
      const numChannels = dv.getUint16(22, true);
      const dur = dataSize / (sampleRate * numChannels * bytesPerSample);
      durations.push(dur);
    }
    // First chunk ~30s
    expect(durations[0]).toBeGreaterThan(29.9);
    expect(durations[0]).toBeLessThan(30.1);
    // Last chunk should be shorter (~12s)
    expect(durations[durations.length - 1]).toBeLessThan(13);
  });
});
