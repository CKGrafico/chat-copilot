// Compose all React context providers here so main.tsx stays clean.
// Expected providers to add as features are built:
//   - RouterProvider (react-router-dom) ← already wired
//   - ProfilesProvider (from features/profiles) — M5
//   - ErrorBoundary — M7 ✅
//   - ThemeProvider — if needed

import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { initDB } from '../shared/storage/db';
import { seedDefaultProfile } from '../features/profiles/seedProfiles';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { GlobalErrorHandler } from '../shared/components/GlobalErrorHandler';
import { SettingsProvider } from '../shared/contexts/SettingsContext';
import '../shared/styles/theme.css';
import router from './router';

export function Providers() {
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initDB()
      .then(() => seedDefaultProfile())
      .then(() => setReady(true))
      .catch((err: unknown) => {
        console.error('[Providers] DB init failed:', err);
        setInitError('Failed to initialise storage. Please reload the app.');
      });
  }, []);

  return (
    <ErrorBoundary>
      {initError ? (
        <p role="alert" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          {initError}
        </p>
      ) : !ready ? (
        <p style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          Loading…
        </p>
      ) : (
        <SettingsProvider>
          <>
            <GlobalErrorHandler />
            <RouterProvider router={router} />
          </>
        </SettingsProvider>
      )}
    </ErrorBoundary>
  );
}
