/**
 * Uhr und Zeitbezug (Tür 1). Alles in deutscher Zeit (Europe/Berlin).
 */

const TZ = 'Europe/Berlin';

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function localParts(d: Date): LocalParts {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const o: Record<string, number> = {};
  for (const p of f.formatToParts(d)) {
    if (p.type !== 'literal') o[p.type] = Number(p.value);
  }
  return o as unknown as LocalParts;
}

/** Abstand lokale Zeit minus UTC in Millisekunden zu einem Zeitpunkt. */
function offsetMs(d: Date): number {
  const p = localParts(d);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(d.getTime() / 1000) * 1000;
}

/** Deutsche Uhrzeit (Jahr, Monat, Tag, Stunde, Minute) → Zeitpunkt in ms. */
function localToMs(year: number, month: number, day: number, hour: number, minute: number): number {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  const guess = naive - offsetMs(new Date(naive));
  return naive - offsetMs(new Date(guess));
}

/** Beginn des heutigen Tages (0:00 Uhr deutscher Zeit) in ms. */
export function berlinDayStartMs(now: Date): number {
  const p = localParts(now);
  return localToMs(p.year, p.month, p.day, 0, 0);
}

/** Nächstes Mal HH:MM deutscher Zeit (heute, sonst morgen) in ms. */
export function nextBerlinClockMs(now: Date, hour: number, minute: number): number {
  const p = localParts(now);
  const today = localToMs(p.year, p.month, p.day, hour, minute);
  if (today > now.getTime()) return today;
  return localToMs(p.year, p.month, p.day + 1, hour, minute);
}

export function formatBerlin(d: Date): string {
  const date = new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
  const time = new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(d);
  return `${date}, ${time} Uhr`;
}

export function formatClock(ms: number): string {
  return `${new Intl.DateTimeFormat('de-DE', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(ms))} Uhr`;
}

/** „vor 2 Minuten“ — null = es gab noch keine frühere Nachricht. */
export function sinceText(ms: number | null): string {
  if (ms === null) return 'Es gab noch keine frühere Nachricht.';
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 45) return 'Die letzte Nachricht des Nutzers kam gerade eben (vor wenigen Sekunden).';
  const min = Math.round(s / 60);
  if (min < 60) {
    return `Die letzte Nachricht des Nutzers kam vor ${min} ${min === 1 ? 'Minute' : 'Minuten'}.`;
  }
  const h = Math.floor(min / 60);
  if (h < 24) {
    const rest = min % 60;
    const restText = rest >= 5 ? ` und ${rest} Minuten` : '';
    return `Die letzte Nachricht des Nutzers kam vor ${h} ${h === 1 ? 'Stunde' : 'Stunden'}${restText}.`;
  }
  const days = Math.floor(h / 24);
  return `Die letzte Nachricht des Nutzers kam vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}.`;
}

/**
 * „bis 21:30“ / „bis 21.30 Uhr“ / „bis 21 Uhr“ → Zeitpunkt (heute, sonst morgen).
 * Reine Zahlen wie „bis 5“ zählen nicht (zu leicht verwechselbar).
 */
export function parseUntilClock(text: string, now: Date): number | null {
  const withMinutes = /\bbis\s+(?:um\s+)?(\d{1,2})[:.](\d{2})\s*(?:uhr)?\b/i.exec(text);
  const hoursOnly = /\bbis\s+(?:um\s+)?(\d{1,2})\s*uhr\b/i.exec(text);
  const m = withMinutes ?? hoursOnly;
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = m[2] !== undefined ? Number(m[2]) : 0;
  if (!(hour >= 0 && hour < 24 && minute >= 0 && minute < 60)) return null;
  return nextBerlinClockMs(now, hour, minute);
}

/** 1,25 → „1,25“ (deutsches Komma). */
export function formatUsd(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
