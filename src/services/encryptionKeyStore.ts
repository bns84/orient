/**
 * ORIENT — Master-Key lokal (IndexedDB), kein Cloud-Zwang
 */

const IDB_NAME = 'orient_crypto';
const IDB_STORE = 'keys';
const MASTER_KEY_ID = 'master-v1';

let memoryMasterKey: CryptoKey | null = null;

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadJwk(): Promise<JsonWebKey | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const getReq = tx.objectStore(IDB_STORE).get(MASTER_KEY_ID);
    getReq.onsuccess = () => {
      const value = getReq.result as JsonWebKey | undefined;
      resolve(value ?? null);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

async function saveJwk(jwk: JsonWebKey): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(jwk, MASTER_KEY_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

/**
 * Liefert den App-Master-Key (ein Gerät, Phase 1).
 * In Vitest/Node ohne IndexedDB: In-Memory-Key pro Prozess.
 */
export async function getOrCreateMasterKey(): Promise<CryptoKey> {
  if (typeof indexedDB === 'undefined') {
    if (!memoryMasterKey) {
      memoryMasterKey = await generateMasterKey();
    }
    return memoryMasterKey;
  }

  const existing = await loadJwk();
  if (existing) {
    return crypto.subtle.importKey('jwk', existing, { name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ]);
  }

  const key = await generateMasterKey();
  const jwk = await crypto.subtle.exportKey('jwk', key);
  await saveJwk(jwk);
  return key;
}

/** Nur für Tests */
export function resetMemoryMasterKeyForTests(): void {
  memoryMasterKey = null;
}
