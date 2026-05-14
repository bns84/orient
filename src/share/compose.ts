/**
 * ORIENT - Share Composer
 * 
 * Erzeugt menschenfreundliche "Gedanken-Karten" zum Teilen.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (kein JSON, kein DB-Wording)
 * - Menschliche Sprache ("Gedanke", nicht "Export")
 * - Transparenz (klare Struktur)
 */

export type ShareTopic = {
  key: string;
  title: string;
  summary?: string; // short
  bullets?: string[]; // 3-8
  link?: string; // optional
  source?: string; // optional
};

function trim(s: string, n: number) {
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

export function composeShareCard(topic: ShareTopic) {
  const date = new Date().toLocaleString();

  const title = trim(topic.title, 80);

  const bullets = (topic.bullets ?? [])
    .filter(Boolean)
    .slice(0, 5)
    .map((b) => `- ${trim(b, 140)}`);

  // fallback if no bullets
  const fallback = topic.summary ? [`- ${trim(topic.summary, 160)}`] : [];

  const why = topic.summary
    ? `Warum relevant: ${trim(topic.summary, 180)}`
    : `Warum relevant: Weil es ein möglicher Wendepunkt ist (bitte prüfen).`;

  const src = topic.source ? `Quelle: ${topic.source}` : null;
  const link = topic.link ? `Link: ${topic.link}` : null;

  const parts = [
    `ORIENT — Gedanke`,
    ``,
    `${title}`,
    ``,
    ...(bullets.length ? bullets : fallback),
    ``,
    `${why}`,
    ``,
    `Stand: ${date}`,
    src,
    link,
  ].filter(Boolean);

  return parts.join('\n');
}
