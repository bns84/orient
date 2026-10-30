/**
 * Die neun Türen. Reihenfolge und Zuschnitt laut Spezifikation Abschnitt 1.
 *
 * Im ersten Bau:
 *  1 Uhr            echt
 *  2 Regeln         echt (Kostenbremse, Verfallsdatum, Regel-Kartei, Befehle)
 *  3 Auftrag        eingebaut, leer
 *  4 Mappe packen   echt
 *  5 Datenschleuse  eingebaut, Tür offen (alles geht durch)
 *  6 Modell         echt
 *  7 Rückfrage      Anweisung steckt in der Mappe (Tür 4), keine Erkennung im Code
 *  8 Ausgang        Schleuse zurück; keine eigene Code-Regel auf die Antwort aktiv
 *  9 Speichern      echt
 */

import { ModelError, costUsd } from '../models/types.js';
import type { Rule } from '../store.js';
import { berlinDayStartMs, formatBerlin, formatClock, formatUsd, sinceText } from '../time.js';
import { parseCommand, type Command } from './commands.js';
import { buildSystemPrompt } from './prompt.js';
import { RequestCancelled, type Ctx, type Deps, type Station } from './types.js';

export function effectiveDailyLimit(deps: Deps, userId: string): number {
  const stored = deps.brain.getSetting(userId, 'daily_limit_usd');
  if (stored !== null) {
    const n = Number(stored);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return deps.config.dailyLimitUsd;
}

export function spentToday(deps: Deps, userId: string, now: Date): number {
  return deps.brain.costSince(userId, berlinDayStartMs(now));
}

function ruleLabel(rule: Rule): string {
  const art = rule.kind === 'app' ? 'App prüft' : rule.kind === 'work' ? 'Arbeitsregel' : 'KI beachtet';
  const dauer = rule.validUntil !== null ? `bis ${formatClock(rule.validUntil)}` : 'dauerhaft';
  return `${art}, ${dauer}`;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.!?\s]+$/g, '').replace(/\s+/g, ' ').trim();
}

function handleCommand(cmd: Command, ctx: Ctx, deps: Deps): string {
  const nowMs = ctx.now.getTime();
  const spent = spentToday(deps, ctx.userId, ctx.now);

  switch (cmd.type) {
    case 'set_limit': {
      deps.brain.setSetting(ctx.userId, 'daily_limit_usd', String(cmd.usd), nowMs);
      const extra = cmd.usd === 0 ? ' Bei 0 läuft keine Anfrage mehr an die KI.' : '';
      return `Tageslimit gespeichert: ${formatUsd(cmd.usd)} Dollar pro Tag. Heute bisher verbraucht: ${formatUsd(spent)} Dollar.${extra}`;
    }

    case 'list_rules': {
      const active = deps.brain.activeRules(ctx.userId, nowMs);
      const limit = effectiveDailyLimit(deps, ctx.userId);
      const fest = `Fest eingebaut: die Uhr, das Verfallsdatum der Regeln und die Kostenbremse (Tageslimit ${formatUsd(limit)} Dollar, heute bisher ${formatUsd(spent)}).`;
      if (active.length === 0) {
        return `Im Moment gelten keine eigenen Regeln. Sag zum Beispiel: „Merk dir als Regel: keine Floskeln.“\n${fest}`;
      }
      const lines = active.map((r, i) => `${i + 1}. ${r.text} (${ruleLabel(r)})`);
      return `Das gilt gerade:\n${lines.join('\n')}\n${fest}`;
    }

    case 'disable_rule': {
      const active = deps.brain.activeRules(ctx.userId, nowMs);
      const rule = active[cmd.index - 1];
      if (!rule) return `Eine Regel ${cmd.index} gibt es gerade nicht. Frag mich: „Welche Regeln gelten?“`;
      deps.brain.setRuleActive(rule.id, false);
      ctx.rulesChanged = true;
      return `Regel ${cmd.index} ist ausgeschaltet: „${rule.text}“. Sie bleibt gespeichert, sie gilt nur nicht mehr.`;
    }

    case 'replace_rule': {
      const active = deps.brain.activeRules(ctx.userId, nowMs);
      const rule = active[cmd.index - 1];
      if (!rule) return `Eine Regel ${cmd.index} gibt es gerade nicht. Frag mich: „Welche Regeln gelten?“`;
      const next = deps.brain.replaceRule(rule.id, cmd.text, nowMs);
      ctx.rulesChanged = true;
      return `Regel ${cmd.index} hat eine neue Fassung (Fassung ${next?.version ?? '?'}): „${cmd.text}“. Die alte Fassung bleibt gespeichert.`;
    }

    case 'add_rule': {
      const existing = deps.brain
        .activeRules(ctx.userId, nowMs)
        .find((r) => normalize(r.text) === normalize(cmd.text));
      if (existing) return `Diese Regel gibt es schon: „${existing.text}“. Ich lege sie nicht doppelt an.`;
      const rule = deps.brain.addRule({
        userId: ctx.userId,
        text: cmd.text,
        kind: 'ai',
        validUntil: cmd.validUntil,
        now: nowMs,
      });
      ctx.rulesChanged = true;
      const dauer =
        rule.validUntil !== null ? `Sie gilt bis ${formatClock(rule.validUntil)}.` : 'Sie gilt dauerhaft.';
      return `Gespeichert als Regel („KI beachtet“, hält meistens, aber nicht immer): „${rule.text}“ ${dauer}`;
    }
  }
}

