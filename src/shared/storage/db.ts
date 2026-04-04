import Dexie, { type Table } from 'dexie';
import type { Profile } from '../types/profile';
import type { AnalyticsEvent } from '../analytics/analytics';

export class ChatCopilotDB extends Dexie {
  profiles!: Table<Profile, string>;
  analytics!: Table<AnalyticsEvent, string>;

  constructor() {
    super('ChatCopilotDB');
    this.version(1).stores({
      profiles: 'id',
    });
    this.version(2).stores({
      analytics: 'id',
    });
  }
}

export const db = new ChatCopilotDB();

export async function initDB(): Promise<void> {
  await db.open();
}
