/**
 * ORIENT - Voice Attachments Component
 * 
 * Liste der Voice-Attachments für ein Panel.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Attachments sichtbar)
 * - Local-first (nur lokale Daten)
 */

import React from 'react';
import { orientDb, AttachmentRow } from '../db/orientDb';
import { detachAttachment, getVoiceAttachmentsForTarget } from '../db/attachments';

type Row = {
  id: number;
  createdAt: number;
  voiceId: number;
  blob: Blob;
  voiceCreatedAt: number;
  durationMs: number;
};

export function VoiceAttachments({ targetId }: { targetId: string }) {
  const [rows, setRows] = React.useState<Row[]>([]);

  const load = React.useCallback(async () => {
    const atts = await getVoiceAttachmentsForTarget(targetId);

    const full: Row[] = [];
    for (const a of atts) {
      const v = await orientDb.voice.get(a.voiceId);
      if (!v?.id) continue;
      full.push({
        id: a.id!,
        createdAt: a.createdAt,
        voiceId: v.id!,
        blob: v.blob,
        voiceCreatedAt: v.createdAt,
        durationMs: v.durationMs,
      });
    }

    setRows(full.sort((x, y) => y.createdAt - x.createdAt));
  }, [targetId]);

  React.useEffect(() => {
    let alive = true;

    const onChange = () => {
      // Delay to avoid TransactionInactiveError (hook called during transaction)
      setTimeout(() => {
        void load();
      }, 0);
    };

    void load();

    orientDb.attachments.hook('creating', onChange);
    orientDb.attachments.hook('updating', onChange);
    orientDb.attachments.hook('deleting', onChange);

    return () => {
      alive = false;
      orientDb.attachments.hook('creating').unsubscribe(onChange);
      orientDb.attachments.hook('updating').unsubscribe(onChange);
      orientDb.attachments.hook('deleting').unsubscribe(onChange);
    };
  }, [load]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>Voice attached to this panel</div>

      {rows.length === 0 && (
        <div style={{ fontSize: 12, opacity: 0.6 }}>No attachments yet.</div>
      )}

      {rows.map((r) => (
        <VoiceAttItem key={r.id} row={r} onRemove={() => detachAttachment(r.id).then(load)} />
      ))}
    </div>
  );
}

function VoiceAttItem({ row, onRemove }: { row: Row; onRemove: () => void }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = URL.createObjectURL(row.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [row.blob]);

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
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Attached: {new Date(row.createdAt).toLocaleString()}
        </div>
        <button
          onClick={onRemove}
          style={{
            borderRadius: 10,
            padding: '6px 10px',
            border: '1px solid rgba(255,255,255,0.16)',
            background: 'rgba(255,255,255,0.07)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Remove
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
        Voice: #{row.voiceId} · {Math.round(row.durationMs / 1000)}s · recorded{' '}
        {new Date(row.voiceCreatedAt).toLocaleString()}
      </div>

      {url && <audio controls src={url} style={{ width: '100%', marginTop: 8 }} />}
    </div>
  );
}
