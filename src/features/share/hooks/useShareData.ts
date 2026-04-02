import { useEffect, useState } from 'react';

export type ShareData = {
  loading: boolean;
  files: File[];
  text: string | null;
  error: string | null;
};

const SHARE_PAYLOAD_KEY = 'share-payload';

export function useShareData(): ShareData {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShareData() {
      try {
        // Check sessionStorage for share payload (set by service worker)
        const storedPayload = sessionStorage.getItem(SHARE_PAYLOAD_KEY);
        
        if (storedPayload) {
          const payload = JSON.parse(storedPayload);
          
          // Clear the payload from storage after reading
          sessionStorage.removeItem(SHARE_PAYLOAD_KEY);
          
          // Reconstruct File objects from stored data
          if (payload.files && Array.isArray(payload.files)) {
            const reconstructedFiles = await Promise.all(
              payload.files.map(async (fileData: { name: string; type: string; data: string }) => {
                const response = await fetch(fileData.data);
                const blob = await response.blob();
                return new File([blob], fileData.name, { type: fileData.type });
              })
            );
            setFiles(reconstructedFiles);
          }
          
          if (payload.text) {
            setText(payload.text);
          }
          
          setLoading(false);
          return;
        }

        // Fallback: check URL search params
        const params = new URLSearchParams(window.location.search);
        const textParam = params.get('text');
        
        if (textParam) {
          setText(textParam);
          setLoading(false);
          return;
        }

        // No share data found
        setLoading(false);
      } catch (err) {
        console.error('Error loading share data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shared data');
        setLoading(false);
      }
    }

    loadShareData();
  }, []);

  return { loading, files, text, error };
}
