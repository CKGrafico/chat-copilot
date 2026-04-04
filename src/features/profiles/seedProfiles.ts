// Seeds a default profile on first app launch if no profiles exist.
import { getAllProfiles, createProfile } from './profileStore';

export async function seedDefaultProfile(): Promise<void> {
  const profiles = await getAllProfiles();
  if (profiles.length > 0) return;

  await createProfile({
    id: crypto.randomUUID(),
    name: 'Default',
    language: 'en',
    color: '#4A90E2',
    instructions: 'Generate a friendly, concise reply.',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
