import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function RootLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
