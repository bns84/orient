/**
 * ORIENT - User Context Repository Local
 * 
 * Lokale Implementierung für User-Context.
 */

import { UserContextRepository } from '@core/context/UserContextRepository';
import { UserContext } from '@core/context/UserContext';
import { LocalDatabase } from './LocalDatabase';
import { ContextMode } from '@core/escalation/ContextMode';

const STORE = 'userContext';
const KEY = 'current';

export class UserContextRepositoryLocal implements UserContextRepository {
  constructor(private db: LocalDatabase) {}

  async getCurrent(): Promise<UserContext> {
    const existing = await this.db.get<UserContext>(STORE, KEY);
    if (existing) {
      return existing;
    }

    // Default: NORMAL mode
    const defaultContext: UserContext = {
      mode: ContextMode.NORMAL,
      hintBudgetPerDay: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.save(defaultContext);
    return defaultContext;
  }

  async save(context: UserContext): Promise<void> {
    const updated = {
      ...context,
      updatedAt: new Date(),
    };
    await this.db.put(STORE, KEY, updated);
  }
}
