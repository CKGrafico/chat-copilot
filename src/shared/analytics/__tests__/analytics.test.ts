import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for node test environment
const localStorageData: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => localStorageData[key] ?? null,
  setItem: (key: string, value: string) => { localStorageData[key] = value; },
  removeItem: (key: string) => { delete localStorageData[key]; },
  clear: () => { for (const key of Object.keys(localStorageData)) delete localStorageData[key]; },
});

const { mockAnalyticsTable } = vi.hoisted(() => {
  const store: Record<string, unknown> = {};
  const mockAnalyticsTable = {
    _store: store,
    add: vi.fn(async (event: unknown) => {
      const e = event as { id: string };
      mockAnalyticsTable._store[e.id] = e;
    }),
    toArray: vi.fn(async () => Object.values(mockAnalyticsTable._store)),
    clear: vi.fn(async () => {
      for (const key of Object.keys(mockAnalyticsTable._store)) {
        delete mockAnalyticsTable._store[key];
      }
    }),
  };
  return { mockAnalyticsTable };
});

vi.mock('../../storage/db', () => ({
  db: { analytics: mockAnalyticsTable },
}));

import {
  trackEvent,
  getEvents,
  clearEvents,
  isAnalyticsEnabled,
  setAnalyticsEnabled,
} from '../analytics';

describe('analytics', () => {
  beforeEach(() => {
    // Reset store and mocks
    for (const key of Object.keys(mockAnalyticsTable._store)) {
      delete mockAnalyticsTable._store[key];
    }
    vi.clearAllMocks();
    mockAnalyticsTable.add.mockImplementation(async (event: unknown) => {
      const e = event as { id: string };
      mockAnalyticsTable._store[e.id] = e;
    });
    mockAnalyticsTable.toArray.mockImplementation(async () =>
      Object.values(mockAnalyticsTable._store),
    );
    mockAnalyticsTable.clear.mockImplementation(async () => {
      for (const key of Object.keys(mockAnalyticsTable._store)) {
        delete mockAnalyticsTable._store[key];
      }
    });
    // Reset analytics enabled state (defaults to disabled)
    localStorageData['chat-copilot:analytics-enabled'] = 'false';
    delete localStorageData['chat-copilot:analytics-enabled'];
  });

  it('is disabled by default — trackEvent does nothing', async () => {
    expect(isAnalyticsEnabled()).toBe(false);
    await trackEvent('test-event', { foo: 'bar' });
    expect(mockAnalyticsTable.add).not.toHaveBeenCalled();
  });

  it('enabled — event stored with correct fields', async () => {
    setAnalyticsEnabled(true);
    await trackEvent('page-view', { page: '/home' });

    expect(mockAnalyticsTable.add).toHaveBeenCalledOnce();
    const stored = mockAnalyticsTable.add.mock.calls[0][0] as {
      id: string;
      name: string;
      metadata: Record<string, unknown>;
      timestamp: string;
    };
    expect(stored.name).toBe('page-view');
    expect(stored.metadata).toEqual({ page: '/home' });
    expect(typeof stored.id).toBe('string');
    expect(stored.id.length).toBeGreaterThan(0);
    expect(() => new Date(stored.timestamp)).not.toThrow();
  });

  it('clearEvents removes all events', async () => {
    setAnalyticsEnabled(true);
    await trackEvent('ev-1');
    await trackEvent('ev-2');
    expect(Object.keys(mockAnalyticsTable._store)).toHaveLength(2);

    await clearEvents();
    expect(mockAnalyticsTable.clear).toHaveBeenCalledOnce();
    const remaining = await getEvents();
    expect(remaining).toHaveLength(0);
  });
});
