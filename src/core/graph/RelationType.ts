/**
 * ORIENT - Relation Type
 * 
 * Semantik aus ORIENT_SYSTEMLOGIC.md.
 * Minimal startbar, erweiterbar.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Klare Semantik
 */

export enum RelationType {
  RELATED_TO = 'RELATED_TO',
  SUPPORTS = 'SUPPORTS',
  CONTRADICTS = 'CONTRADICTS',
  INFLUENCES = 'INFLUENCES',
  REACTIVATES = 'REACTIVATES',
  OCCURS_WITH = 'OCCURS_WITH',
}
