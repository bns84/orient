/**
 * ORIENT - Behavior Sensors
 * 
 * Rolling-window Aggregation aus Events.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (in-memory, keine Promises)
 * - Transparenz (alle Signale ableitbar)
 * - Keine Speicherung von Transkripten
 */

type Ring = { t: number; type: string; meta?: any };

const WINDOW_MS = 60_000;
const buf: Ring[] = [];

export function ingestBehaviorEvent(type: string, meta?: any, now = Date.now()) {
  buf.push({ t: now, type, meta });
  prune(now);
}

function prune(now: number) {
  const cutoff = now - WINDOW_MS;
  while (buf.length && buf[0].t < cutoff) buf.shift();
}

function count(now: number, prefix: string) {
  prune(now);
  return buf.filter((e) => e.type.startsWith(prefix)).length;
}

function countExact(now: number, t: string) {
  prune(now);
  return buf.filter((e) => e.type === t).length;
}

export function readBehaviorInputs(now = Date.now()): import('./types').BehaviorInputs {
  prune(now);

  const eventsLast60s = buf.length;
  const focusSwitchesLast60s =
    countExact(now, 'ui.focus.open') + countExact(now, 'ui.focus.close');

  // OPTIONAL: if you emit ui.scroll with depth 0..1 in meta.depth
  const scrollEvents = buf.filter((e) => e.type === 'ui.scroll' && typeof e.meta?.depth === 'number');
  const scrollDepthLast60s =
    scrollEvents.length ? Math.max(...scrollEvents.map((e) => e.meta.depth)) : 0;

  const holdsLast60s = countExact(now, 'voice.start');
  const abortsLast60s = countExact(now, 'voice.abort') + countExact(now, 'ui.quick_close');

  // voice stop events may include durationMs
  const voiceStops = buf.filter(
    (e) => e.type === 'voice.saved' && typeof e.meta?.durationMs === 'number',
  );
  const speechSecondsLast60s = voiceStops.reduce((a, e) => a + e.meta.durationMs / 1000, 0);

  // energy is optional; default 0.5
  const energies = buf
    .filter((e) => e.type === 'voice.energy' && typeof e.meta?.value === 'number')
    .map((e) => e.meta.value);
  const speechEnergyLast60s = energies.length ? energies[energies.length - 1] : 0.5;

  return {
    now,
    eventsLast60s,
    focusSwitchesLast60s,
    scrollDepthLast60s,
    holdsLast60s,
    abortsLast60s,
    speechSecondsLast60s,
    speechEnergyLast60s,
  };
}
