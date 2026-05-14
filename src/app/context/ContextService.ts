/**
 * ORIENT - Context Service
 * 
 * Service für User-Context-Verwaltung.
 * 
 * Respektiert ORIENT_DNA:
 * - Kontext beeinflusst Intensität, nicht Inhalte
 * - Stille ist ein Feature
 */

import { UserContextRepository } from '@core/context/UserContextRepository';
import { UserContext } from '@core/context/UserContext';
import { ContextMode } from '@core/escalation/ContextMode';

export class ContextService {
  constructor(private repo: UserContextRepository) {}

  async getCurrent(): Promise<UserContext> {
    return this.repo.getCurrent();
  }

  async setMode(mode: ContextMode): Promise<void> {
    const current = await this.getCurrent();
    const updated: UserContext = {
      ...current,
      mode,
      updatedAt: new Date(),
    };
    await this.repo.save(updated);
  }
}
