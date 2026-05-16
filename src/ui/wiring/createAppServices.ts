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

import type { LocalDatabase } from '../../infrastructure/storage/LocalDatabase';

import { ThreadRepositoryLocal } from '../../infrastructure/storage/ThreadRepository.local';
import { ImpulseRepositoryLocal } from '../../infrastructure/storage/ImpulseRepository.local';
import { EdgeRepositoryLocal } from '../../infrastructure/storage/EdgeRepository.local';

import { UserContextRepositoryLocal } from '../../infrastructure/storage/UserContextRepository.local';
import { ContextService } from '../../app/context/ContextService';

import { ThreadQueryService } from '../../app/queries/ThreadQueryService';
import { DailyQueryService } from '../../app/queries/DailyQueryService';
import { CaptureImpulseCommand } from '../../app/commands/CaptureImpulseCommand';
import { ArchiveThreadCommand } from '../../app/commands/ArchiveThreadCommand';
import { ExportThreadCommand } from '../../app/commands/ExportThreadCommand';
import { ExportOrchestrator } from '../../app/export/ExportOrchestrator';
import { MarkdownExportService } from '../../app/export/MarkdownExportService';
import { CursorPackExportService } from '../../app/export/CursorPackExportService';

export const createAppServices = (db: LocalDatabase) => {

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
  const captureImpulse = new CaptureImpulseCommand(impulseRepo as any);
  const archiveThread = new ArchiveThreadCommand(threadRepo as any);
  const exportOrchestrator = new ExportOrchestrator(
    threadQuery,
    dailyQuery,
    new MarkdownExportService(),
    new CursorPackExportService(),
  );
  const exportThread = new ExportThreadCommand(exportOrchestrator);

  return {
    db,
    threadRepo,
    impulseRepo,
    edgeRepo,
    contextService,
    threadQuery,
    dailyQuery,
    captureImpulse,
    archiveThread,
    exportThread,
  };
};
