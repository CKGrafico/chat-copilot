import { useRef, useState } from 'react';
import type { Profile } from '../types';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileCard } from './ProfileCard';
import { ProfileForm, type ProfileFormData } from './ProfileForm';
import './profiles.css';

export function ProfileList() {
  const { profiles, loading, error, createProfile, updateProfile, deleteProfile } = useProfiles();
  const [editing, setEditing] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => {
    dialogRef.current?.close();
    setEditing(null);
    setIsCreating(false);
  };

  const handleNewClick = () => {
    setEditing(null);
    setIsCreating(true);
    openDialog();
  };

  const handleEditClick = (profile: Profile) => {
    setEditing(profile);
    setIsCreating(false);
    openDialog();
  };

  const handleDeleteClick = async (id: string) => {
    const confirmed = window.confirm('Delete this profile? This cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteProfile(id);
      setActionError(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete profile.');
    }
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      if (editing) {
        await updateProfile(editing.id, data);
      } else {
        const now = new Date();
        await createProfile({
          id: crypto.randomUUID(),
          ...data,
          createdAt: now,
          updatedAt: now,
        });
      }
      setActionError(null);
      closeDialog();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save profile.');
    }
  };

  return (
    <div className="profiles-page">
      <header className="profiles-header">
        <h1>Profiles</h1>
        <button className="btn btn-primary" onClick={handleNewClick}>
          + New Profile
        </button>
      </header>

      {(error || actionError) && (
        <p role="alert" className="profiles-error">
          {error ?? actionError}
        </p>
      )}

      {loading ? (
        <p className="profiles-loading">Loading profiles…</p>
      ) : profiles.length === 0 ? (
        <div className="profiles-empty">
          <strong>No profiles yet</strong>
          <p>Create a profile to personalise your reply suggestions.</p>
        </div>
      ) : (
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={handleEditClick}
              onDelete={(id) => void handleDeleteClick(id)}
            />
          ))}
        </div>
      )}

      <dialog ref={dialogRef} className="profiles-dialog" onClose={closeDialog}>
        {(isCreating || editing) && (
          <ProfileForm
            initial={editing ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={closeDialog}
          />
        )}
      </dialog>
    </div>
  );
}
