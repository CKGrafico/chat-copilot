// TranscriptionSession ties an audio file, its transcription, and generated replies together.
// ReplyCandidate represents a single generated reply suggestion for a session.

export type SessionStatus = 'active' | 'completed' | 'archived';

export type TranscriptionSession = {
  id: string;
  audioFileId: string;
  transcriptionId?: string;
  replyIds: string[];
  createdAt: Date;
  status: SessionStatus;
};

export type ReplyCandidate = {
  id: string;
  sessionId: string;
  text: string;
  profileId: string;
  createdAt: Date;
};
