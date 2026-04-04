// Squad service — central AI capability dispatcher.
// All AI operations (transcription, reply generation) route through squadService.run().
// The service layer owns capability lifecycle; components observe state only.
//
// M4 implements transcribeAudio (Whisper via Transformers.js Web Worker).
// M6 implements generateReply (template engine Phase 1, Phase 2: LLM).
//
// NOTE: Only whisperService uses a dynamic import (lazy) because @xenova/transformers
// is ~4MB and should only be downloaded when the user actually uploads audio.
// All other imports are static so the app bundles cleanly for GitHub Pages / static hosting.

import { transcribeCapability } from './transcriptionCapability';
import { generateRepliesWithLLM, loadLLM, isLLMLoaded } from '../../features/reply/llmService';
import { generateReplies as templateFallback } from '../../features/reply/templateEngine';
import type { CapabilityMap, CapabilityName } from './types';

type CapabilityHandler<K extends CapabilityName> = (
  input: CapabilityMap[K]['input'],
) => Promise<CapabilityMap[K]['output']>;

const capabilities: { [K in CapabilityName]: CapabilityHandler<K> } = {
  transcribeAudio: async (input): Promise<CapabilityMap['transcribeAudio']['output']> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return transcribeCapability(input as any);
  },

  generateReply: async (input): Promise<CapabilityMap['generateReply']['output']> => {
    const instructions = input.profileInstructions ?? input.profileTone ?? '';
    const language = input.profileLanguage;

    if (isLLMLoaded()) {
      const replies = await generateRepliesWithLLM(input.transcriptionText, instructions, language);
      return { replies };
    }

    // LLM not yet loaded — use template engine as immediate fallback
    const lang = language ? `Language: ${language}. ` : '';
    const candidates = templateFallback(input.transcriptionText, lang + instructions);
    return { replies: candidates };
  },
};

export const squadService = {
  run<K extends CapabilityName>(
    capability: K,
    input: CapabilityMap[K]['input'],
  ): Promise<CapabilityMap[K]['output']> {
    const handler = capabilities[capability] as CapabilityHandler<K>;
    return handler(input);
  },
};
