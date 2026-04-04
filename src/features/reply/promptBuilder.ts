// TODO: Build prompts / template strings for the reply engine.
// Combines transcription text + active profile context into a structured input
// for either the template engine (Phase 1) or LLM (Phase 2 stretch).

import type { Transcription } from '../../transcription/types';

export type PromptContext = {
  transcription: Transcription;
  profileName?: string;
  profileTone?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function buildPrompt(_ctx: PromptContext): string {
  // TODO: merge transcription + profile into a prompt string or template key
  throw new Error('Not implemented');
}
