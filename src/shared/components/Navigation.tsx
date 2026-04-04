import { Link, useLocation } from 'react-router-dom';
import './navigation.css';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🎙️</span>
            <span className="logo-text">Chat Copilot</span>
          </Link>
        </div>

        <ul className="navigation-menu">
          <li>
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/profiles"
              className={`nav-link ${isActive('/profiles') ? 'nav-link--active' : ''}`}
              aria-current={isActive('/profiles') ? 'page' : undefined}
            >
              Profiles
            </Link>
          </li>
          <li>
            <Link
              to="/privacy"
              className={`nav-link ${isActive('/privacy') ? 'nav-link--active' : ''}`}
              aria-current={isActive('/privacy') ? 'page' : undefined}
            >
              Privacy & Open Source
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/CKGrafico/chat-copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link nav-link--external"
              aria-label="GitHub repository"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
