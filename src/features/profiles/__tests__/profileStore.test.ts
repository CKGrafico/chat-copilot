import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockTable } = vi.hoisted(() => {
  const mockTable = {
    _store: {} as Record<string, unknown>,
    get: vi.fn(async (id: string) => mockTable._store[id]),
    add: vi.fn(async (profile: unknown) => {
      const p = profile as { id: string };
      mockTable._store[p.id] = p;
    }),
    update: vi.fn(async (id: string, updates: unknown) => {
      mockTable._store[id] = { ...(mockTable._store[id] as object), ...(updates as object) };
    }),
    delete: vi.fn(async (id: string) => {
      delete mockTable._store[id];
    }),
    toArray: vi.fn(async () => Object.values(mockTable._store)),
  };
  return { mockTable };
});

vi.mock('../../../shared/storage/db', () => ({
  db: { profiles: mockTable },
}));

import {
  createProfile,
  getProfile,
  getAllProfiles,
  updateProfile,
  deleteProfile,
} from '../profileStore';
import type { Profile } from '../types';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'test-id',
    name: 'Test',
    language: 'en',
    color: '#000',
    instructions: 'Be helpful.',
    replyLength: 'long',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('profileStore', () => {
  beforeEach(() => {
    mockTable._store = {};
    vi.clearAllMocks();
    mockTable.get.mockImplementation(async (id: string) => mockTable._store[id]);
    mockTable.add.mockImplementation(async (profile: unknown) => {
      const p = profile as Profile;
      mockTable._store[p.id] = p;
    });
    mockTable.update.mockImplementation(async (id: string, updates: unknown) => {
      mockTable._store[id] = { ...(mockTable._store[id] as object), ...(updates as object) };
    });
    mockTable.delete.mockImplementation(async (id: string) => {
      delete mockTable._store[id];
    });
    mockTable.toArray.mockImplementation(async () => Object.values(mockTable._store));
  });

  describe('createProfile', () => {
    it('adds a new profile', async () => {
      const profile = makeProfile();
      await createProfile(profile);
      expect(mockTable.add).toHaveBeenCalledWith(profile);
    });

    it('throws if profile with same id already exists', async () => {
      const profile = makeProfile();
      mockTable._store[profile.id] = profile;
      await expect(createProfile(profile)).rejects.toThrow('already exists');
    });
  });

  describe('getProfile', () => {
    it('returns profile by id', async () => {
      const profile = makeProfile();
      mockTable._store[profile.id] = profile;
      const result = await getProfile(profile.id);
      expect(result).toEqual(profile);
    });

    it('returns undefined for unknown id', async () => {
      const result = await getProfile('no-such-id');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllProfiles', () => {
    it('returns all profiles', async () => {
      const p1 = makeProfile({ id: 'a' });
      const p2 = makeProfile({ id: 'b' });
      mockTable._store = { a: p1, b: p2 };
      const result = await getAllProfiles();
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no profiles exist', async () => {
      const result = await getAllProfiles();
      expect(result).toEqual([]);
    });
  });

  describe('updateProfile', () => {
    it('updates an existing profile and sets updatedAt', async () => {
      const profile = makeProfile();
      mockTable._store[profile.id] = profile;
      await updateProfile(profile.id, { name: 'Updated' });
      expect(mockTable.update).toHaveBeenCalledWith(
        profile.id,
        expect.objectContaining({ name: 'Updated', updatedAt: expect.any(Date) }),
      );
    });

    it('throws if profile does not exist', async () => {
      await expect(updateProfile('ghost-id', { name: 'x' })).rejects.toThrow('not found');
    });
  });

  describe('deleteProfile', () => {
    it('removes a profile by id', async () => {
      const profile = makeProfile();
      mockTable._store[profile.id] = profile;
      await deleteProfile(profile.id);
      expect(mockTable.delete).toHaveBeenCalledWith(profile.id);
    });
  });
});
