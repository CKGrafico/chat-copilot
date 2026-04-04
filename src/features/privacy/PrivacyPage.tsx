import { Link } from 'react-router-dom';
import './privacy.css';

export function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1 className="privacy-heading">Privacy & Data</h1>

        <section className="privacy-section">
          <h2>Your Data Stays Local</h2>
          <p>
            Chat Copilot is a fully local-first application. All data is stored on your device and never
            leaves it.
          </p>
          <ul className="privacy-list">
            <li>
              <strong>Audio files:</strong> Processed locally in your browser. No uploads to cloud services.
            </li>
            <li>
              <strong>Transcriptions:</strong> Generated locally using Whisper model in your browser. Stored in your device's IndexedDB.
            </li>
            <li>
              <strong>Profiles & Replies:</strong> Stored in local IndexedDB database. Never transmitted.
            </li>
            <li>
              <strong>Settings:</strong> Saved to your browser's localStorage. Local-only.
            </li>
            <li>
              <strong>Analytics:</strong> Optional event tracking stored locally. Disabled by default. No external tracking.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>How It Works</h2>
          <p>
            Chat Copilot uses three storage mechanisms, all local to your device:
          </p>
          <ol className="privacy-list">
            <li>
              <strong>Service Worker Cache:</strong> Caches AI models (Whisper, etc.) so they're only downloaded once.
            </li>
            <li>
              <strong>IndexedDB:</strong> Stores profiles, transcriptions, replies, and conversation history.
            </li>
            <li>
              <strong>localStorage:</strong> Stores user preferences and settings.
            </li>
          </ol>
          <p className="privacy-note">
            All three mechanisms are managed exclusively by your browser. No backend servers access this data.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Open Source</h2>
          <p>
            Chat Copilot is fully open source. You can review the code, contribute, or deploy your own instance.
          </p>
          <p>
            <a
              href="https://github.com/CKGrafico/chat-copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link"
            >
              View on GitHub: github.com/CKGrafico/chat-copilot
            </a>
          </p>
          <p className="privacy-note">
            License: MIT. You can use, modify, and redistribute this software freely.
          </p>
        </section>

        <section className="privacy-section">
          <h2>What We Don't Collect</h2>
          <ul className="privacy-list">
            <li>No personal information (name, email, etc.)</li>
            <li>No IP addresses or location data</li>
            <li>No third-party cookies or tracking pixels</li>
            <li>No external API calls (except during model download from Hugging Face CDN)</li>
            <li>No telemetry or usage analytics sent anywhere</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>Model Downloads</h2>
          <p>
            When you first use Chat Copilot, it downloads AI models (Whisper, etc.) from Hugging Face CDN to your device.
            This is a one-time download. Subsequent uses rely on cached models stored locally via your service worker.
          </p>
          <p className="privacy-note">
            You can clear model cache anytime in the settings. The cache is purely local to your browser.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Questions?</h2>
          <p>
            Since this is open source, you can inspect the code directly to verify our privacy claims.
            For questions or concerns, please{' '}
            <a
              href="https://github.com/CKGrafico/chat-copilot/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="privacy-link"
            >
              open an issue on GitHub
            </a>
            .
          </p>
        </section>

        <div className="privacy-footer">
          <Link to="/" className="privacy-back-link">
            Back to Chat Copilot
          </Link>
        </div>
      </div>
    </div>
  );
}
