export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err: unknown) => {
        // Log lifecycle failure — not user data
        console.error('[SW] Registration failed', { error: err });
      });
  });
}
