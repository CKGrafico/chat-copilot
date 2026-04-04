import { useState, useCallback } from 'react';
import { squadService } from '../../../shared/squad/squadService';
import type { GenerateReplyOutput } from '../../../shared/squad/types';

type Reply = GenerateReplyOutput['replies'][number];

type UseReplyGenerationResult = {
  replies: Reply[];
  loading: boolean;
  error: string | null;
  regenerate: () => void;
};

export function useReplyGeneration(
  transcriptionText: string,
  profileInstructions: string,
): UseReplyGenerationResult {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!transcriptionText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await squadService.run('generateReply', {
        transcriptionText,
        profileInstructions,
      });
      setReplies(result.replies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate replies.');
    } finally {
      setLoading(false);
    }
  }, [transcriptionText, profileInstructions]);

  const regenerate = useCallback(() => {
    void generate();
  }, [generate]);

  return { replies, loading, error, regenerate };
}
