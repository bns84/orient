/**
 * ORIENT - App Services Wiring
 * 
 * Dependency Injection light.
 * Hier wird alles zusammengesteckt.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (klare Abhängigkeiten)
 * - Austauschbarkeit (Memory → IndexedDB später)
 */

import { MemoryLocalDatabase } from '../../infrastructure/storage/MemoryLocalDatabase';

import { ThreadRepositoryLocal } from '../../infrastructure/storage/ThreadRepository.local';
import { ImpulseRepositoryLocal } from '../../infrastructure/storage/ImpulseRepository.local';
import { EdgeRepositoryLocal } from '../../infrastructure/storage/EdgeRepository.local';

import { UserContextRepositoryLocal } from '../../infrastructure/storage/UserContextRepository.local';
import { ContextService } from '../../app/context/ContextService';

import { ThreadQueryService } from '../../app/queries/ThreadQueryService';
import { DailyQueryService } from '../../app/queries/DailyQueryService';

export const createAppServices = () => {
  const db = new MemoryLocalDatabase();

  const threadRepo = new ThreadRepositoryLocal(db);
  const impulseRepo = new ImpulseRepositoryLocal(db);
  const edgeRepo = new EdgeRepositoryLocal(db);

  const userContextRepo = new UserContextRepositoryLocal(db);
  const contextService = new ContextService(userContextRepo);

  const threadQuery = new ThreadQueryService({
    threadRepo: threadRepo as any,
    impulseRepo: impulseRepo as any,
    edgeRepo: edgeRepo as any,
  });
  const dailyQuery = new DailyQueryService(threadRepo as any, threadQuery);

  return {
    db,
    threadRepo,
    impulseRepo,
    edgeRepo,
    contextService,
    threadQuery,
    dailyQuery,
  };
};
