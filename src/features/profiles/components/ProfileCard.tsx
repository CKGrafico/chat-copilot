import type { Profile } from '../types';
import './profiles.css';

type ProfileCardProps = {
  profile: Profile;
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
};

export function ProfileCard({ profile, onEdit, onDelete }: ProfileCardProps) {
  return (
    <article className="profile-card">
      <span
        className="profile-card__swatch"
        style={{ backgroundColor: profile.color }}
        aria-hidden="true"
      />
      <span className="profile-card__name">{profile.name}</span>
      <div className="profile-card__actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(profile)}
          aria-label={`Edit profile ${profile.name}`}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(profile.id)}
          aria-label={`Delete profile ${profile.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
