const swReadyCallbacks: Array<() => void> = [];
let swIsReady = false;

/**
 * Registers a callback that fires once the service worker is activated and
 * controlling the page. Safe to call before or after registration completes.
 */
export function onSWReady(callback: () => void): void {
  if (swIsReady) {
    callback();
    return;
  }
  swReadyCallbacks.push(callback);
}

function notifySWReady(): void {
  if (swIsReady) return;
  swIsReady = true;
  swReadyCallbacks.splice(0).forEach((cb) => cb());
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // If the SW is already active and controlling this page, fire immediately.
        if (navigator.serviceWorker.controller) {
          notifySWReady();
        }

        // Watch for the SW becoming active via statechange on an installing/waiting worker.
        const trackWorker = (worker: ServiceWorker | null) => {
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') notifySWReady();
          });
        };

        trackWorker(registration.installing ?? registration.waiting);
        registration.addEventListener('updatefound', () => {
          trackWorker(registration.installing);
        });

        // Fallback: controllerchange fires when the SW takes control after skipWaiting.
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          notifySWReady();
        });
      })
      .catch((err: unknown) => {
        // Log lifecycle failure — not user data
        console.error('[SW] Registration failed', { error: err });
      });
  });
}
