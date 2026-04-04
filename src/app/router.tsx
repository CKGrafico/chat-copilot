// TODO: Configure application routes using React Router v7.
// Expected routes:
//   /          — main workflow screen (share → transcribe → reply)
//   /profiles  — profile management screen
//   /settings  — app settings (stretch)
// See M7 issues for the full workflow screen implementation.

import { createBrowserRouter } from 'react-router-dom';
import { ShareScreen } from '../features/share/components/ShareScreen';
import { ProfileList } from '../features/profiles/components/ProfileList';
import { ReplyScreen } from '../features/reply/components/ReplyScreen';

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
  {
    path: '/share',
    element: <ShareScreen />,
  },
  {
    path: '/profiles',
    element: <ProfileList />,
  },
  {
    path: '/reply',
    element: <ReplyScreen transcriptionText="Sample transcription for testing." />,
  },
]);

export default router;
