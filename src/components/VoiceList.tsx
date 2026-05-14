/**
 * ORIENT - Voice List Component
 * 
 * Debug-Liste für Voice-Recordings.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Recordings sichtbar)
 * - Local-first (nur lokale Daten)
 */

import React from 'react';
import { orientDb, VoiceRow } from '../db/orientDb';

export function VoiceList() {
  const [rows, setRows] = React.useState<VoiceRow[]>([]);

  React.useEffect(() => {
    let alive = true;

    const load = async () => {
      const all = await orientDb.voice
        .orderBy('createdAt')
        .reverse()
        .limit(10)
        .toArray();
      if (!alive) return;
      setRows(all);
    };

    const onChange = () => {
      // Delay to avoid TransactionInactiveError (hook called during transaction)
      setTimeout(() => {
        void load();
      }, 0);
    }; // <- WICHTIG: nicht async, nichts returnen

    void load();

    orientDb.voice.hook('creating', onChange);
    orientDb.voice.hook('updating', onChange);
    orientDb.voice.hook('deleting', onChange);

    return () => {
      alive = false;
      orientDb.voice.hook('creating').unsubscribe(onChange);
      orientDb.voice.hook('updating').unsubscribe(onChange);
      orientDb.voice.hook('deleting').unsubscribe(onChange);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>Last Voice Notes</div>
      {rows.length === 0 && (
        <div style={{ fontSize: 12, opacity: 0.6 }}>No recordings yet.</div>
      )}
      {rows.map((r) => (
        <VoiceRowItem key={r.id} row={r} />
      ))}
    </div>
  );
}

function VoiceRowItem({ row }: { row: VoiceRow }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = URL.createObjectURL(row.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [row.blob]);

  const dt = new Date(row.createdAt).toLocaleString();

  return (
    <div
      style={{
        borderRadius: 14,
        padding: 12,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{dt}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {Math.round(row.durationMs / 1000)}s
        </div>
      </div>
      {row.status && (
        <div
          style={{
            fontSize: 11,
            opacity: 0.7,
            marginTop: 4,
            padding: '4px 8px',
            borderRadius: 6,
            background:
              row.status === 'done'
                ? 'rgba(6, 214, 160, 0.15)'
                : row.status === 'pending'
                  ? 'rgba(255, 209, 102, 0.15)'
                  : 'rgba(255,255,255,0.05)',
          }}
        >
          {row.status === 'done' ? '✓ Done' : row.status === 'pending' ? '⏳ Pending' : '● Recorded'}
        </div>
      )}
      {row.transcript && (
        <div
          style={{
            fontSize: 12,
            opacity: 0.8,
            marginTop: 8,
            padding: 8,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            fontStyle: 'italic',
          }}
        >
          {row.transcript}
        </div>
      )}
      {url && <audio controls src={url} style={{ width: '100%', marginTop: 8 }} />}
    </div>
  );
}
