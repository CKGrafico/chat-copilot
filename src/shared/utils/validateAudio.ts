// Supported audio formats for WhatsApp voice messages
const ALLOWED_MIME_TYPES = [
  'audio/opus',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'audio/webm',
];

const ALLOWED_EXTENSIONS = ['.opus', '.ogg', '.m4a', '.webm'];

const DEFAULT_MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export type ValidateAudioOptions = {
  maxSizeBytes?: number;
};

export function validateAudio(
  file: File,
  options?: ValidateAudioOptions
): ValidationResult {
  const maxSizeBytes = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;

  // Basic guards
  if (!file || typeof file.name !== 'string') {
    return { valid: false, error: 'Invalid file object' };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file extension (case-insensitive)
  const fileName = file.name || '';
  const lower = fileName.toLowerCase();
  const ext = Array.from(ALLOWED_EXTENSIONS).find((e) => lower.endsWith(e));

  if (!ext) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check MIME type. Allow audio/* wildcard but prefer explicit types.
  const mimeType = (file.type || '').toLowerCase();
  // If file.type is empty (common for some browser share targets), skip MIME check and rely on extension only.
  if (mimeType) {
    const allowedMime = ALLOWED_MIME_TYPES.includes(mimeType);
    const isAudioWildcard = mimeType.startsWith('audio/');

    if (!allowedMime && !isAudioWildcard) {
      return {
        valid: false,
        error: `Invalid MIME type. Expected audio format, got: ${file.type}`,
      };
    }
  }

  return { valid: true };
}
