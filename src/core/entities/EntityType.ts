/**
 * ORIENT - Entity Type
 * 
 * Typen für Entities (Objekte der Welt).
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz statt Blackbox
 * - Klare Struktur
 */

export enum EntityType {
  PERSON = 'PERSON',
  ORG = 'ORG',
  COMPANY = 'COMPANY',
  PROJECT = 'PROJECT',
  PLACE = 'PLACE',
  ASSET = 'ASSET',
  NARRATIVE = 'NARRATIVE',
  TOPIC = 'TOPIC',
}
