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
import { WorkflowScreen } from '../features/workflow/components/WorkflowScreen';
import { PrivacyPage } from '../features/privacy/PrivacyPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { RootLayout } from './RootLayout';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <WorkflowScreen />,
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
      {
        path: '/privacy',
        element: <PrivacyPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

export default router;
