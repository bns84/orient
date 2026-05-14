/**
 * ORIENT - Core Types
 * 
 * Alle Typen respektieren die ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Local-first
 * - Stille ist ein Feature
 * - Keine automatische Löschung
 */

// Thread Status
export type ThreadStatus = 'ACTIVE' | 'OBSERVED' | 'DORMANT' | 'CLOSED';

// Impulse State
export type ImpulseState = 'DUST' | 'CLOUD';

// Importance Hint (nur Nutzer-Input, keine Auto-Bewertung)
export type ImportanceHint = 'LOW' | 'MED' | 'HIGH';

// Entity Types
export type EntityType = 
  | 'PERSON' 
  | 'ORG' 
  | 'COMPANY' 
  | 'PROJECT' 
  | 'PLACE' 
  | 'ASSET' 
  | 'NARRATIVE' 
  | 'TOPIC';

// Edge Relation Types
export type RelationType = 
  | 'RELATED_TO' 
  | 'SUPPORTS' 
  | 'CONTRADICTS' 
  | 'INFLUENCES' 
  | 'REACTIVATES' 
  | 'OCCURS_WITH';

// Context Modes
export type ContextMode = 'QUIET' | 'FOCUS' | 'SOCIAL' | 'FAMILY' | 'TRAVEL';

// Source Types
export type SourceType = 'OFFICIAL' | 'EXPERT' | 'SEMI' | 'UNDERGROUND';

// Claim Types
export type ClaimType = 'FACT' | 'THESIS' | 'INTERPRETATION' | 'RUMOR' | 'UNKNOWN';

// Export Modes
export type ExportMode = 
  | 'WRITING' 
  | 'EXPLAIN' 
  | 'BUILD' 
  | 'OVERVIEW' 
  | 'README' 
  | 'SLIDE_OUTLINE' 
  | 'RAW';

// Export Formats
export type ExportFormat = 'MARKDOWN' | 'TEXT' | 'JSON';

// Color Semantics
export type ColorSemantic = 'BLUE' | 'GREEN' | 'VIOLET' | 'GOLD' | 'YELLOW' | 'WHITE';

// Eskalation Stufen (0-3, Stufe 4 technisch gesperrt)
export type EscalationLevel = 0 | 1 | 2 | 3;
