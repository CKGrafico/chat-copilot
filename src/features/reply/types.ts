// TODO: Shared types for the reply generation feature.

export type ReplyStatus = 'idle' | 'generating' | 'done' | 'error';

export type ReplySession = {
  id: string;
  transcriptionId: string;
  replies: string[];
  selectedReply?: string;
  status: ReplyStatus;
  createdAt: Date;
};
