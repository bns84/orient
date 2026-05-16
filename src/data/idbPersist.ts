/**
 * Persistiert sql.js DB-Export in IndexedDB (Browser only)
 */

const IDB_NAME = 'orient_sqlite';
const IDB_STORE = 'database';
const IDB_KEY = 'main';

export async function loadSqliteBlob(): Promise<Uint8Array | null> {
  if (typeof indexedDB === 'undefined') {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => {
      const tx = request.result.transaction(IDB_STORE, 'readonly');
      const getReq = tx.objectStore(IDB_STORE).get(IDB_KEY);
      getReq.onsuccess = () => {
        const result = getReq.result;
        resolve(result ? new Uint8Array(result) : null);
      };
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSqliteBlob(data: Uint8Array): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    return;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => {
      const tx = request.result.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(data, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}
