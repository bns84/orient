/**
 * ORIENT - Debounce Helper
 * 
 * Minimaler Debounce-Helper.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (debounced saves)
 */

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: number | null = null;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}
