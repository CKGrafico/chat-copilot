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

  if (initError) {
    return (
      <p role="alert" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        {initError}
      </p>
    );
  }

  if (!ready) {
    return (
      <p style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        Loading…
      </p>
    );
  }

  return (
    <ErrorBoundary>
      <GlobalErrorHandler />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
