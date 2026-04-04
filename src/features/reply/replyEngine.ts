// TODO: Implement reply generation engine.
// Phase 1: template-based replies populated from user profile context.
// Phase 2 (stretch): LLM-powered replies via Squad AI capability abstraction.
// See M6 issues for full implementation.

import type { Transcription } from '../transcription/types';

export type ReplyOption = {
  id: string;
  text: string;
  tone: 'formal' | 'casual' | 'friendly';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateReplies(_transcription: Transcription): Promise<ReplyOption[]> {
  // TODO: select matching templates, inject profile context, return reply options
  throw new Error('Not implemented');
}
