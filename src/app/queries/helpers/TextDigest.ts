/**
 * ORIENT - Text Digest Helpers
 * 
 * Ziel: kurze, ruhige Texte erzwingen (kein Geschwafel).
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Bedeutung vor Lautstärke
 */

/**
 * Begrenzt Array auf maximale Länge
 */
export const clampList = <T>(arr: T[], max: number): T[] => arr.slice(0, max);

/**
 * Begrenzt Text auf 1–2 Sätze (ca. 220 Zeichen)
 */
export const oneOrTwoSentences = (text: string): string => {
  const t = text.trim().replace(/\s+/g, ' ');
  // super simpel: begrenze auf ca. 220 Zeichen
  return t.length <= 220 ? t : t.slice(0, 217) + '…';
};

/**
 * Bereinigt Bullet-Point (entfernt führende Markierungen)
 */
export const safeBullet = (s: string): string =>
  s.trim().replace(/\s+/g, ' ').replace(/^[•\-]\s*/, '');
