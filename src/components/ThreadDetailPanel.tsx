/**
 * Thema im Fokus — Snapshot, Impulse, Aktionen
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { ThreadLifecycle } from '../core/threads/ThreadLifecycle';
import { ThreadStatus } from '../core/threads/ThreadStatus';
import type { ThreadSnapshot } from '../app/queries/types/ThreadSnapshot';
import type { Impulse } from '../core/impulses/Impulse';

type Props = {
  threadId: string | null;
  onChanged?: () => void;
  onClose?: () => void;
};

export function ThreadDetailPanel({ threadId, onChanged, onClose }: Props) {
  const { threadRepo, threadQuery, impulseRepo, contextService, archiveThread, exportThread } =
    useAppServices();
  const [snapshot, setSnapshot] = useState<ThreadSnapshot | null>(null);
  const [impulses, setImpulses] = useState<Impulse[]>([]);
  const [exportText, setExportText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!threadId) {
      setSnapshot(null);
      setImpulses([]);
      return;
    }
    const ctx = await contextService.getCurrent();
    const snap = await threadQuery.getThreadSnapshot(threadId, {
      contextMode: ctx.mode,
      allowHints: true,
      hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
    });
    setSnapshot(snap);
    const list = await impulseRepo.findByThread(threadId);
    setImpulses(list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
  }, [threadId, threadQuery, impulseRepo, contextService]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!threadId) {
    return (
      <div style={{ fontSize: 13, opacity: 0.55, padding: '8px 0' }}>
        Wähle ein Thema — oder lege einen Gedanken an.
      </div>
    );
  }

  if (!snapshot) {
    return <div style={{ fontSize: 13, opacity: 0.6 }}>Lade…</div>;
  }

  const archive = async () => {
    const res = await archiveThread.execute(threadId);
    setMessage(res.message ?? null);
    onChanged?.();
    await reload();
  };

  const observe = async () => {
    const thread = await threadRepo.getById(threadId);
    if (!thread) return;
    const updated = ThreadLifecycle.markObserved(thread);
    await threadRepo.update(updated);
    setMessage('Erstmal beobachten.');
    onChanged?.();
    await reload();
  };

  const activate = async () => {
    const thread = await threadRepo.getById(threadId);
    if (!thread) return;
    const updated = ThreadLifecycle.activate(thread);
    await threadRepo.update(updated);
    setMessage('Wieder aktiv.');
    onChanged?.();
    await reload();
  };

  const doExport = async () => {
    const ctx = await contextService.getCurrent();
    const res = await exportThread.execute(threadId, {
      contextMode: ctx.mode,
      allowHints: true,
      hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
    });
    if (res.ok && res.content) {
      setExportText(res.content);
      setMessage('Export bereit.');
    } else {
      setMessage(res.message ?? 'Export fehlgeschlagen.');
    }
  };

  const copyExport = async () => {
    if (!exportText) return;
    await navigator.clipboard.writeText(exportText);
    setMessage('In Zwischenablage kopiert.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{snapshot.title}</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
            {snapshot.status} · Eskalation {snapshot.escalation.level}
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} style={smallBtn}>
            Schließen
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, opacity: 0.88, lineHeight: 1.45, margin: 0 }}>{snapshot.summary}</p>

      {snapshot.highlights.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, opacity: 0.8 }}>
          {snapshot.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {snapshot.uncertainties.length > 0 && (
        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Unsicher: {snapshot.uncertainties.join(' · ')}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {snapshot.status === ThreadStatus.ACTIVE && (
          <button type="button" onClick={() => void observe()} style={smallBtn}>
            Erstmal beobachten
          </button>
        )}
        {snapshot.status !== ThreadStatus.DORMANT && snapshot.status !== ThreadStatus.CLOSED && (
          <button type="button" onClick={() => void archive()} style={smallBtn}>
            Legen wir ab
          </button>
        )}
        {(snapshot.status === ThreadStatus.DORMANT || snapshot.status === ThreadStatus.OBSERVED) && (
          <button type="button" onClick={() => void activate()} style={smallBtn}>
            Wieder aktiv
          </button>
        )}
        <button type="button" onClick={() => void doExport()} style={smallBtn}>
          Zusammenfassen
        </button>
        {exportText && (
          <button type="button" onClick={() => void copyExport()} style={smallBtn}>
            Kopieren
          </button>
        )}
      </div>

      {message && <div style={{ fontSize: 12, opacity: 0.7 }}>{message}</div>}

      {impulses.length > 0 && (
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
            Gedanken ({impulses.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {impulses.slice(0, 8).map((imp) => (
              <div
                key={imp.id}
                style={{
                  fontSize: 12,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                {imp.content.text ?? imp.content.transcript ?? '(ohne Text)'}
              </div>
            ))}
          </div>
        </div>
      )}

      {exportText && (
        <pre
          style={{
            fontSize: 11,
            opacity: 0.75,
            maxHeight: 160,
            overflow: 'auto',
            padding: 10,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {exportText}
        </pre>
      )}
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
};
