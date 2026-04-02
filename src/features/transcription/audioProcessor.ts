// Audio preprocessing utilities for transcription
let ffmpegInstance: any = null;
let loadingPromise: Promise<void> | null = null;

export function getFFmpegInstance() {
  return ffmpegInstance;
}

export async function normalizeAudio(file: File | ArrayBuffer, onProgress?: (p: number) => void): Promise<ArrayBuffer> {
  // Ensure ffmpeg is initialized once
  if (!ffmpegInstance) {
    // Dynamically import to allow mocking in tests
    const ffmpegModule = await import('@ffmpeg/ffmpeg');
    const { createFFmpeg } = ffmpegModule;
    ffmpegInstance = createFFmpeg({ log: true });
    // Provide progress reporting if available
    try {
      // Start a fallback progress estimator while loading
      let fallback = 0;
      const interval = setInterval(() => {
        fallback = Math.min(0.9, fallback + 0.05);
        try {
          onProgress?.(fallback);
        } catch (e) {
          // ignore
        }
      }, 200);

      if (typeof ffmpegInstance.setProgress === 'function') {
        ffmpegInstance.setProgress(({ ratio }: any) => {
          try { onProgress?.(ratio); } catch (e) {}
        });
      } else if (typeof ffmpegInstance.setLogger === 'function') {
        ffmpegInstance.setLogger((log: any) => {
          // Parse progress messages if available (best-effort)
          if (log && typeof log.message === 'string') {
            const m = log.message.match(/time=(\d+:?\d+:?\d+\.\d+)/);
            if (m) {
              // can't compute ratio reliably here
              try { onProgress?.(0.5); } catch (e) {}
            }
          }
        });
      }

      loadingPromise = ffmpegInstance.load();
      await loadingPromise;
      clearInterval(interval);
      onProgress?.(1);
    } finally {
      loadingPromise = null;
    }
  }

  // Read input data
  let inputData: Uint8Array;
  if (typeof (file as File).arrayBuffer === 'function') {
    inputData = new Uint8Array(await (file as File).arrayBuffer());
  } else {
    inputData = new Uint8Array(file as ArrayBuffer);
  }

  // Write to ffmpeg FS
  if (ffmpegInstance.FS && typeof ffmpegInstance.FS.writeFile === 'function') {
    ffmpegInstance.FS.writeFile('input', inputData);
  } else if (typeof ffmpegInstance.FS === 'function') {
    ffmpegInstance.FS('writeFile', 'input', inputData);
  } else {
    throw new Error('ffmpeg FS API not available');
  }

  // Run conversion to mono WAV 16kHz
  if (typeof ffmpegInstance.run === 'function') {
    await ffmpegInstance.run('-i', 'input', '-ac', '1', '-ar', '16000', '-f', 'wav', 'output.wav');
  } else {
    throw new Error('ffmpeg run API not available');
  }

  // Read output
  let out: Uint8Array | null = null;
  if (ffmpegInstance.FS && typeof ffmpegInstance.FS.readFile === 'function') {
    out = ffmpegInstance.FS.readFile('output.wav');
  } else if (typeof ffmpegInstance.FS === 'function') {
    out = ffmpegInstance.FS('readFile', 'output.wav');
  }

  if (!out) throw new Error('No output from ffmpeg');

  return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
}

// New chunkAudio implementation
export async function chunkAudio(audioBufferOrArrayBuffer: ArrayBuffer, chunkDuration = 30, overlap = 2): Promise<ArrayBuffer[]> {
  const AudioCtx: any = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  if (!AudioCtx) throw new Error('AudioContext not available in this environment. Tests should mock decodeAudioData.');

  const ctx = new AudioCtx();
  const decoded: any = await ctx.decodeAudioData(audioBufferOrArrayBuffer);
  const sampleRate: number = decoded.sampleRate;
  const numChannels: number = decoded.numberOfChannels || 1;
  const totalSamples: number = decoded.length;

  // convert to mono Float32Array
  const getMono = () => {
    if (numChannels === 1) return decoded.getChannelData(0).slice();
    const out = new Float32Array(totalSamples);
    for (let c = 0; c < numChannels; c++) {
      const ch = decoded.getChannelData(c);
      for (let i = 0; i < totalSamples; i++) out[i] += ch[i] / numChannels;
    }
    return out;
  };

  const mono = getMono();

  // resample to 16000 if needed
  const targetRate = 16000;
  const resample = (input: Float32Array, origRate: number, targetRate: number) => {
    if (origRate === targetRate) return input;
    const srcLength = input.length;
    const duration = srcLength / origRate;
    const dstLength = Math.round(duration * targetRate);
    const out = new Float32Array(dstLength);
    const ratio = srcLength / dstLength;
    for (let i = 0; i < dstLength; i++) {
      const srcPos = i * ratio;
      const i0 = Math.floor(srcPos);
      const i1 = Math.min(i0 + 1, srcLength - 1);
      const t = srcPos - i0;
      out[i] = input[i0] * (1 - t) + input[i1] * t;
    }
    return out;
  };

  const resampled = resample(mono, sampleRate, targetRate);
  const resampledTotalSamples = resampled.length;
  const resampledDuration = resampledTotalSamples / targetRate;

  // chunking
  const step = Math.max(0.001, chunkDuration - overlap);
  const chunks: ArrayBuffer[] = [];
  let startSec = 0;
  while (startSec < resampledDuration - 1e-9) {
    const endSec = Math.min(startSec + chunkDuration, resampledDuration);
    const startSample = Math.floor(startSec * targetRate);
    const endSample = Math.floor(endSec * targetRate);
    const segment = resampled.subarray(startSample, endSample);
    // convert to WAV 16-bit PCM
    const wav = encodeWAV(segment, targetRate);
    chunks.push(wav);
    if (endSec === resampledDuration) break;
    startSec = startSec + step;
  }

  return chunks;
}

function encodeWAV(samples: Float32Array, sampleRate: number) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, Math.round(s), true);
  }

  return buffer;
}
