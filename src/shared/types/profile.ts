// Profile represents a user-defined reply style used across the reply and profiles features.

export type Profile = {
  id: string;
  name: string;
  language: string;
  color: string;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
};
