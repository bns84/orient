/**
 * Befehle an den Pförtner selbst (kein Modell nötig, kostet nichts):
 * Regeln anlegen, ändern, ausschalten, anzeigen und das Tageslimit setzen.
 * Reiner Mustervergleich — ob sich zwei Regeln der Bedeutung nach überschneiden,
 * kann nur die KI beurteilen (Spezifikation Abschnitt 1) und ist noch nicht eingebaut.
 */

import { parseUntilClock } from '../time.js';

export type Command =
  | { type: 'set_limit'; usd: number }
  | { type: 'list_rules' }
  | { type: 'disable_rule'; index: number }
  | { type: 'replace_rule'; index: number; text: string }
  | { type: 'add_rule'; text: string; validUntil: number | null };

function toNumber(s: string): number {
  return Number(s.replace(',', '.'));
}

export function parseCommand(rawText: string, now: Date): Command | null {
  const text = rawText.trim().replace(/\s+/g, ' ');
  if (!text) return null;

  // Tageslimit auf 3 Dollar
  const limit = /\btageslimit\b[^0-9]{0,25}(\d+(?:[.,]\d+)?)/i.exec(text);
  if (limit && text.length <= 80) {
    const usd = toNumber(limit[1]!);
    if (Number.isFinite(usd) && usd >= 0) return { type: 'set_limit', usd };
  }

  // Welche Regeln gelten? / Zeig mir die Regeln
  if (
    /^(?:welche regeln (?:gelten|habe ich|hast du|gibt es)|zeig(?:e)?(?: mir)?(?: die| meine| alle)? regeln|regeln anzeigen|meine regeln)\b/i.test(
      text,
    )
  ) {
    return { type: 'list_rules' };
  }

  // Regel 2 ausschalten
  const off = /^regel (\d{1,3}) (?:ausschalten|abschalten|deaktivieren|löschen|loeschen|aus)\b/i.exec(text);
  if (off) return { type: 'disable_rule', index: Number(off[1]) };

  // Regel 2 ändern: neuer Text
  const change = /^regel (\d{1,3}) (?:ändern|aendern|ersetzen)\s*(?:zu|auf|in)?\s*[:\-]?\s*(.+)$/i.exec(text);
  if (change?.[2]) return { type: 'replace_rule', index: Number(change[1]), text: change[2].trim() };

  // „… speichere das als Regel.“
  const trailing =
    /^(.*?)[.,;:!\s]*(?:bitte\s+)?(?:speicher(?:e)?|merk(?:e)?\s+dir)\s+(?:das|dies|es)\s+als\s+regel\.?$/i.exec(
      text,
    );
  if (trailing?.[1] && trailing[1].trim().length > 3) {
    const rule = trailing[1].trim();
    return { type: 'add_rule', text: rule, validUntil: parseUntilClock(rule, now) };
  }

  // „Merk dir als Regel: …“
  const leading = /^(?:bitte\s+)?(?:merk(?:e)?\s+dir|speicher(?:e)?|leg|nimm)\b.{0,40}?\bals\s+regel\b[:,]?\s*(.+)$/i.exec(
    text,
  );
  if (leading?.[1]) {
    const rule = leading[1].trim();
    return { type: 'add_rule', text: rule, validUntil: parseUntilClock(rule, now) };
  }

  // „Regel: …“
  const prefix = /^(?:neue\s+)?regel\s*[:\-]\s*(.+)$/i.exec(text);
  if (prefix?.[1]) {
    const rule = prefix[1].trim();
    return { type: 'add_rule', text: rule, validUntil: parseUntilClock(rule, now) };
  }

  // „Ab jetzt immer / nie / nicht …“ (bewusst eng, damit normale Sätze nicht als Regel gelten)
  const fromNow =
    /^(?:ab jetzt|von jetzt an)\b[,:]?\s+(?:immer|nie|niemals|nicht|kein|keine|achte|achtest|beachte|sag|sprich|antworte|schreib|nutze|benutze|verwende|frag|fragst|unterbrich|nimm)\b.*/i.exec(
      text,
    );
  if (fromNow) {
    return { type: 'add_rule', text, validUntil: parseUntilClock(text, now) };
  }

  return null;
}
