/**
 * Explizite Sprach-/Text-Kommandos (Phase 1, heuristisch).
 */

import type { ArchiveThreadCommand } from '../app/commands/ArchiveThreadCommand';
import type { ExportThreadCommand } from '../app/commands/ExportThreadCommand';
import type { ObserveThreadCommand } from '../app/commands/ObserveThreadCommand';
import type { ExportOrchestrator } from '../app/export/ExportOrchestrator';
import type { ThreadQueryOptions } from '../app/queries/ThreadQueryService';
import type { ImpulseRepository } from '../core/impulses/ImpulseRepository';
import type { ThreadRepository } from '../core/threads/ThreadRepository';
import type { AutoTopicResult } from './auto-topic-engine';
import { buildCollectionMarkdown } from './collection-export';
import { downloadTextFile } from '../utils/downloadTextFile';

export type VoiceCommandKind = 'summarize' | 'archive' | 'observe' | 'export';

export type ParsedVoiceCommand = {
  kind: VoiceCommandKind;
  raw: string;
};

export type VoiceCommandOutcome = {
  handled: boolean;
  ok: boolean;
  message?: string;
};

export type VoiceCommandDeps = {
  threadId?: string | null;
  queryOpts: ThreadQueryOptions;
  threadRepo: ThreadRepository;
  impulseRepo: ImpulseRepository;
  archiveThread: ArchiveThreadCommand;
  observeThread: ObserveThreadCommand;
  exportThread: ExportThreadCommand;
  exportOrchestrator: ExportOrchestrator;
  /** Optional: Themen aus Sammlung ableiten, bevor „leg ab“ / „ignorier“. */
  reconcileTopics?: () => Promise<AutoTopicResult>;
};

const COMMAND_PATTERNS: { kind: VoiceCommandKind; re: RegExp }[] = [
  { kind: 'export', re: /\b(exportier|exportiere|export)\b/i },
  { kind: 'summarize', re: /\b(fass|fasst|fassen).*(zusammen)|zusammenfass/i },
  { kind: 'archive', re: /\b(leg|legen).*(ab)|legen wir ab/i },
  { kind: 'observe', re: /\b(ignorier|ignoriere)|erstmal beobacht|beobachten wir/i },
];

const EMPTY_DAILY_MARKER = '_Keine aktiven Themen._';

function normalizeTranscript(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function parseVoiceCommand(text: string): ParsedVoiceCommand | null {
  const raw = normalizeTranscript(text);
  if (!raw) return null;

  for (const { kind, re } of COMMAND_PATTERNS) {
    if (re.test(raw)) {
      return { kind, raw };
    }
  }
  return null;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Explizites Thema → letzter verknüpfter Impuls → zuletzt aktualisiertes Thema. */
export async function resolveCommandThreadId(deps: VoiceCommandDeps): Promise<string | null> {
  if (deps.threadId) return deps.threadId;

  const recent = await deps.impulseRepo.findRecent(32);
  for (const imp of recent) {
    const id = imp.links.threadIds[0];
    if (id) return id;
  }

  const threads = (await deps.threadRepo.findAll?.()) ?? [];
  if (threads.length === 0) return null;

  const sorted = [...threads].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
  return sorted[0]?.id ?? null;
}

async function resolveThreadIdWithReconcile(deps: VoiceCommandDeps): Promise<string | null> {
  let id = await resolveCommandThreadId(deps);
  if (id || !deps.reconcileTopics) return id;

  const result = await deps.reconcileTopics();
  id = result.lastThreadId ?? (await resolveCommandThreadId(deps));
  return id;
}

async function resolveMarkdown(deps: VoiceCommandDeps): Promise<{ content: string; filename: string } | null> {
  const threadId = await resolveCommandThreadId(deps);

  if (threadId) {
    const res = await deps.exportThread.execute(threadId, deps.queryOpts);
    if (res.ok && res.content) {
      return { content: res.content, filename: `thread_${threadId}.md` };
    }
  }

  const daily = await deps.exportOrchestrator.exportDailyMarkdown(deps.queryOpts);
  if (!daily.content.includes(EMPTY_DAILY_MARKER)) {
    return { content: daily.content, filename: daily.filename };
  }

  return buildCollectionMarkdown(deps.impulseRepo);
}

function needsThread(kind: VoiceCommandKind): boolean {
  return kind === 'archive' || kind === 'observe';
}

function summarizeMessage(fromCollection: boolean, copied: boolean): string {
  if (!copied) return 'Zusammenfassung erstellt — Kopieren nicht möglich.';
  return fromCollection
    ? 'Sammlung als Markdown in der Zwischenablage.'
    : 'Zusammenfassung in der Zwischenablage.';
}

function exportMessage(fromCollection: boolean): string {
  return fromCollection
    ? 'Sammlung als Markdown heruntergeladen.'
    : 'Markdown wurde heruntergeladen.';
}

export async function tryExecuteVoiceCommand(
  deps: VoiceCommandDeps,
  transcript: string,
): Promise<VoiceCommandOutcome> {
  const parsed = parseVoiceCommand(transcript);
  if (!parsed) {
    return { handled: false, ok: false };
  }

  if (needsThread(parsed.kind)) {
    const threadId = await resolveThreadIdWithReconcile(deps);
    if (!threadId) {
      return {
        handled: true,
        ok: false,
        message:
          'Noch keine Themen erkannt. «Fass zusammen» und «Exportier mir das» nutzen deine Sammlung.',
      };
    }

    if (parsed.kind === 'archive') {
      const res = await deps.archiveThread.execute(threadId);
      return { handled: true, ok: res.ok, message: res.message };
    }
    const res = await deps.observeThread.execute(threadId);
    return { handled: true, ok: res.ok, message: res.message };
  }

  const md = await resolveMarkdown(deps);
  if (!md) {
    return { handled: true, ok: false, message: 'Nichts zum Zusammenfassen in der Sammlung.' };
  }

  const fromCollection = md.filename.startsWith('orient_sammlung_');

  if (parsed.kind === 'summarize') {
    const copied = await copyToClipboard(md.content);
    return {
      handled: true,
      ok: copied,
      message: summarizeMessage(fromCollection, copied),
    };
  }

  if (parsed.kind === 'export') {
    downloadTextFile(md.filename, md.content);
    return { handled: true, ok: true, message: exportMessage(fromCollection) };
  }

  return { handled: false, ok: false };
}
