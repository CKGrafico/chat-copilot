import { useState, useEffect } from 'react';
import type { Profile } from '../../profiles/profile';
import { getAllProfiles } from '../../profiles/profileStore';
import { ProfileSelector } from './ProfileSelector';
import { getStoredProfileId } from '../profileStorage';
import { ReplyCandidates } from './ReplyCandidates';
import { useReplyGeneration } from '../hooks/useReplyGeneration';
import './reply.css';

type Props = {
  transcriptionText: string;
};

export function ReplyScreen({ transcriptionText }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // Initialize from localStorage
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(getStoredProfileId);

  useEffect(() => {
    getAllProfiles()
      .then(all => {
        setProfiles(all);
        // If the stored ID is no longer valid, fall back to the first profile
        const storedId = getStoredProfileId();
        if (storedId && all.some(p => p.id === storedId)) {
          setSelectedProfileId(storedId);
        } else if (all.length > 0) {
          setSelectedProfileId(all[0].id);
        }
      })
      .catch(() => {
        // profiles load failure is non-fatal; reply generation still works without a profile
      });
  }, []);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) ?? null;
  const profileInstructions = selectedProfile?.instructions ?? '';

  const { replies, loading, error, regenerate } = useReplyGeneration(
    transcriptionText,
    profileInstructions,
  );

  return (
    <main className="reply-page">
      <div className="reply-header">
        <h1>Reply suggestions</h1>
      </div>

      <div className="reply-controls">
        <ProfileSelector
          profiles={profiles}
          selectedId={selectedProfileId}
          onSelect={setSelectedProfileId}
        />

        <button
          className="btn btn-primary"
          onClick={regenerate}
          disabled={loading || !selectedProfileId}
          aria-label="Generate reply suggestions with selected profile"
        >
          {loading ? '⟳ Generating...' : '✓ Generate Replies'}
        </button>
      </div>

      {error && (
        <div className="reply-error" role="alert">
          {error}
        </div>
      )}

      <ReplyCandidates replies={replies} loading={loading} />
    </main>
  );
}
