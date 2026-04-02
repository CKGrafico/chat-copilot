// Share target handler for PWA share_target manifest entry.
// Receives shared audio files, stores them in sessionStorage, and redirects to /share route.
// The ShareScreen component reads from sessionStorage and processes the files.

export type SharePayload = {
  files: File[];
  text?: string;
};

const SHARE_PAYLOAD_KEY = 'share-payload';

/**
 * Handles incoming share data from the PWA share_target.
 * Converts Files to a serializable format, stores in sessionStorage,
 * and redirects to /share for processing.
 */
export async function handleShare(payload: SharePayload): Promise<void> {
  try {
    // Convert File objects to a serializable format
    const serializedFiles = await Promise.all(
      payload.files.map(async (file) => {
        // Read file as data URL for storage
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        return {
          name: file.name,
          type: file.type,
          data: dataUrl,
        };
      })
    );

    // Store payload in sessionStorage
    const storagePayload = {
      files: serializedFiles,
      text: payload.text || null,
    };

    sessionStorage.setItem(SHARE_PAYLOAD_KEY, JSON.stringify(storagePayload));

    // Redirect to /share route
    window.location.href = '/share';
  } catch (error) {
    console.error('Error handling share:', error);
    throw error;
  }
}
