/**
 * ORIENT — Feldverschlüsselung (Web Crypto API, AES-GCM)
 */

export const ENCRYPTION_VERSION = 1 as const;
export const ENCRYPTION_ALG = 'AES-GCM' as const;

export type EncryptedBlob = {
  v: typeof ENCRYPTION_VERSION;
  alg: typeof ENCRYPTION_ALG;
  iv: string;
  ct: string;
};

const IV_BYTES = 12;

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function isEncryptedBlob(value: unknown): value is EncryptedBlob {
  if (!value || typeof value !== 'object') return false;
  const b = value as EncryptedBlob;
  return b.v === ENCRYPTION_VERSION && b.alg === ENCRYPTION_ALG && typeof b.iv === 'string' && typeof b.ct === 'string';
}

export async function encryptString(plaintext: string, key: CryptoKey): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ENCRYPTION_ALG, iv }, key, encoded);
  return {
    v: ENCRYPTION_VERSION,
    alg: ENCRYPTION_ALG,
    iv: toBase64(iv),
    ct: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptString(blob: EncryptedBlob, key: CryptoKey): Promise<string> {
  if (!isEncryptedBlob(blob)) {
    throw new Error('Invalid encrypted blob');
  }
  const iv = new Uint8Array(fromBase64(blob.iv)) as Uint8Array<ArrayBuffer>;
  const ct = new Uint8Array(fromBase64(blob.ct)) as Uint8Array<ArrayBuffer>;
  const plainBuffer = await crypto.subtle.decrypt({ name: ENCRYPTION_ALG, iv }, key, ct);
  return new TextDecoder().decode(plainBuffer);
}
