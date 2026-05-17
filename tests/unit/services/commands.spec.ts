import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ContextMode } from '../../../src/core/escalation/ContextMode';
import { parseVoiceCommand, tryExecuteVoiceCommand } from '../../../src/services/commands';

describe('parseVoiceCommand', () => {
  it('detects summarize', () => {
    expect(parseVoiceCommand('Fass das bitte zusammen')?.kind).toBe('summarize');
  });

  it('detects archive', () => {
    expect(parseVoiceCommand('Leg das ab')?.kind).toBe('archive');
  });

  it('detects observe', () => {
    expect(parseVoiceCommand('Ignorier das erstmal')?.kind).toBe('observe');
  });

  it('detects export', () => {
    expect(parseVoiceCommand('Exportier mir das')?.kind).toBe('export');
  });

  it('returns null for normal thoughts', () => {
    expect(parseVoiceCommand('Ich muss morgen einkaufen')).toBeNull();
  });
});

describe('tryExecuteVoiceCommand', () => {
  const archiveThread = { execute: vi.fn(async () => ({ ok: true, message: 'Thema ruht.' })) };
  const observeThread = { execute: vi.fn(async () => ({ ok: true, message: 'Beobachten.' })) };
  const exportThread = {
    execute: vi.fn(async () => ({ ok: true, content: '# Thread\nInhalt' })),
  };
  const exportOrchestrator = {
    exportDailyMarkdown: vi.fn(async () => ({
      filename: 'orient_overview.md',
      content: '# Überblick\n\n_Keine aktiven Themen._',
    })),
  };
  const impulseRepo = {
    findRecent: vi.fn(async () => [
      {
        id: 'i1',
        createdAt: new Date(),
        content: { text: 'Erster Gedanke' },
        links: { threadIds: [] },
      },
    ]),
  };
  const threadRepo = { findAll: vi.fn(async () => []) };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });
    vi.stubGlobal(
      'document',
      {
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
        createElement: vi.fn(() => ({ click: vi.fn(), remove: vi.fn(), rel: '' })),
      } as unknown as Document,
    );
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: vi.fn(),
    });
  });

  const deps = (overrides: Record<string, unknown> = {}) => ({
    threadId: undefined as string | undefined,
    queryOpts: { contextMode: ContextMode.NORMAL, allowHints: true, hintBudgetRemaining: 3 },
    threadRepo,
    impulseRepo,
    archiveThread: archiveThread as never,
    observeThread: observeThread as never,
    exportThread: exportThread as never,
    exportOrchestrator: exportOrchestrator as never,
    ...overrides,
  });

  it('archives focused thread', async () => {
    const res = await tryExecuteVoiceCommand(deps({ threadId: 't1' }), 'Leg das ab');
    expect(res).toEqual({ handled: true, ok: true, message: 'Thema ruht.' });
    expect(archiveThread.execute).toHaveBeenCalledWith('t1');
  });

  it('guides when archive has no topics yet', async () => {
    const res = await tryExecuteVoiceCommand(deps(), 'Leg das ab');
    expect(res.handled).toBe(true);
    expect(res.ok).toBe(false);
    expect(res.message).toContain('Sammlung');
  });

  it('summarizes collection when no topics', async () => {
    const res = await tryExecuteVoiceCommand(deps(), 'Fass zusammen');
    expect(res.ok).toBe(true);
    expect(res.message).toContain('Sammlung');
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('exports collection as download when no topics', async () => {
    const res = await tryExecuteVoiceCommand(deps(), 'Exportier mir das');
    expect(res.ok).toBe(true);
    expect(res.message).toContain('Sammlung');
  });

  it('does not handle normal speech', async () => {
    const res = await tryExecuteVoiceCommand(deps(), 'Gedanke über Kaffee');
    expect(res.handled).toBe(false);
  });
});
