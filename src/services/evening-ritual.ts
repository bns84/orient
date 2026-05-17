/**
 * Abendritual — nach 21:00, 30 Min. Inaktivität, einmal pro Tag.
 */

import { kvGet, kvSet } from '../db/kv';
import { touchSessionActivity } from './morning-briefing';

const LAST_SHOWN_KEY = 'eveningRitual.lastShownDate';
const LAST_ACTIVE_KEY = 'session.lastActiveAt';
const EVENING_START_HOUR = 21;
const INACTIVITY_MS = 30 * 60 * 1000;

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Nach 21:00, ≥30 Min. seit letzter Aktivität, heute noch nicht gezeigt. */
export async function shouldShowEveningRitual(
  now = new Date(),
  lastActiveAt?: number,
): Promise<boolean> {
  if (now.getHours() < EVENING_START_HOUR) return false;

  const today = dayKey(now);
  const lastShown = await kvGet<string | null>(LAST_SHOWN_KEY, null);
  if (lastShown === today) return false;

  const lastActive =
    lastActiveAt ?? (await kvGet<number>(LAST_ACTIVE_KEY, 0));
  if (!lastActive) return false;

  return now.getTime() - lastActive >= INACTIVITY_MS;
}

export async function markEveningRitualShown(now = new Date()): Promise<void> {
  await kvSet(LAST_SHOWN_KEY, dayKey(now));
}

export async function dismissEveningRitual(now = new Date()): Promise<void> {
  await markEveningRitualShown(now);
  await touchSessionActivity(now);
}

export function buildEveningRitualLine(companionName: string): string {
  const name = companionName.trim() || 'ORIENT';
  return `${name}, gute Nacht. Gibt es noch etwas?`;
}

export const EVENING_AUTO_DISMISS_MS = 5000;
