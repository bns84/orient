/**
 * Testlauf: dieselben Eingaben nacheinander an Claude und ChatGPT, mit denselben Regeln.
 * Ergebnis: eine Datei zum Nachlesen und Bewerten (server/testlauf/ergebnis-….md).
 *
 * Die Eingaben und Regeln legst du fest (Dateien in server/testlauf/):
 *   eingaben.txt  — eine Eingabe pro Zeile
 *   regeln.txt    — eine Regel pro Zeile („KI beachtet“)
 * Zeilen mit # am Anfang und leere Zeilen werden ignoriert.
 * Die Prüfung läuft in einer eigenen Wegwerf-Datenbank, dein echtes Gedächtnis bleibt unberührt.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig, type ModelChoice } from './config.js';
import { createModels } from './models/index.js';
import { Orient, type AskResult } from './orient.js';
import { Brain } from './store.js';
import { formatUsd } from './time.js';

export function readLines(path: string): string[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('#'));
}

interface Row {
  input: string;
  result: AskResult;
}

async function runForModel(
  choice: ModelChoice,
  inputs: string[],
  rules: string[],
): Promise<{ label: string; modelName: string; rows: Row[]; totalCost: number } | null> {
  const config = loadConfig();
  const models = createModels(config);
  const model = models[choice];
  if (!model.ready) return null;

  const brain = await Brain.open(':memory:');
  const testConfig = { ...config, userId: 'testlauf', dbPath: ':memory:' };
  const orient = new Orient(brain, model, testConfig);
  const now = Date.now();
  for (const rule of rules) {
    brain.addRule({ userId: 'testlauf', text: rule, kind: 'ai', now });
  }

  const rows: Row[] = [];
  let totalCost = 0;
  for (const input of inputs) {
    const result = await orient.ask({ text: input, source: 'text' });
    totalCost += result.usage.costUsd;
    rows.push({ input, result });
    console.log(`  ${model.label}: ${rows.length}/${inputs.length} erledigt`);
  }
  brain.close();
  return { label: model.label, modelName: model.model, rows, totalCost };
}

async function main(): Promise<void> {
  const config = loadConfig();
  const dir = join(config.projectRoot, 'server', 'testlauf');
  mkdirSync(dir, { recursive: true });
  const inputs = readLines(join(dir, 'eingaben.txt'));
  const rules = readLines(join(dir, 'regeln.txt'));

  if (inputs.length === 0) {
    console.log('Es gibt noch keine Eingaben für den Testlauf.');
    console.log(`Lege die Datei an: ${join(dir, 'eingaben.txt')} (eine Eingabe pro Zeile).`);
    return;
  }

  console.log(`Testlauf: ${inputs.length} Eingaben, ${rules.length} Regeln.`);
  const choices: ModelChoice[] = ['anthropic', 'openai'];
  const runs: NonNullable<Awaited<ReturnType<typeof runForModel>>>[] = [];
  const skipped: string[] = [];

  for (const choice of choices) {
    const run = await runForModel(choice, inputs, rules);
    if (run) runs.push(run);
    else skipped.push(choice === 'anthropic' ? 'Claude' : 'ChatGPT');
  }

  if (runs.length === 0) {
    console.log('Kein Modell hat einen Schlüssel. Trage ihn in server\\.env ein.');
    return;
  }

  const stamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  const out: string[] = [];
  out.push(`# ORIENT — Testlauf ${stamp}`, '');
  out.push(`Modelle: ${runs.map((r) => `${r.label} (${r.modelName})`).join(' · ')}`);
  if (skipped.length) out.push(`Nicht gelaufen (kein Schlüssel): ${skipped.join(', ')}`);
  out.push('', '## Regeln, die galten', '');
  out.push(...(rules.length ? rules.map((r, i) => `${i + 1}. ${r}`) : ['(keine)']));
  out.push('', '## Kosten gesamt', '');
  for (const r of runs) out.push(`- ${r.label}: ${formatUsd(r.totalCost)} Dollar`);

  inputs.forEach((input, i) => {
    out.push('', `## Eingabe ${i + 1}`, '', `> ${input}`);
    for (const r of runs) {
      const row = r.rows[i]!;
      out.push('', `### ${r.label}`, '', row.result.answer || '(keine Antwort)', '');
      out.push(
        `Tokens: ${row.result.usage.inputTokens} rein, ${row.result.usage.outputTokens} raus · Kosten: ${formatUsd(row.result.usage.costUsd)} Dollar · Status: ${row.result.status}`,
      );
      out.push('', 'Regeln gehalten? ja / teilweise / nein: ___');
    }
  });

  const file = join(dir, `ergebnis-${stamp}.md`);
  writeFileSync(file, `${out.join('\n')}\n`, 'utf8');
  console.log(`\nFertig. Ergebnis: ${file}`);
}

// Nur ausführen, wenn die Datei direkt gestartet wird (nicht beim Import in Tests)
const invokedDirectly = process.argv[1]?.replace(/\\/g, '/').endsWith('/testlauf.js') ?? false;
if (invokedDirectly) {
  main().catch((err: unknown) => {
    console.error('Der Testlauf ist fehlgeschlagen:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