// ───────────────────────── Die neun Türen ─────────────────────────

const door1Clock: Station = {
  id: 1,
  name: 'Uhr',
  skippable: false,
  run(ctx, deps) {
    ctx.lastMessageAt = deps.brain.lastUserMessageAt(ctx.userId);
    ctx.sinceLastMs =
      ctx.lastMessageAt === null ? null : Math.max(0, ctx.now.getTime() - ctx.lastMessageAt);
    ctx.timeLine = `${formatBerlin(ctx.now)}. ${sinceText(ctx.sinceLastMs)}`;
    return { note: ctx.timeLine };
  },
};

const door2Rules: Station = {
  id: 2,
  name: 'Regeln',
  skippable: false,
  run(ctx, deps) {
    const cmd = parseCommand(ctx.text, ctx.now);
    if (cmd) {
      ctx.answer = handleCommand(cmd, ctx, deps);
      ctx.shortCircuit = true;
      return { note: `Befehl: ${cmd.type}` };
    }

    const limit = effectiveDailyLimit(deps, ctx.userId);
    const spent = spentToday(deps, ctx.userId, ctx.now);
    if (spent >= limit) {
      ctx.answer =
        `Das Tageslimit von ${formatUsd(limit)} Dollar ist erreicht (heute bisher ${formatUsd(spent)} Dollar). ` +
        `Ich halte an, damit nichts weiter verbraucht wird. Mit „Tageslimit auf 5 Dollar“ hebst du es an.`;
      ctx.shortCircuit = true;
      ctx.persist = false;
      ctx.stopped = true;
      return { state: 'gestoppt', note: 'Kostenbremse' };
    }

    ctx.rules = deps.brain.activeRules(ctx.userId, ctx.now.getTime());
    return { note: `${ctx.rules.length} Regel(n) gelten` };
  },
};

const door3Task: Station = {
  id: 3,
  name: 'Auftrag',
  skippable: true,
  run() {
    return { state: 'leer', note: 'Aufträge mit Erfahrungsspeicher kommen später' };
  },
};

const door4Pack: Station = {
  id: 4,
  name: 'Mappe packen',
  skippable: true,
  run(ctx, deps) {
    ctx.system = buildSystemPrompt({
      companionName: ctx.companionName,
      now: ctx.now,
      sinceLastMs: ctx.sinceLastMs,
      rules: ctx.rules,
      taskNotes: ctx.taskNotes,
    });
    const history = deps.brain
      .recentMessages(ctx.userId, 12)
      .map((m) => ({ role: m.role, content: m.text }));
    while (history[0]?.role === 'assistant') history.shift();
    ctx.messages = [...history, { role: 'user' as const, content: ctx.text }];
    return { note: `${history.length} frühere Nachricht(en) dabei` };
  },
};

const door5Gate: Station = {
  id: 5,
  name: 'Datenschleuse',
  skippable: true,
  async run(ctx, deps) {
    await deps.gate.outbound(ctx);
    return { state: 'leer', note: 'Tür offen, alles geht durch (Test mit echten Daten)' };
  },
};

