// Squad service — central AI capability dispatcher.
// All AI operations (transcription, reply generation) route through squadService.run().
// The service layer owns capability lifecycle; components observe state only.
//
// M4 will implement transcribeAudio (Whisper via Transformers.js Web Worker).
// M6 will implement generateReply (template engine, Phase 2: LLM).

import type { CapabilityMap, CapabilityName } from './types';

type CapabilityHandler<K extends CapabilityName> = (
  input: CapabilityMap[K]['input'],
) => Promise<CapabilityMap[K]['output']>;

const capabilities: { [K in CapabilityName]: CapabilityHandler<K> } = {
  transcribeAudio: async (_input): Promise<CapabilityMap['transcribeAudio']['output']> => {
    // TODO M4: forward audioBuffer to Whisper model running in pipeline.worker.ts
    // Worker receives ArrayBuffer, returns { text, language, durationMs }
    throw new Error('transcribeAudio: not implemented — see M4');
  },

  generateReply: async (_input): Promise<CapabilityMap['generateReply']['output']> => {
    // TODO M6: select matching templates or invoke LLM, inject profile context
    // Returns ranked reply suggestions with tone metadata
    throw new Error('generateReply: not implemented — see M6');
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
