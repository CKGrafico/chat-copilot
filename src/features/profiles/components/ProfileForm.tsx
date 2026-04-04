import { useState } from 'react';
import type { Profile } from '../types';
import './profiles.css';

export type ProfileFormData = {
  name: string;
  language: string;
  color: string;
  instructions: string;
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

const COLORS = [
  '#4A90E2',
  '#E2574C',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
  '#795548',
  '#607D8B',
];

const NAME_MAX = 50;
const INSTRUCTIONS_MAX = 500;

type ProfileFormProps = {
  initial?: Profile;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
};

type FormErrors = {
  name?: string;
  instructions?: string;
};

export function ProfileForm({ initial, onSubmit, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [language, setLanguage] = useState(initial?.language ?? 'en');
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) {
      errs.name = 'Name is required.';
    } else if (name.length > NAME_MAX) {
      errs.name = `Name must be ${NAME_MAX} characters or fewer.`;
    }
    if (!instructions.trim()) {
      errs.instructions = 'Instructions are required.';
    } else if (instructions.length > INSTRUCTIONS_MAX) {
      errs.instructions = `Instructions must be ${INSTRUCTIONS_MAX} characters or fewer.`;
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), language, color, instructions: instructions.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(initial);

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <h2>{isEdit ? 'Edit Profile' : 'New Profile'}</h2>

      {/* Name */}
      <div className="form-field">
        <label className="form-label" htmlFor="pf-name">
          Name
        </label>
        <input
          id="pf-name"
          className="form-input"
          type="text"
          value={name}
          maxLength={NAME_MAX}
          required
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'pf-name-error' : undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
        />
        <span className="form-char-count">{name.length}/{NAME_MAX}</span>
        {errors.name && (
          <span id="pf-name-error" className="form-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Language */}
      <div className="form-field">
        <label className="form-label" htmlFor="pf-language">
          Language
        </label>
        <select
          id="pf-language"
          className="form-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div className="form-field">
        <span className="form-label" id="pf-color-label">
          Color
        </span>
        <div className="color-swatches" role="group" aria-labelledby="pf-color-label">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-swatch"
              style={{ backgroundColor: c, color: c }}
              aria-label={`Select color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="form-field">
        <label className="form-label" htmlFor="pf-instructions">
          Instructions
        </label>
        <textarea
          id="pf-instructions"
          className="form-textarea"
          value={instructions}
          maxLength={INSTRUCTIONS_MAX}
          required
          aria-invalid={errors.instructions ? 'true' : 'false'}
          aria-describedby={errors.instructions ? 'pf-instructions-error' : undefined}
          onChange={(e) => {
            setInstructions(e.target.value);
            if (errors.instructions)
              setErrors((prev) => ({ ...prev, instructions: undefined }));
          }}
        />
        <span className="form-char-count">{instructions.length}/{INSTRUCTIONS_MAX}</span>
        {errors.instructions && (
          <span id="pf-instructions-error" className="form-error" role="alert">
            {errors.instructions}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
