import Dexie, { type Table } from 'dexie';
import type { Profile } from '../../features/profiles/profile';
import type { AnalyticsEvent } from '../analytics/analytics';

export class ChatCopilotDB extends Dexie {
  profiles!: Table<Profile, string>;
  analytics!: Table<AnalyticsEvent, string>;

  constructor() {
    super('ChatCopilotDB');
    this.version(1).stores({
      profiles: 'id',
    });
    // v2: adds analytics table for local event tracking (#31)
    this.version(2).stores({
      analytics: 'id',
    });
  }
}

export const db = new ChatCopilotDB();

export async function initDB(): Promise<void> {
  await db.open();
}
