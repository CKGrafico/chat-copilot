// TODO: Implement profile persistence using Dexie (IndexedDB wrapper).
// Stores user-defined "reply profiles" (name, tone, context hints).
// The active profile is injected into reply generation at runtime.
// See M5 issues for full implementation.

import type { Profile } from './types';

export async function getProfiles(): Promise<Profile[]> {
  // TODO: query Dexie profiles table
  throw new Error('Not implemented');
}

export async function saveProfile(_profile: Profile): Promise<void> {
  // TODO: upsert profile in Dexie
  throw new Error('Not implemented');
}

export async function deleteProfile(_id: string): Promise<void> {
  // TODO: remove profile from Dexie by id
  throw new Error('Not implemented');
}
