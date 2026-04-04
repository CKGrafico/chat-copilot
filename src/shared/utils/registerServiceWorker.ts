const SW_PATH = import.meta.env.BASE_URL + 'sw.js';
const SW_SCOPE = import.meta.env.BASE_URL;

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
      .register(SW_PATH, { scope: SW_SCOPE })
      .then((registration) => {
        if (navigator.serviceWorker.controller) {
          notifySWReady();
        }

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

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          notifySWReady();
        });
      })
      .catch((err: unknown) => {
        console.error('[SW] Registration failed', { error: err });
      });
  });
}
