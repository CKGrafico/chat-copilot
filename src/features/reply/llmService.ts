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
 * Generate 3 WhatsApp reply candidates using the loaded LLM.
 * Falls back to template engine if the LLM is not loaded.
 */
export async function generateRepliesWithLLM(
  transcriptionText: string,
  profileInstructions: string,
  language?: string,
): Promise<ReplyCandidate[]> {
  if (!_engine) {
    // Graceful fallback — should not normally happen if the UI guards correctly
    return templateFallback(transcriptionText, profileInstructions);
  }

  const langLine = language ? `Respond in ${language}.` : 'Respond in the same language as the transcription.';

  const systemPrompt = [
    'You are a WhatsApp reply assistant. Follow the instructions below exactly.',
    profileInstructions || 'Write a helpful, natural WhatsApp reply.',
    langLine,
    'Output ONLY a JSON object with keys "short", "medium", "long" — nothing else.',
    '"short" is 1-2 sentences, "medium" is 3-4 sentences, "long" is 5-7 sentences.',
    'Do not include labels, explanations, or markdown. Just the JSON.',
  ].join('\n');

  const userMessage = `Voice message transcription:\n"${transcriptionText}"\n\nGenerate 3 WhatsApp replies (short, medium, long):`;

  const response = await _engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  const raw = response.choices[0]?.message?.content ?? '';
  return parseReplyCandidates(raw, profileInstructions);
}

/** Parse the LLM JSON response into ReplyCandidate[]. Falls back to templates on parse error. */
function parseReplyCandidates(raw: string, instructions: string): ReplyCandidate[] {
  try {
    // Extract JSON even if the model wrapped it in markdown or added preamble
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;

    const lengths: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];
    const result: ReplyCandidate[] = lengths
      .filter(l => typeof parsed[l] === 'string' && parsed[l].trim().length > 0)
      .map(l => ({
        id: crypto.randomUUID(),
        text: parsed[l].trim(),
        length: l,
        tone: 'ai',
      }));

    if (result.length === 0) throw new Error('Empty parsed result');
    return result;
  } catch {
    // Fall back to template engine if parsing fails
    return templateFallback('', instructions);
  }
}