const door6Model: Station = {
  id: 6,
  name: 'Modell',
  skippable: true,
  async run(ctx, deps) {
    const model = deps.model;
    ctx.modelLabel = model.label;

    if (!model.ready) {
      ctx.failed = true;
      ctx.persist = false;
      ctx.shortCircuit = true;
      ctx.answer = `Ich kann gerade nicht denken: Es fehlt der Schlüssel für ${model.label}. Er gehört in die Datei server\\.env.`;
      return { state: 'gestoppt', note: 'kein Schlüssel' };
    }

    // Zeitlimit und Abbruch des Nutzers zusammenführen
    const controller = new AbortController();
    const abortNow = () => controller.abort();
    if (ctx.signal.aborted) abortNow();
    ctx.signal.addEventListener('abort', abortNow, { once: true });
    const timer = setTimeout(abortNow, deps.config.requestTimeoutMs);

    try {
      const res = await model.complete({
        system: ctx.system,
        messages: ctx.messages,
        maxTokens: deps.config.maxTokens,
        signal: controller.signal,
      });

      const entry = {
        station: 'modell',
        model: model.model,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
        costUsd: costUsd(model.prices, res.inputTokens, res.outputTokens),
        costKnown: res.usageKnown,
      };
      ctx.usage.push(entry);
      // Sofort festhalten: Was bezahlt wurde, geht auch bei Abbruch nicht verloren.
      deps.brain.addUsage({
        userId: ctx.userId,
        requestId: ctx.requestId,
        createdAt: ctx.now.getTime(),
        ...entry,
      });

      ctx.modelText = res.text;
      return {
        note: `${model.label} (${model.model}): ${res.inputTokens} rein, ${res.outputTokens} raus`,
      };
    } catch (err) {
      if (ctx.signal.aborted) throw new RequestCancelled();
      ctx.failed = true;
      ctx.persist = false;
      ctx.shortCircuit = true;
      if (err instanceof ModelError && err.code === 'aborted') {
        ctx.answer = `Das hat zu lange gedauert (mehr als ${Math.round(deps.config.requestTimeoutMs / 1000)} Sekunden). Versuch es gleich noch einmal.`;
      } else {
        ctx.answer = `Das hat nicht geklappt: ${err instanceof Error ? err.message : String(err)}`;
      }
      return { state: 'gestoppt', note: err instanceof Error ? err.message : 'Fehler' };
    } finally {
      clearTimeout(timer);
      ctx.signal.removeEventListener('abort', abortNow);
    }
  },
};

const door7Blocked: Station = {
  id: 7,
  name: 'Rückfrage bei „geht nicht“',
  skippable: true,
  run() {
    return { state: 'leer', note: 'Die Anweisung steckt in der Mappe (Tür 4); keine Erkennung im Code' };
  },
};

const door8Out: Station = {
  id: 8,
  name: 'Ausgang',
  skippable: true,
  async run(ctx, deps) {
    await deps.gate.inbound(ctx);
    const text = (ctx.modelText ?? '').trim();
    if (!text) {
      ctx.failed = true;
      ctx.persist = false;
      ctx.answer = 'Die KI hat nichts geantwortet. Versuch es noch einmal.';
      return { state: 'gestoppt', note: 'leere Antwort' };
    }
    ctx.answer = text;
    return { note: 'Antwort durch die Schleuse zurück; keine Code-Regel auf die Antwort aktiv' };
  },
};

const door9Save: Station = {
  id: 9,
  name: 'Anzeigen und Speichern',
  skippable: false,
  run(ctx, deps) {
    if (ctx.persist && ctx.answer) {
      const at = ctx.now.getTime();
      deps.brain.addMessage({
        userId: ctx.userId,
        role: 'user',
        text: ctx.text,
        source: ctx.source,
        requestId: ctx.requestId,
        createdAt: at,
      });
      deps.brain.addMessage({
        userId: ctx.userId,
        role: 'assistant',
        text: ctx.answer,
        source: ctx.source,
        requestId: ctx.requestId,
        createdAt: at + 1,
      });
    }
    return { note: ctx.persist ? 'Nachricht und Antwort gespeichert' : 'nichts in den Verlauf geschrieben' };
  },
};

export const STATIONS: Station[] = [
  door1Clock,
  door2Rules,
  door3Task,
  door4Pack,
  door5Gate,
  door6Model,
  door7Blocked,
  door8Out,
  door9Save,
];
