/**
 * ORIENT - Export Bundle
 * 
 * Container für Export-Ergebnisse.
 * Respektiert ORIENT_DNA: Transparenz, nachvollziehbare Metadaten.
 */

import { ExportTarget } from './ExportTarget';

export interface ExportBundle {
  target: ExportTarget;
  filename: string;
  content: string;
  meta?: {
    createdAt: Date;
    threadId?: string;
    note?: string;
  };
}
