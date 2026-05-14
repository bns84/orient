/**
 * ORIENT - Thread Domain Object
 * 
 * Reines Domain-Objekt - keine Methoden, keine Side-Effects.
 * ORIENT denkt über Threads, nicht in Threads.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Keine automatische Löschung
 * - Stille ist ein Feature
 */

import { ThreadStatus } from './ThreadStatus';

export interface Thread {
  id: string;
  title: string;
  description?: string;

  status: ThreadStatus;

  createdAt: Date;
  updatedAt: Date;

  metrics: {
    recencyScore: number; // 0..1
    frequencyScore: number; // 0..1
    confidenceScore: number; // 0..1
    userRelevanceScore: number; // 0..1
  };

  // Optional: Tags, Color, Region (für Visualisierung)
  tags?: string[];
  colorSemantic?: string;
  regionHint?: { x: number; y: number; z: number };
}
