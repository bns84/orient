/**
 * Das Gehirn des Pförtners: eine einzelne Datei auf dem Rechner (SQLite über sql.js).
 * Schraube 2 für den Umzug: Speicherort per ORIENT_DB_PATH.
 *
 * Jede Zeile trägt die Nutzer-Kennung (Spezifikation Abschnitt 9).
 * Nichts wird still gelöscht: Regeln werden ausgeschaltet, alte Fassungen bleiben.
 */

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Database, SqlJsStatic } from 'sql.js';

export type RuleKind = 'app' | 'ai' | 'work';
export type Role = 'user' | 'assistant';

export interface Rule {
  id: string;
  userId: string;
  text: string;
  /** app = „App prüft“, ai = „KI beachtet“, work = Arbeitsregel eines Auftrags */
  kind: RuleKind;
  /** Maske (Regelpaket je Situation). Im ersten Bau gilt überall „standard“. */
  mask: string;
  validFrom: number;
  validUntil: number | null;
  version: number;
  replacesId: string | null;
  active: boolean;
  createdAt: number;
}

export interface MessageRow {
  id: string;
  userId: string;
  role: Role;
  text: string;
  source: string;
  requestId: string;
  createdAt: number;
}

export interface UsageRow {
  id: string;
  userId: string;
  requestId: string;
  station: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  /** false = Anbieter lieferte keine Tokenzahlen */
  costKnown: boolean;
  createdAt: number;
}

export interface RequestSummary {
  requestId: string;
  createdAt: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  calls: number;
}

type Param = string | number | null;
type Row = Record<string, string | number | Uint8Array | null>;

const SCHEMA_VERSION = '1';

export class Brain {
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor(
    private readonly db: Database,
    private readonly path: string,
  ) {}

  static async open(path: string): Promise<Brain> {
    const require = createRequire(import.meta.url);
    const initSqlJs = require('sql.js') as (cfg?: {
      locateFile?: (file: string) => string;
    }) => Promise<SqlJsStatic>;
    const wasmDir = dirname(require.resolve('sql.js'));
    const SQL = await initSqlJs({ locateFile: (file) => join(wasmDir, file) });

    const inMemory = path === ':memory:';
    const db =
      !inMemory && existsSync(path) ? new SQL.Database(readFileSync(path)) : new SQL.Database();
    const brain = new Brain(db, inMemory ? '' : path);
    brain.migrate();
    brain.flush();
    return brain;
  }

  // ───────────────────────── Schema ─────────────────────────

