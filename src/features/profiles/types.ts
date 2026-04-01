// Profile is owned by src/shared/types — re-exported here for use within this feature.
// ProfileTone is feature-local and used for tone-based UI controls.
export type { Profile } from '../../shared/types';

export type ProfileTone = 'formal' | 'casual' | 'friendly' | 'professional';
