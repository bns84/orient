/**
 * ORIENT - Escalation Level
 * 
 * Eskalationsstufen respektieren ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stille ist ein Feature
 * - Keine Push-Notifications
 * - Stufe 4 technisch gesperrt in Phase 1
 */

export enum EscalationLevel {
  OBSERVE = 0,  // unsichtbar / intern
  NOTE = 1,     // merken / Gedächtnis
  HINT = 2,     // sanfter Hinweis (optional)
  FRAME = 3,    // Einordnung / Konsequenzen
  // 4: Handlungsvorschlag ist in Phase 1 gesperrt (nicht implementieren)
}
