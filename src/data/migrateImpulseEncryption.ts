/**
 * Einmalig: bestehende Impulse mit Verschlüsselung neu speichern
 */

import type { ImpulseRepository } from '../core/impulses/ImpulseRepository';
import { getMeta, setMeta } from './schema';
import type { Database } from 'sql.js';

const MIGRATION_KEY = 'migration.impulse_encryption_v1';

export async function migrateImpulseEncryptionIfNeeded(
  raw: Database,
  impulseRepo: ImpulseRepository,
): Promise<void> {
  if (getMeta(raw, MIGRATION_KEY) === 'done') {
    return;
  }

  const all = await impulseRepo.getAll();
  for (const impulse of all) {
    await impulseRepo.save(impulse);
  }

  setMeta(raw, MIGRATION_KEY, 'done');
}
