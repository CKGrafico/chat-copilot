import { describe, it, expect } from 'vitest';
import { validateAudio } from './validateAudio';

describe('validateAudio', () => {
  it('should accept valid .opus file', () => {
    const file = new File(['audio data'], 'voice.opus', {
      type: 'audio/opus',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid .ogg file', () => {
    const file = new File(['audio data'], 'voice.ogg', {
      type: 'audio/ogg',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid .m4a file', () => {
    const file = new File(['audio data'], 'voice.m4a', {
      type: 'audio/m4a',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept .m4a file with audio/mp4 MIME type', () => {
    const file = new File(['audio data'], 'voice.m4a', {
      type: 'audio/mp4',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept file with audio/* wildcard MIME type', () => {
    const file = new File(['audio data'], 'voice.opus', {
      type: 'audio/x-custom',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject file with invalid extension', () => {
    const file = new File(['audio data'], 'voice.mp3', {
      type: 'audio/mpeg',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file extension');
    expect(result.error).toContain('.opus, .ogg, .m4a, .webm');
  });

  it('should reject file with invalid MIME type', () => {
    const file = new File(['text data'], 'voice.opus', {
      type: 'text/plain',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid MIME type');
  });

  it('should reject file exceeding default size limit', () => {
    const largeData = new ArrayBuffer(51 * 1024 * 1024); // 51MB
    const file = new File([largeData], 'voice.opus', {
      type: 'audio/opus',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('File size exceeds 50MB limit');
  });

  it('should accept file within default size limit', () => {
    const data = new ArrayBuffer(49 * 1024 * 1024); // 49MB
    const file = new File([data], 'voice.opus', {
      type: 'audio/opus',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should respect custom maxSizeBytes option', () => {
    const data = new ArrayBuffer(15 * 1024 * 1024); // 15MB
    const file = new File([data], 'voice.opus', {
      type: 'audio/opus',
    });

    const result = validateAudio(file, { maxSizeBytes: 10 * 1024 * 1024 });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('File size exceeds 10MB limit');
  });

  it('should accept file with custom maxSizeBytes option', () => {
    const data = new ArrayBuffer(8 * 1024 * 1024); // 8MB
    const file = new File([data], 'voice.opus', {
      type: 'audio/opus',
    });

    const result = validateAudio(file, { maxSizeBytes: 10 * 1024 * 1024 });

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should be case-insensitive for file extensions', () => {
    const file = new File(['audio data'], 'voice.OPUS', {
      type: 'audio/opus',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should be case-insensitive for MIME types', () => {
    const file = new File(['audio data'], 'voice.opus', {
      type: 'AUDIO/OPUS',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty file name', () => {
    const file = new File(['audio data'], '', {
      type: 'audio/opus',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file extension');
  });

  it('should reject file with wrong extension but correct MIME type', () => {
    const file = new File(['audio data'], 'voice.txt', {
      type: 'audio/opus',
    });

    const result = validateAudio(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file extension');
  });
});
