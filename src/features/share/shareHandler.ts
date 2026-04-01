// TODO: Implement share target handler.
// This module receives shared audio files from the PWA share_target manifest entry,
// validates they are audio (e.g. .ogg, .mp3, .m4a), and hands them off to the
// transcription pipeline. See M2 issues for full implementation.

export type SharePayload = {
  file: File;
};

export async function handleShare(_payload: SharePayload): Promise<void> {
  // TODO: parse incoming share_target POST, extract audio file, route to transcription
}
