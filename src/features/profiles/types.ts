// TODO: Shared types for the profiles feature.

export type ProfileTone = 'formal' | 'casual' | 'friendly' | 'professional';

export type Profile = {
  id: string;
  name: string;
  tone: ProfileTone;
  contextHints?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
};
