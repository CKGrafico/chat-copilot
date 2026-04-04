// Service Worker — Chat Copilot
// Handles: app shell caching, model caching, Web Share Target (Android)

const CACHE_NAME = 'chat-copilot-shell-v1';
const MODEL_CACHE_NAME = 'chat-copilot-models-v1';
const SHARED_FILES_DB = 'chat-copilot-shared';
const SHARED_FILES_STORE = 'shared-files';

const PRECACHE_URLS = ['./'];

const MODEL_URL_PATTERNS = [
  /huggingface\.co/,
  /cdn-lfs\.huggingface\.co/,
  /cdn-lfs-us-1\.huggingface\.co/,
  /\.onnx$/,
  /\.bin$/,
  /\.onnx_data$/,
];

function isModelRequest(url) {
  return MODEL_URL_PATTERNS.some((pattern) => pattern.test(url));
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|opus|ogg|m4a|webm|mp3|mp4|wav)$/.test(url.pathname);
}

// ── IndexedDB helpers for share target ───────────────────────────────────────

function openSharedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SHARED_FILES_DB, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(SHARED_FILES_STORE, { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeSharedFiles(files) {
  const db = await openSharedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SHARED_FILES_STORE, 'readwrite');
    const store = tx.objectStore(SHARED_FILES_STORE);
    store.clear();
    for (const file of files) {
      store.put(file);
    }
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ── Share Target POST handler ─────────────────────────────────────────────────

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const audioFiles = formData.getAll('audio').filter((f) => f instanceof File && f.size > 0);
    if (audioFiles.length > 0) {
      await storeSharedFiles(audioFiles);
    }
  } catch (err) {
    console.error('[SW] Share target error', err);
  }
  // Redirect back to the app root with ?shared=1 so the page can pick up the files
  const appRoot = new URL('./', self.registration.scope).href;
  return Response.redirect(appRoot + '?shared=1', 303);
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
              if (key.startsWith('chat-copilot-models-')) return true;
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
  const url = new URL(request.url);

  // Web Share Target: intercept POST to ./share-target
  if (request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith(handleShareTarget(request));
    return;
  }

  // Only cache GET requests
  if (request.method !== 'GET') return;

  if (isModelRequest(request.url)) {
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => Response.error());
        }),
      ),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./').then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  if (isStaticAsset(request)) {
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
});
