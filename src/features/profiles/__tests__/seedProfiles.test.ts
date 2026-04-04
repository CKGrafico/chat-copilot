import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Profile } from '../types';

const mockProfiles: Profile[] = [];

vi.mock('../profileStore', () => ({
  getAllProfiles: vi.fn(async () => [...mockProfiles]),
  createProfile: vi.fn(async (profile: Profile) => {
    mockProfiles.push(profile);
  }),
}));

import { seedDefaultProfile } from '../seedProfiles';
import { getAllProfiles, createProfile } from '../profileStore';

describe('seedDefaultProfile', () => {
  beforeEach(() => {
    mockProfiles.length = 0;
    vi.clearAllMocks();
    (getAllProfiles as ReturnType<typeof vi.fn>).mockImplementation(async () => [...mockProfiles]);
    (createProfile as ReturnType<typeof vi.fn>).mockImplementation(async (profile: Profile) => {
      mockProfiles.push(profile);
    });
  });

  it('seeds a default profile when store is empty', async () => {
    await seedDefaultProfile();
    expect(createProfile).toHaveBeenCalledOnce();
    const created = (createProfile as ReturnType<typeof vi.fn>).mock.calls[0][0] as Profile;
    expect(created.name).toBe('Default');
    expect(created.language).toBe('en');
    expect(created.color).toBe('#4A90E2');
    expect(created.instructions).toBe('Generate a friendly, concise reply.');
    expect(typeof created.id).toBe('string');
  });

  it('does not seed when profiles already exist', async () => {
    mockProfiles.push({
      id: 'existing',
      name: 'Existing',
      language: 'es',
      color: '#fff',
      instructions: 'Be brief.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await seedDefaultProfile();
    expect(createProfile).not.toHaveBeenCalled();
  });
});
