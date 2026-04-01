// TODO: Compose all React context providers here so main.tsx stays clean.
// Expected providers to add as features are built:
//   - RouterProvider (react-router-dom) ← already wired
//   - ProfilesProvider (from features/profiles) — M5
//   - ErrorBoundary — M7
//   - ThemeProvider — if needed

import { RouterProvider } from 'react-router-dom';
import router from './router';

export function Providers() {
  return <RouterProvider router={router} />;
}
