/**
 * Verschlüsselt Impulse.content (text, transcript) at rest
 */

import type { ImpulseContent } from '../core/impulses/Impulse';
import { decryptString, encryptString, isEncryptedBlob, type EncryptedBlob } from './encryption';
import { getOrCreateMasterKey } from './encryptionKeyStore';

export type StoredImpulseContent = {
  text?: string | EncryptedBlob;
  transcript?: string | EncryptedBlob;
  payloadRef?: string;
};

async function sealField(value: string | undefined, key: CryptoKey): Promise<string | EncryptedBlob | undefined> {
  if (value === undefined || value === '') return value;
  if (isEncryptedBlob(value)) return value;
  return encryptString(value, key);
}

async function unsealField(
  value: string | EncryptedBlob | undefined,
  key: CryptoKey,
): Promise<string | undefined> {
  if (value === undefined || value === '') return value;
  if (typeof value === 'string') return value;
  if (isEncryptedBlob(value)) {
    return decryptString(value, key);
  }
  return undefined;
}

export async function sealImpulseContent(content: ImpulseContent): Promise<StoredImpulseContent> {
  const key = await getOrCreateMasterKey();
  return {
    text: await sealField(content.text, key),
    transcript: await sealField(content.transcript, key),
    payloadRef: content.payloadRef,
  };
}

export async function unsealImpulseContent(stored: StoredImpulseContent): Promise<ImpulseContent> {
  const key = await getOrCreateMasterKey();
  return {
    text: await unsealField(stored.text, key),
    transcript: await unsealField(stored.transcript, key),
    payloadRef: stored.payloadRef,
  };
}
