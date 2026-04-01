// TODO: Configure application routes using React Router v7.
// Expected routes:
//   /          — main workflow screen (share → transcribe → reply)
//   /profiles  — profile management screen
//   /settings  — app settings (stretch)
// See M7 issues for the full workflow screen implementation.

import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      // TODO: Replace with the real WorkflowScreen component from M7
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h1>Chat Copilot</h1>
        <p>Loading…</p>
      </div>
    ),
  },
]);

export default router;
