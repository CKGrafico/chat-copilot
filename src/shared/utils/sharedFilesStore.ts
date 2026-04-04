/**
 * IndexedDB store for files received via Web Share Target (Android).
 * The service worker writes files here after a share POST; the app reads them
 * on load when `?shared=1` is present in the URL.
 */

const DB_NAME = 'chat-copilot-shared';
const STORE_NAME = 'shared-files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME, { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Read all files stored by the service worker share target handler. */
export async function getSharedFiles(): Promise<File[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => { db.close(); resolve(req.result as File[]); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

/** Remove all stored shared files (call after consuming them). */
export async function clearSharedFiles(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
