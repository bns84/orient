/**
 * ORIENT - Entity Domain Object
 * 
 * Entities sind Objekte der Welt:
 * Personen, Organisationen, Firmen, Projekte, Orte, Narrative.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Stabilität durch updatedAt
 */

import { EntityType } from './EntityType';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;

  aliases?: string[];
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}