  private migrate(): void {
    this.db.run(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL
      )`);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS rules (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        text TEXT NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('app','ai','work')),
        mask TEXT NOT NULL DEFAULT 'standard',
        valid_from INTEGER NOT NULL,
        valid_until INTEGER,
        version INTEGER NOT NULL DEFAULT 1,
        replaces_id TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      )`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_rules_user ON rules(user_id, active)`);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user','assistant')),
        text TEXT NOT NULL,
        source TEXT NOT NULL,
        request_id TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, created_at)`);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS usage (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        request_id TEXT NOT NULL,
        station TEXT NOT NULL,
        model TEXT NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        cost_usd REAL NOT NULL,
        cost_known INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      )`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_usage_user ON usage(user_id, created_at)`);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, key)
      )`);
    this.db.run(
      `INSERT INTO meta (key, value) VALUES ('schema_version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [SCHEMA_VERSION],
    );
  }

  // ───────────────────────── Grundfunktionen ─────────────────────────

  private all(sql: string, params: Param[] = []): Row[] {
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params);
      const rows: Row[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as Row);
      return rows;
    } finally {
      stmt.free();
    }
  }

  private run(sql: string, params: Param[] = []): void {
    this.db.run(sql, params);
    this.schedulePersist();
  }

  private ensureUser(userId: string, now: number): void {
    this.db.run(`INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)`, [userId, now]);
  }

  private schedulePersist(): void {
    if (!this.path || this.persistTimer) return;
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      this.flush();
    }, 150);
  }

  /** Schreibt die Datei sofort (atomar: erst temporär, dann umbenennen). */
  flush(): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    if (!this.path) return;
    mkdirSync(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.tmp`;
    writeFileSync(tmp, Buffer.from(this.db.export()));
    renameSync(tmp, this.path);
  }

  close(): void {
    this.flush();
    this.db.close();
  }

  // ───────────────────────── Nachrichten ─────────────────────────

  addMessage(m: Omit<MessageRow, 'id'>): void {
    this.ensureUser(m.userId, m.createdAt);
    this.run(
      `INSERT INTO messages (id, user_id, role, text, source, request_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), m.userId, m.role, m.text, m.source, m.requestId, m.createdAt],
    );
  }

  lastUserMessageAt(userId: string): number | null {
    const rows = this.all(
      `SELECT MAX(created_at) AS t FROM messages WHERE user_id = ? AND role = 'user'`,
      [userId],
    );
    const t = rows[0]?.t;
    return typeof t === 'number' ? t : null;
  }

  /** Die letzten Nachrichten, älteste zuerst. */
  recentMessages(userId: string, limit: number): MessageRow[] {
    const rows = this.all(
      `SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?`,
      [userId, limit],
    );
    return rows.reverse().map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      role: r.role as Role,
      text: String(r.text),
      source: String(r.source),
      requestId: String(r.request_id),
      createdAt: Number(r.created_at),
    }));
  }

  // ───────────────────────── Regeln ─────────────────────────

  private mapRule(r: Row): Rule {
    return {
      id: String(r.id),
      userId: String(r.user_id),
      text: String(r.text),
      kind: r.kind as RuleKind,
      mask: String(r.mask),
      validFrom: Number(r.valid_from),
      validUntil: r.valid_until === null ? null : Number(r.valid_until),
      version: Number(r.version),
      replacesId: r.replaces_id === null ? null : String(r.replaces_id),
      active: Number(r.active) === 1,
      createdAt: Number(r.created_at),
    };
  }

  addRule(input: {
    userId: string;
    text: string;
    kind?: RuleKind;
    validUntil?: number | null;
    now: number;
    mask?: string;
    version?: number;
    replacesId?: string | null;
  }): Rule {
    this.ensureUser(input.userId, input.now);
    const id = randomUUID();
    this.run(
      `INSERT INTO rules (id, user_id, text, kind, mask, valid_from, valid_until, version, replaces_id, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        id,
        input.userId,
        input.text,
        input.kind ?? 'ai',
        input.mask ?? 'standard',
        input.now,
        input.validUntil ?? null,
        input.version ?? 1,
        input.replacesId ?? null,
        input.now,
      ],
    );
    return this.getRule(id)!;
  }

  getRule(id: string): Rule | null {
    const rows = this.all(`SELECT * FROM rules WHERE id = ?`, [id]);
    return rows[0] ? this.mapRule(rows[0]) : null;
  }

  /** Alle Regeln, auch ausgeschaltete und abgelaufene (nichts wird gelöscht). */
  listRules(userId: string): Rule[] {
    return this.all(`SELECT * FROM rules WHERE user_id = ? ORDER BY created_at ASC, rowid ASC`, [
      userId,
    ]).map((r) => this.mapRule(r));
  }

  /** Regeln, die jetzt gelten: eingeschaltet, schon gültig, noch nicht abgelaufen. */
  activeRules(userId: string, nowMs: number, mask = 'standard'): Rule[] {
    return this.all(
      `SELECT * FROM rules
       WHERE user_id = ? AND active = 1 AND valid_from <= ?
         AND (valid_until IS NULL OR valid_until > ?)
         AND (mask = ? OR mask = 'immer')
       ORDER BY created_at ASC, rowid ASC`,
      [userId, nowMs, nowMs, mask],
    ).map((r) => this.mapRule(r));
  }

  setRuleActive(id: string, active: boolean): void {
    this.run(`UPDATE rules SET active = ? WHERE id = ?`, [active ? 1 : 0, id]);
  }

  /** Neue Fassung einer Regel. Die alte bleibt, ausgeschaltet, zum Zurückgehen. */
  replaceRule(oldId: string, newText: string, now: number): Rule | null {
    const old = this.getRule(oldId);
    if (!old) return null;
    this.setRuleActive(oldId, false);
    return this.addRule({
      userId: old.userId,
      text: newText,
      kind: old.kind,
      validUntil: old.validUntil,
      now,
      mask: old.mask,
      version: old.version + 1,
      replacesId: old.id,
    });
  }

  // ───────────────────────── Kosten ─────────────────────────

  addUsage(u: Omit<UsageRow, 'id'>): void {
    this.ensureUser(u.userId, u.createdAt);
    this.run(
      `INSERT INTO usage (id, user_id, request_id, station, model, input_tokens, output_tokens, cost_usd, cost_known, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        u.userId,
        u.requestId,
        u.station,
        u.model,
        u.inputTokens,
        u.outputTokens,
        u.costUsd,
        u.costKnown ? 1 : 0,
        u.createdAt,
      ],
    );
  }

  costSince(userId: string, sinceMs: number): number {
    const rows = this.all(
      `SELECT COALESCE(SUM(cost_usd), 0) AS c FROM usage WHERE user_id = ? AND created_at >= ?`,
      [userId, sinceMs],
    );
    return Number(rows[0]?.c ?? 0);
  }

  recentRequests(userId: string, limit: number): RequestSummary[] {
    return this.all(
      `SELECT request_id, MIN(created_at) AS t, SUM(input_tokens) AS i, SUM(output_tokens) AS o,
              SUM(cost_usd) AS c, COUNT(*) AS n
       FROM usage WHERE user_id = ? GROUP BY request_id ORDER BY t DESC LIMIT ?`,
      [userId, limit],
    ).map((r) => ({
      requestId: String(r.request_id),
      createdAt: Number(r.t),
      inputTokens: Number(r.i),
      outputTokens: Number(r.o),
      costUsd: Number(r.c),
      calls: Number(r.n),
    }));
  }

  usageForRequest(requestId: string): UsageRow[] {
    return this.all(`SELECT * FROM usage WHERE request_id = ? ORDER BY created_at ASC, rowid ASC`, [
      requestId,
    ]).map((r) => ({
      id: String(r.id),
      userId: String(r.user_id),
      requestId: String(r.request_id),
      station: String(r.station),
      model: String(r.model),
      inputTokens: Number(r.input_tokens),
      outputTokens: Number(r.output_tokens),
      costUsd: Number(r.cost_usd),
      costKnown: Number(r.cost_known) === 1,
      createdAt: Number(r.created_at),
    }));
  }

  // ───────────────────────── Einstellungen ─────────────────────────

  getSetting(userId: string, key: string): string | null {
    const rows = this.all(`SELECT value FROM settings WHERE user_id = ? AND key = ?`, [userId, key]);
    return rows[0] ? String(rows[0].value) : null;
  }

  setSetting(userId: string, key: string, value: string, now: number): void {
    this.ensureUser(userId, now);
    this.run(
      `INSERT INTO settings (user_id, key, value, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [userId, key, value, now],
    );
  }
}
