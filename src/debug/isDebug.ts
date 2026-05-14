/**
 * ORIENT - Debug Gate
 * 
 * Prüft, ob Debug-Modus aktiviert ist.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (Debug standardmäßig aus)
 * - Transparenz (Debug kann aktiviert werden)
 */

export function isDebugEnabled() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('debug') === '1') return true;
  } catch {}
  return localStorage.getItem('orient_debug') === '1';
}
