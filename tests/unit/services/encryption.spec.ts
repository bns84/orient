/**
 * ORIENT — Verschlüsselung (Roundtrip)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { decryptString, encryptString, isEncryptedBlob } from '../../../src/services/encryption';
import {
  getOrCreateMasterKey,
  resetMemoryMasterKeyForTests,
} from '../../../src/services/encryptionKeyStore';
import {
  sealImpulseContent,
  unsealImpulseContent,
} from '../../../src/services/impulseContentCrypto';
import { ImpulseRepositoryLocal } from '@infrastructure/storage/ImpulseRepository.local';
import { MemoryLocalDatabase } from '@infrastructure/storage/MemoryLocalDatabase';
import { ImpulseState } from '@core/impulses/ImpulseState';

describe('EncryptionService', () => {
  beforeEach(() => {
    resetMemoryMasterKeyForTests();
  });

  it('encrypts and decrypts a string (roundtrip)', async () => {
    const key = await getOrCreateMasterKey();
    const plain = 'Gedanke bleibt privat.';
    const blob = await encryptString(plain, key);

    expect(isEncryptedBlob(blob)).toBe(true);
    expect(blob.ct).not.toContain(plain);

    const back = await decryptString(blob, key);
    expect(back).toBe(plain);
  });

  it('seals and unseals impulse content fields', async () => {
    const sealed = await sealImpulseContent({
      text: 'Notiz',
      transcript: 'Sprachnotiz',
      payloadRef: 'voice:42',
    });

    expect(isEncryptedBlob(sealed.text)).toBe(true);
    expect(isEncryptedBlob(sealed.transcript)).toBe(true);
    expect(sealed.payloadRef).toBe('voice:42');

    const open = await unsealImpulseContent(sealed);
    expect(open.text).toBe('Notiz');
    expect(open.transcript).toBe('Sprachnotiz');
    expect(open.payloadRef).toBe('voice:42');
  });

  it('ImpulseRepository stores ciphertext at rest', async () => {
    const db = new MemoryLocalDatabase();
    const repo = new ImpulseRepositoryLocal(db);

    await repo.save({
      id: 'i-enc',
      content: { text: 'Geheim' },
      state: ImpulseState.DUST,
      createdAt: new Date(),
      links: { threadIds: [], entityIds: [] },
      meta: { pinned: false },
    });

    const raw = await db.get<{ content: { text?: unknown } }>('impulses', 'i-enc');
    expect(isEncryptedBlob(raw?.content.text)).toBe(true);

    const loaded = await repo.getById('i-enc');
    expect(loaded?.content.text).toBe('Geheim');
  });
});
