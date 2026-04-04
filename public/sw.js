// Service Worker — Chat Copilot
// M7 (#28): Added dedicated cache-first strategy for Whisper model files.
// Bump MODEL_CACHE_NAME to 'chat-copilot-models-v2' when the Whisper model changes.

const CACHE_NAME = 'chat-copilot-shell-v1';
const MODEL_CACHE_NAME = 'chat-copilot-models-v1';

// Assets pre-cached on install (app shell)
const PRECACHE_URLS = ['/'];

// Patterns that identify Whisper / large binary model requests
const MODEL_URL_PATTERNS = [
  /huggingface\.co/,
  /cdn-lfs\.huggingface\.co/,
  /cdn-lfs-us-1\.huggingface\.co/,
  /\.onnx$/,
  /\.bin$/,
  /\.onnx_data$/,
];

/**
 * Returns true when the URL matches a Hugging Face CDN or model binary asset.
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
            .filter((key) => {
              if (key === CACHE_NAME) return false;
              if (key === MODEL_CACHE_NAME) return false;
              // Delete any stale model caches from previous versions
              if (key.startsWith('chat-copilot-models-')) return true;
              // Delete any other stale shell caches
              return true;
            })
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
  if (isModelRequest(request.url)) {
    // Cache-first strategy for model files (large binary blobs)
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => Response.error());
        }),
      ),
    );
    return;
  }

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
