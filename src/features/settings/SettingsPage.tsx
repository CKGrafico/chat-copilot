import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../shared/contexts/useSettings';
import type { WhisperModel } from '../../shared/contexts/settings';
import './settings.css';

const MODEL_SIZES: Record<WhisperModel, string> = {
  tiny: '~39 MB',
  base: '~140 MB',
  small: '~466 MB',
};

function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal" role="alertdialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="settings-modal-actions">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="settings-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="settings-btn-danger"
          >
            {isLoading ? 'Processing...' : 'Clear'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModelSelector() {
  const { settings, updateSettings, isLoading } = useSettings();

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>Whisper Model</h2>
        <p className="settings-section-description">
          Choose the speech recognition model. Larger models are more accurate but download slower.
        </p>
      </div>

      <div className="settings-form-group">
        <label htmlFor="model-select" className="settings-label">
          Model Size
        </label>
        <div className="settings-select-wrapper">
          <select
            id="model-select"
            value={settings.whisperModel}
            onChange={(e) => updateSettings({ whisperModel: e.target.value as WhisperModel })}
            disabled={isLoading}
            className="settings-select"
            aria-label="Whisper model selection"
          >
            <option value="tiny">Tiny ({MODEL_SIZES.tiny})</option>
            <option value="base">Base ({MODEL_SIZES.base})</option>
            <option value="small">Small ({MODEL_SIZES.small})</option>
          </select>
        </div>
        <p className="settings-field-help">
          Current model: <strong>{settings.whisperModel}</strong> — {MODEL_SIZES[settings.whisperModel]}
        </p>
      </div>
    </section>
  );
}

function CacheManagement() {
  const { clearModelCache, isLoading, error } = useSettings();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearModelCache();
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to clear cache:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <section className="settings-section">
        <div className="settings-section-header">
          <h2>Model Cache</h2>
          <p className="settings-section-description">
            Clear downloaded AI models from your device. They'll be re-downloaded on next use.
          </p>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading || isClearing}
          className="settings-btn settings-btn-secondary"
          aria-label="Clear model cache"
        >
          Clear Model Cache
        </button>

        {error && <div className="settings-error-message">{error}</div>}
      </section>

      {showConfirm && (
        <ConfirmationModal
          title="Clear Model Cache?"
          message="This will delete all downloaded AI models from your device. They will be re-downloaded on next use. This cannot be undone."
          onConfirm={handleClearCache}
          onCancel={() => setShowConfirm(false)}
          isLoading={isClearing}
        />
      )}
    </>
  );
}

function HistoryClearing() {
  const { clearConversationHistory, isLoading, error } = useSettings();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearConversationHistory();
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <section className="settings-section">
        <div className="settings-section-header">
          <h2>Conversation History</h2>
          <p className="settings-section-description">
            Permanently delete all conversations and transcriptions from your device.
          </p>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading || isClearing}
          className="settings-btn settings-btn-secondary"
          aria-label="Clear conversation history"
        >
          Clear History
        </button>

        {error && <div className="settings-error-message">{error}</div>}
      </section>

      {showConfirm && (
        <ConfirmationModal
          title="Clear Conversation History?"
          message="This will permanently delete all conversations and transcriptions. This cannot be undone."
          onConfirm={handleClearHistory}
          onCancel={() => setShowConfirm(false)}
          isLoading={isClearing}
        />
      )}
    </>
  );
}

function ThemeToggle() {
  const { settings, updateSettings, isLoading } = useSettings();

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>Theme</h2>
        <p className="settings-section-description">Choose your preferred color scheme.</p>
      </div>

      <div className="settings-button-group">
        <button
          onClick={() => updateSettings({ theme: 'light' })}
          disabled={isLoading}
          aria-pressed={settings.theme === 'light'}
          className={`settings-theme-btn ${
            settings.theme === 'light' ? 'settings-theme-btn--active' : ''
          }`}
          aria-label="Light theme"
        >
          ☀️ Light
        </button>
        <button
          onClick={() => updateSettings({ theme: 'dark' })}
          disabled={isLoading}
          aria-pressed={settings.theme === 'dark'}
          className={`settings-theme-btn ${
            settings.theme === 'dark' ? 'settings-theme-btn--active' : ''
          }`}
          aria-label="Dark theme"
        >
          🌙 Dark
        </button>
      </div>
    </section>
  );
}

export function SettingsPage() {
  const { isLoading, error } = useSettings();

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-heading">Settings</h1>

        {error && !error.includes('Failed to') && (
          <div className="settings-error-banner">{error}</div>
        )}

        {isLoading ? (
          <div className="settings-loading">Loading settings...</div>
        ) : (
          <>
            <ModelSelector />
            <CacheManagement />
            <HistoryClearing />
            <ThemeToggle />

            <div className="settings-footer">
              <Link to="/" className="settings-back-link">
                Back to Chat Copilot
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
