import { Link } from 'react-router-dom';
import type { Profile } from '../types';
import { setStoredProfileId } from '../profileStorage';
import './reply.css';

type Props = {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ProfileSelector({ profiles, selectedId, onSelect }: Props) {
  const handleSelect = (id: string) => {
    setStoredProfileId(id);
    onSelect(id);
  };

  if (profiles.length === 0) {
    return (
      <div className="profile-selector">
        <p className="profile-selector-empty">
          No profiles yet. <Link to="/profiles">Create one</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="profile-selector">
      <span className="profile-selector-label" id="profile-selector-label">
        Reply profile
      </span>

      {/* Desktop: styled select (hidden on mobile via CSS) */}
      <select
        className="profile-selector-select profile-selector-select--desktop"
        aria-labelledby="profile-selector-label"
        value={selectedId ?? ''}
        onChange={e => handleSelect(e.target.value)}
      >
        {profiles.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Mobile: scrollable pill row (hidden on desktop via CSS) */}
      <div
        className="profile-selector-pills profile-selector-pills--mobile"
        role="group"
        aria-label="Select reply profile"
      >
        {profiles.map(p => (
          <button
            key={p.id}
            className={`profile-pill${selectedId === p.id ? ' profile-pill--selected' : ''}`}
            onClick={() => handleSelect(p.id)}
            aria-pressed={selectedId === p.id}
          >
            <span className="profile-dot" style={{ backgroundColor: p.color }} aria-hidden="true" />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

