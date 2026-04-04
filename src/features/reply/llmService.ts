/**
 * WebLLM service — runs an LLM entirely in the browser via WebGPU.
 * No server, no API key, no backend. Model files are fetched from
 * HuggingFace CDN on first use and cached in the browser.
 *
 * Default model: Qwen3-1.7B (April 2025) — the lightest modern model with
 * strong multilingual instruction-following. ~1GB download / ~2GB VRAM.
 * Upgrade path: Qwen3-4B (~2.5GB) for higher quality at similar storage.
 * Falls back to template engine if WebGPU is not available.
 */

import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';
import type { ReplyCandidate } from './templateEngine';
import { generateReplies as templateFallback } from './templateEngine';
import { generateId } from '../../shared/utils/generateId';

export const DEFAULT_LLM_MODEL = 'Qwen3-1.7B-q4f16_1-MLC';

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

  const langLine = language
    ? `Write your reply in ${language}. Do not use any other language.`
    : 'Reply in the same language as the transcription.';

  const lengthGuide = {
    short: 'Very short: 1-3 lines, like a quick WhatsApp message.',
    medium: 'Medium length: a few short paragraphs, natural and direct.',
    long: 'Longer reply: several short paragraphs with practical content. Use line breaks between paragraphs. Still concise — no padding.',
  }[replyLength];

  // Build a clean system prompt that avoids triggering the model's "helpful AI" defaults
  const systemPrompt = `You are writing a WhatsApp reply on behalf of the user.

CONTEXT AND INSTRUCTIONS:
${profileInstructions || 'Write a helpful, natural reply.'}

LANGUAGE: ${langLine}

FORMAT: ${lengthGuide}
- Write like a real person texting, not a formal letter.
- Do NOT use greetings like "Hola," or sign-offs.
- Do NOT moralize, lecture, or add unsolicited advice beyond what the instructions ask.
- Do NOT explain what you are doing. Just write the reply.
- Output ONLY the reply text. Nothing else.`;

  const userMessage = `/no_think\nTranscription of received voice messages:\n"${transcriptionText}"\n\nWrite the WhatsApp reply:`;

  const response = await _engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.5,
    max_tokens: replyLength === 'short' ? 100 : replyLength === 'medium' ? 220 : 400,
  });

  const raw = (response.choices[0]?.message?.content ?? '').trim();
  // Qwen3 may still emit <think>...</think> blocks even with /no_think — strip them
  const text = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  if (!text) return templateFallback(transcriptionText, profileInstructions);

  return [{ id: generateId(), text, length: replyLength, tone: 'ai' }];
}

