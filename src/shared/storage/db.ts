import Dexie, { type Table } from 'dexie';
import type { Profile } from '../types/profile';

export class ChatCopilotDB extends Dexie {
  profiles!: Table<Profile, string>;

  constructor() {
    super('ChatCopilotDB');
    this.version(1).stores({
      profiles: 'id',
    });
  }
}

export const db = new ChatCopilotDB();

export async function initDB(): Promise<void> {
  await db.open();
}
