import { useCallback, useEffect, useState } from 'react';
import {
  createProfile,
  deleteProfile,
  getAllProfiles,
  updateProfile,
} from '../profileStore';
import type { Profile } from '../types';

export type UseProfilesResult = {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  createProfile: (profile: Profile) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getAllProfiles();
      setProfiles(all);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(
    async (profile: Profile) => {
      await createProfile(profile);
      await refresh();
    },
    [refresh],
  );

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Omit<Profile, 'id' | 'createdAt'>>) => {
      await updateProfile(id, updates);
      await refresh();
    },
    [refresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteProfile(id);
      await refresh();
    },
    [refresh],
  );

  return {
    profiles,
    loading,
    error,
    createProfile: handleCreate,
    updateProfile: handleUpdate,
    deleteProfile: handleDelete,
    refresh,
  };
}
