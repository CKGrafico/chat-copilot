import { describe, it, expect } from 'vitest';
import { generateReplies } from '../templateEngine';

describe('templateEngine.generateReplies', () => {
  it('returns 3 candidates with required shape for a question input', () => {
    const results = generateReplies('What time can you meet tomorrow?', '');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.id).toBeTruthy();
      expect(typeof r.id).toBe('string');
      expect(typeof r.text).toBe('string');
      expect(r.text.length).toBeGreaterThan(0);
      expect(['short', 'medium', 'long']).toContain(r.length);
      expect(typeof r.tone).toBe('string');
    }
    expect(results[0].length).toBe('short');
    expect(results[1].length).toBe('medium');
    expect(results[2].length).toBe('long');
  });

  it('returns 3 candidates for a gratitude input', () => {
    const results = generateReplies('Thank you so much for your help yesterday!', '');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.id).toBeTruthy();
      expect(typeof r.text).toBe('string');
      expect(r.text.length).toBeGreaterThan(0);
      expect(['short', 'medium', 'long']).toContain(r.length);
    }
  });

  it('returns 3 candidates for a generic (non-question, non-gratitude) input', () => {
    const results = generateReplies('I was thinking about our project timeline.', '');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.id).toBeTruthy();
      expect(typeof r.text).toBe('string');
      expect(['short', 'medium', 'long']).toContain(r.length);
    }
  });

  it('returns 3 fallback candidates for empty input', () => {
    const results = generateReplies('', '');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.id).toBeTruthy();
      expect(typeof r.text).toBe('string');
      expect(r.text.length).toBeGreaterThan(0);
    }
  });

  it('returns 3 fallback candidates for short input (< 10 chars)', () => {
    const results = generateReplies('Hi', '');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.id).toBeTruthy();
      expect(['short', 'medium', 'long']).toContain(r.length);
    }
  });

  it('instructions influence output — formal instruction produces formal tone and phrasing', () => {
    const results = generateReplies('What is your availability next week?', 'Please be formal and professional');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.tone).toBe('formal');
    }
    // formal short reply for a question should reference inquiry/formal language
    expect(results[0].text.toLowerCase()).toMatch(/pleased|inquiry|address/);
  });

  it('instructions influence output — casual instruction produces casual tone', () => {
    const results = generateReplies('What do you think about the plan?', 'keep it casual and friendly');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.tone).toBe('casual');
    }
  });

  it('each candidate has a unique id', () => {
    const results = generateReplies('How are you doing today?', '');
    const ids = results.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });
});
