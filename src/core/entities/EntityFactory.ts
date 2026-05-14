/**
 * ORIENT - Entity Factory
 * 
 * Einheitliche Erstellung von Entities.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stabilität durch einheitliche Erstellung
 */

import { Entity } from './Entity';
import { EntityType } from './EntityType';

export class EntityFactory {
  /**
   * Erstellt eine neue Entity
   */
  static create(params: {
    id: string;
    type: EntityType;
    name: string;
    aliases?: string[];
    description?: string;
    createdAt?: Date;
  }): Entity {
    const createdAt = params.createdAt ?? new Date();

    if (!params.name.trim()) {
      throw new Error('Entity.name must not be empty');
    }

    return {
      id: params.id,
      type: params.type,
      name: params.name.trim(),
      aliases: params.aliases?.map((a) => a.trim()).filter(Boolean),
      description: params.description?.trim(),
      createdAt,
      updatedAt: createdAt,
    };
  }
}
