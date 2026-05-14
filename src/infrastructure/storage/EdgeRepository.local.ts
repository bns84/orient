/**
 * ORIENT - Edge Repository (Local)
 * 
 * Lokale Implementierung des Edge-Repositories.
 * Edges sind besonders wichtig → bewusst separat.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first
 * - Keine Businesslogik im Storage
 * - Vorbereitet für Verschlüsselung
 */

import { Repository } from '@core/storage/Repository';
import { Edge } from '@core/graph/Edge';
import { LocalDatabase } from './LocalDatabase';

const STORE = 'edges';

export class EdgeRepositoryLocal implements Repository<Edge> {
  constructor(private db: LocalDatabase) {}

  async save(edge: Edge): Promise<void> {
    await this.db.put(STORE, edge.id, edge);
  }

  async getById(id: string): Promise<Edge | null> {
    return this.db.get<Edge>(STORE, id);
  }

  async getAll(): Promise<Edge[]> {
    return this.db.getAll<Edge>(STORE);
  }
}
