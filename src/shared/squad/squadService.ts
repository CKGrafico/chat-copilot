// Squad service — central AI capability dispatcher.
// All AI operations (transcription, reply generation) route through squadService.run().
// The service layer owns capability lifecycle; components observe state only.
//
// M4 implements transcribeAudio (Whisper via Transformers.js Web Worker).
// M6 implements generateReply (template engine Phase 1, Phase 2: LLM).

import type { CapabilityMap, CapabilityName } from './types';

type CapabilityHandler<K extends CapabilityName> = (
  input: CapabilityMap[K]['input'],
) => Promise<CapabilityMap[K]['output']>;

const capabilities: { [K in CapabilityName]: CapabilityHandler<K> } = {
  transcribeAudio: async (input): Promise<CapabilityMap['transcribeAudio']['output']> => {
    // Implemented in M4: forward to transcription capability (whisperService wrapper)
    const { transcribeCapability } = await import('./transcriptionCapability');
    return transcribeCapability(input as any);
  },


  generateReply: async (input): Promise<CapabilityMap['generateReply']['output']> => {
    const { generateReplies } = await import('../../features/reply/templateEngine');
    const instructions = input.profileInstructions ?? input.profileTone ?? '';
    const candidates = generateReplies(input.transcriptionText, instructions);
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
