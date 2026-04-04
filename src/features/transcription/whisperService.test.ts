import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- Mock @xenova/transformers ---
const mockPipelineFn = vi.fn();
const mockPipeline = vi.fn(() => mockPipelineFn);

vi.mock('@xenova/transformers', () => ({
  pipeline: mockPipeline,
  env: { allowLocalModels: false, useBrowserCache: true },
}));

import {
  loadWhisperModel,
  getWhisperModel,
  resetWhisperModelForTests,
  transcribeAudio,
} from './whisperService';

describe('whisperService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWhisperModelForTests();
    // Default: online
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  describe('loadWhisperModel', () => {
    it('creates the pipeline once and caches it', async () => {
      mockPipeline.mockResolvedValue(mockPipelineFn);

      await loadWhisperModel();
      await loadWhisperModel(); // second call reuses cache

      expect(mockPipeline).toHaveBeenCalledTimes(1);
      expect(mockPipeline).toHaveBeenCalledWith(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        expect.objectContaining({ progress_callback: expect.any(Function) }),
      );
    });

    it('calls onProgress with values from progress_callback', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let capturedCb: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPipeline as any).mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Promise.resolve((opts: any) => {
          capturedCb = opts.progress_callback;
          return mockPipelineFn;
        });
      });

      const onProgress = vi.fn();
      await loadWhisperModel(onProgress);

      capturedCb({ status: 'progress', progress: 50 });
      capturedCb({ status: 'done' });

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('resets _loading and throws a friendly error on failure', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPipeline as any).mockRejectedValue(new Error('Network error'));

      await expect(loadWhisperModel()).rejects.toThrow('Failed to load Whisper model');

      // After failure, a new call should attempt again
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPipeline as any).mockResolvedValue(mockPipelineFn);
      await loadWhisperModel();
      expect(mockPipeline).toHaveBeenCalledTimes(2);
    });

    it('throws offline-friendly error when navigator.onLine is false', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPipeline as any).mockRejectedValue(new Error('fetch failed'));

      await expect(loadWhisperModel()).rejects.toThrow('Device is offline');
    });

    it('concurrent calls share one in-flight Promise', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolve: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPipeline as any).mockReturnValue((new Promise((r: any) => { resolve = r; })));

      const p1 = loadWhisperModel();
      const p2 = loadWhisperModel();

      resolve(mockPipelineFn);
      await Promise.all([p1, p2]);

      expect(mockPipeline).toHaveBeenCalledTimes(1);
    });
  });

  describe('getWhisperModel', () => {
    it('returns null before loading', () => {
      expect(getWhisperModel()).toBeNull();
    });

    it('returns the pipeline after loading', async () => {
      mockPipeline.mockResolvedValue(mockPipelineFn);
      await loadWhisperModel();
      expect(getWhisperModel()).toBe(mockPipelineFn);
    });
  });

  describe('transcribeAudio', () => {
    it('throws if model not loaded', async () => {
      await expect(transcribeAudio(new ArrayBuffer(8))).rejects.toThrow(
        'Whisper model not loaded',
      );
    });

    it('returns text from pipeline result', async () => {
      mockPipeline.mockResolvedValue(mockPipelineFn);
      mockPipelineFn.mockResolvedValue({ text: 'Hello world' });

      await loadWhisperModel();
      const result = await transcribeAudio(new Float32Array([0, 0.1, 0.2]).buffer);

      expect(result.text).toBe('Hello world');
    });

    it('extracts duration from last chunk timestamp', async () => {
      mockPipeline.mockResolvedValue(mockPipelineFn);
      mockPipelineFn.mockResolvedValue({
        text: 'Hello',
        chunks: [{ timestamp: [0, 1.5], language: 'en' }, { timestamp: [1.5, 3.0] }],
      });

      await loadWhisperModel();
      const result = await transcribeAudio(new Float32Array(16000).buffer);

      expect(result.duration).toBe(3.0);
      expect(result.language).toBe('en');
    });
  });
});
