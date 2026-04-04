import { db } from '../storage/db';
import { generateId } from '../utils/generateId';

export type AnalyticsEvent = {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  timestamp: string;
};

const STORAGE_KEY = 'chat-copilot:analytics-enabled';

export function isAnalyticsEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAnalyticsEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore storage errors
  }
}

export async function trackEvent(
  name: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (!isAnalyticsEnabled()) return;
  try {
    const event: AnalyticsEvent = {
      id: generateId(),
      name,
      metadata,
      timestamp: new Date().toISOString(),
    };
    await db.analytics.add(event);
  } catch {
    // never throw — analytics must not break the app
  }
}

export async function getEvents(): Promise<AnalyticsEvent[]> {
  try {
    return await db.analytics.toArray();
  } catch {
    return [];
  }
}

export async function clearEvents(): Promise<void> {
  try {
    await db.analytics.clear();
  } catch {
    // ignore
  }
}
