import { db } from '../../shared/storage/db';
import type { Profile } from './types';

export async function createProfile(profile: Profile): Promise<void> {
  const existing = await db.profiles.get(profile.id);
  if (existing) throw new Error(`Profile with id "${profile.id}" already exists`);
  await db.profiles.add(profile);
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  return db.profiles.get(id);
}

export async function getAllProfiles(): Promise<Profile[]> {
  return db.profiles.toArray();
}

export async function updateProfile(
  id: string,
  updates: Partial<Omit<Profile, 'id' | 'createdAt'>>,
): Promise<void> {
  const existing = await db.profiles.get(id);
  if (!existing) throw new Error(`Profile with id "${id}" not found`);
  await db.profiles.update(id, { ...updates, updatedAt: new Date() });
}

export async function deleteProfile(id: string): Promise<void> {
  const existing = await db.profiles.get(id);
  if (!existing) throw new Error(`Profile with id "${id}" not found`);
  await db.profiles.delete(id);
}
