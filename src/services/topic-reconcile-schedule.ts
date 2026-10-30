/**
 * Periodische Vollständig-Prüfung aller Impulse/Themen (localStorage).
 */

/** Standard: alle 6 Stunden eine Vollständig-Runde */
export const TOPIC_RECONCILE_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Prüf-Intervall, ob eine Runde fällig ist */
export const TOPIC_RECONCILE_CHECK_MS = 15 * 60 * 1000;

const STORAGE_KEY = 'orient.topicReconcile.lastFullAt';
/** Erhöhen nach Matching-Änderungen → erzwingt einmal Vollabgleich für alle Nutzer. */
const ENGINE_VERSION = '2';
const VERSION_KEY = 'orient.topicReconcile.engineVersion';

export function shouldRunPeriodicTopicReconcile(now = Date.now()): boolean {
  if (typeof localStorage === 'undefined') return true;
  if (localStorage.getItem(VERSION_KEY) !== ENGINE_VERSION) return true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;
  const last = Number(raw);
  if (!Number.isFinite(last)) return true;
  return now - last >= TOPIC_RECONCILE_INTERVAL_MS;
}

export function markPeriodicTopicReconcileDone(now = Date.now()): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(now));
  localStorage.setItem(VERSION_KEY, ENGINE_VERSION);
}

/** Startet Prüfung beim Mount und dann im Intervall. */
export function startTopicReconcileSchedule(
  onReconcile: () => void | Promise<void>,
): () => void {
  const tick = () => {
    if (!shouldRunPeriodicTopicReconcile()) return;
    void Promise.resolve(onReconcile());
  };
  tick();
  const id = setInterval(tick, TOPIC_RECONCILE_CHECK_MS);
  return () => clearInterval(id);
}
