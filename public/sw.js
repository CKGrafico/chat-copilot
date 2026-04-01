// Service Worker — Chat Copilot
// M1: Static asset caching only. Model file caching is deferred to M7 (#28).

const CACHE_NAME = 'chat-copilot-shell-v1';

// Assets pre-cached on install (app shell)
const PRECACHE_URLS = ['/'];

// Patterns to skip caching entirely (Whisper / ffmpeg model files are large binary blobs)
const MODEL_URL_PATTERNS = [
  /\.onnx$/,
  /\.bin$/,
  /huggingface\.co/,
  /cdn-lfs/,
];

/**
 * Returns true when the URL matches a model/binary asset that must not be cached yet.
 * @param {string} url
 * @returns {boolean}
 */
function isModelRequest(url) {
  return MODEL_URL_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Returns true for same-origin static asset requests (JS, CSS, images, fonts, audio).
 * @param {Request} request
 * @returns {boolean}
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|opus|ogg|m4a|webm|mp3|mp4|wav)$/.test(url.pathname);
}

// ── Install ───────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Never cache model or large binary files
  if (isModelRequest(request.url)) return;

  if (request.mode === 'navigate') {
    // Navigation: network-first, fall back to cached root shell
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  if (isStaticAsset(request)) {
    // Static assets: cache-first, then network
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (!response.ok) return response;
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
              return response;
            });
          }),
      ),
    );
    return;
  }

  // All other same-origin requests: network-only (no caching)
});
