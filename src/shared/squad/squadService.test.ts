import { describe, it, expect, beforeEach, vi } from 'vitest';
import { squadService } from './squadService';
import * as whisper from '../../features/transcription/whisperService';
import * as templateEngine from '../../features/reply/templateEngine';

vi.mock('../../features/transcription/whisperService');
vi.mock('../../features/reply/templateEngine');

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

describe('squadService generateReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to templateEngine.generateReplies and maps output correctly', async () => {
    const mockCandidates = [
      { id: 'id-1', text: 'Short reply.', length: 'short' as const, tone: 'friendly' },
      { id: 'id-2', text: 'Medium reply here.', length: 'medium' as const, tone: 'friendly' },
      { id: 'id-3', text: 'Long reply goes here.', length: 'long' as const, tone: 'friendly' },
    ];
    (templateEngine.generateReplies as any).mockReturnValue(mockCandidates);

    const res = await squadService.run('generateReply', {
      transcriptionText: 'What time works for you?',
      profileInstructions: 'be friendly',
    });

    expect(templateEngine.generateReplies).toHaveBeenCalledWith(
      'What time works for you?',
      'be friendly',
    );
    expect(res.replies).toHaveLength(3);
    expect(res.replies[0]).toEqual({ id: 'id-1', text: 'Short reply.', length: 'short', tone: 'friendly' });
    expect(res.replies[1].length).toBe('medium');
    expect(res.replies[2].length).toBe('long');
  });

  it('falls back to profileTone when profileInstructions is absent', async () => {
    const mockCandidates = [
      { id: 'a', text: 'Reply A', length: 'short' as const, tone: 'formal' },
      { id: 'b', text: 'Reply B', length: 'medium' as const, tone: 'formal' },
      { id: 'c', text: 'Reply C', length: 'long' as const, tone: 'formal' },
    ];
    (templateEngine.generateReplies as any).mockReturnValue(mockCandidates);

    await squadService.run('generateReply', {
      transcriptionText: 'Hello there',
      profileTone: 'formal',
    });

    expect(templateEngine.generateReplies).toHaveBeenCalledWith('Hello there', 'formal');
  });
});
