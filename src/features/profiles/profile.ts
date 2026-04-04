// Profile represents a user-defined reply style used across the reply and profiles features.

export type ReplyLength = 'short' | 'medium' | 'long';

export type Profile = {
  id: string;
  name: string;
  language: string;
  color: string;
  instructions: string;
  replyLength: ReplyLength;
  createdAt: Date;
  updatedAt: Date;
};
