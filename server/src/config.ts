/**
 * ORIENT-Pförtner — Einstellungen.
 *
 * Vier Schrauben für den späteren Umzug (Spezifikation Abschnitt 9, dazu das Ohr):
 *  1. Adresse des Servers   → ORIENT_HOST / ORIENT_PORT (die App kennt nur diese Adresse)
 *  2. Speicherort der Datenbank → ORIENT_DB_PATH
 *  3. Modellanschluss       → ORIENT_MODEL + Schlüssel/Modellnamen
 *  4. Adresse des Dolmetschers (Ohr/Whisper) → ORIENT_EAR_URL
 *
 * Schlüssel stehen nur hier (Datei server/.env), nie im Browser.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type ModelChoice = 'anthropic' | 'openai' | 'mock';

export interface Prices {
  /** US-Dollar je 1 Million Tokens (Eingabe) */
  inputPerMillion: number;
  /** US-Dollar je 1 Million Tokens (Ausgabe) */
  outputPerMillion: number;
}

export interface Config {
  projectRoot: string;
  host: string;
  port: number;
  userId: string;
  activeModel: ModelChoice;
  anthropic: { apiKey: string; model: string; prices: Prices };
  openai: { apiKey: string; model: string; baseUrl: string; prices: Prices };
  dbPath: string;
  dailyLimitUsd: number;
  maxTokens: number;
  requestTimeoutMs: number;
  allowedOrigins: string[];
  /** Das Ohr: Adresse des Dolmetschers (vierte Schraube) */
  ear: { mode: 'whisper' | 'mock'; url: string; timeoutMs: number };
}

export function findProjectRoot(start: string = dirname(fileURLToPath(import.meta.url))): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return process.cwd();
}

export function parseEnvText(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function num(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const n = Number(value.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function str(value: string | undefined, fallback: string): string {
  const v = value?.trim();
  return v ? v : fallback;
}

export interface LoadConfigOptions {
  root?: string;
  /** Eigene Umgebung (Tests). Standard: process.env */
  env?: Record<string, string | undefined>;
  /** false = keine server/.env lesen (Tests) */
  readEnvFile?: boolean;
}

export function loadConfig(options: LoadConfigOptions = {}): Config {
  const projectRoot = options.root ?? findProjectRoot();
  const envFilePath = join(projectRoot, 'server', '.env');
  const fileEnv =
    options.readEnvFile !== false && existsSync(envFilePath)
      ? parseEnvText(readFileSync(envFilePath, 'utf8'))
      : {};
  const env: Record<string, string | undefined> = { ...fileEnv, ...(options.env ?? process.env) };

  const modelRaw = str(env.ORIENT_MODEL, 'anthropic').toLowerCase();
  const activeModel: ModelChoice =
    modelRaw === 'openai' || modelRaw === 'mock' || modelRaw === 'anthropic' ? modelRaw : 'anthropic';

  // Preise: Standard laut ORIENT_KI-Anbieter_Recherche.md (Stand 29.10.2026,
  // Claude Sonnet 5.5 und gpt-6.1-sol je 2 / 10 Dollar je 1 Mio. Tokens). Überschreibbar.
  const dbPathRaw = str(env.ORIENT_DB_PATH, join('server', 'data', 'orient-brain.sqlite'));
  const dbPath = dbPathRaw === ':memory:' || isAbsolute(dbPathRaw) ? dbPathRaw : resolve(projectRoot, dbPathRaw);

  return {
    projectRoot,
    host: str(env.ORIENT_HOST, '127.0.0.1'),
    port: Math.round(num(env.ORIENT_PORT, 8787)),
    userId: str(env.ORIENT_USER_ID, 'local-user'),
    activeModel,
    anthropic: {
      apiKey: str(env.ANTHROPIC_API_KEY, ''),
      model: str(env.ANTHROPIC_MODEL, 'claude-sonnet-5-5'),
      prices: {
        inputPerMillion: num(env.ANTHROPIC_PRICE_IN_USD, 2),
        outputPerMillion: num(env.ANTHROPIC_PRICE_OUT_USD, 10),
      },
    },
    openai: {
      apiKey: str(env.OPENAI_API_KEY, ''),
      model: str(env.OPENAI_MODEL, 'gpt-6.1-sol'),
      baseUrl: str(env.OPENAI_BASE_URL, 'https://api.openai.com/v1').replace(/\/$/, ''),
      prices: {
        inputPerMillion: num(env.OPENAI_PRICE_IN_USD, 2),
        outputPerMillion: num(env.OPENAI_PRICE_OUT_USD, 10),
      },
    },
    dbPath,
    dailyLimitUsd: num(env.ORIENT_DAILY_LIMIT_USD, 2),
    maxTokens: Math.max(64, Math.round(num(env.ORIENT_MAX_TOKENS, 1024))),
    requestTimeoutMs: Math.max(5_000, Math.round(num(env.ORIENT_TIMEOUT_MS, 90_000))),
    allowedOrigins: str(env.ORIENT_ALLOWED_ORIGINS, 'http://localhost:3000,http://127.0.0.1:3000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    ear: {
      mode: str(env.ORIENT_EAR, 'whisper').toLowerCase() === 'mock' ? 'mock' : 'whisper',
      url: str(env.ORIENT_EAR_URL, 'http://127.0.0.1:8788').replace(/\/$/, ''),
      timeoutMs: Math.max(5_000, Math.round(num(env.ORIENT_EAR_TIMEOUT_MS, 120_000))),
    },
  };
}
