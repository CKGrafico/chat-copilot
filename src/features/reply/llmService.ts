/**
 * WebLLM service — runs an LLM entirely in the browser via WebGPU.
 * No server, no API key, no backend. Model files are fetched from
 * HuggingFace CDN on first use and cached in the browser.
 *
 * Default model: Llama-3.2-3B-Instruct (~1.9 GB, multilingual)
 * Falls back to template engine if WebGPU is not available.
 */

import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';
import type { ReplyCandidate } from './templateEngine';
import { generateReplies as templateFallback } from './templateEngine';

export const DEFAULT_LLM_MODEL = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

export type LLMProgressCallback = (percent: number, text: string) => void;

let _engine: MLCEngineInterface | null = null;
let _loading: Promise<MLCEngineInterface> | null = null;

export function isLLMLoaded(): boolean {
  return _engine !== null;
}

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/** Reset — for testing only */
export function resetLLMForTests(): void {
  _engine = null;
  _loading = null;
}

/**
 * Load the LLM into the browser via WebGPU.
 * Subsequent calls reuse the cached engine.
 */
export async function loadLLM(
  model = DEFAULT_LLM_MODEL,
  onProgress?: LLMProgressCallback,
): Promise<void> {
  if (_engine) return;
  if (_loading) { await _loading; return; }

  if (!isWebGPUSupported()) {
    throw new Error('WebGPU is not supported in this browser. Try Chrome 113+ or Edge 113+.');
  }

  _loading = CreateMLCEngine(model, {
    initProgressCallback: (progress) => {
      const pct = Math.round(progress.progress * 100);
      onProgress?.(pct, progress.text ?? `Loading model… ${pct}%`);
    },
  });

  try {
    _engine = await _loading;
  } catch (err) {
    _loading = null;
    throw err;
  }
}

/**
 * Generate a single WhatsApp reply of the requested length using the loaded LLM.
 * Falls back to template engine if the LLM is not loaded.
 */
export async function generateRepliesWithLLM(
  transcriptionText: string,
  profileInstructions: string,
  language?: string,
  replyLength: 'short' | 'medium' | 'long' = 'long',
): Promise<ReplyCandidate[]> {
  if (!_engine) {
    return templateFallback(transcriptionText, profileInstructions);
  }

  const langLine = language ? `Respond in ${language}.` : 'Respond in the same language as the transcription.';
  const lengthGuide = {
    short: '1-2 sentences maximum',
    medium: '3-4 sentences',
    long: '5-7 sentences, detailed and complete',
  }[replyLength];

  const systemPrompt = [
    'You are a WhatsApp reply assistant. Follow the instructions below exactly.',
    profileInstructions || 'Write a helpful, natural WhatsApp reply.',
    langLine,
    `Write a ${replyLength} reply: ${lengthGuide}.`,
    'Reply with ONLY the message text. No labels, no explanations, no quotes, no markdown.',
  ].join('\n');

  const userMessage = `Voice message transcription:\n"${transcriptionText}"\n\nWrite the WhatsApp reply:`;

  const response = await _engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: replyLength === 'short' ? 80 : replyLength === 'medium' ? 180 : 350,
  });

  const text = (response.choices[0]?.message?.content ?? '').trim();
  if (!text) return templateFallback(transcriptionText, profileInstructions);

  return [{ id: crypto.randomUUID(), text, length: replyLength, tone: 'ai' }];
}
