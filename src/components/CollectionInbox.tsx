/**
 * Sammelcontainer — rohe Gedanken, ohne Kategorien.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import type { Impulse } from '../core/impulses/Impulse';

function preview(impulse: Impulse): string {
  return (
    impulse.content.text?.trim() ||
    impulse.content.transcript?.trim() ||
    '(ohne Text)'
  );
}

function formatWhen(d: Date): string {
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  refreshKey?: number;
};

export function CollectionInbox({ refreshKey = 0 }: Props) {
  const { impulseRepo } = useAppServices();
  const [items, setItems] = useState<Impulse[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const recent = await impulseRepo.findRecent(24);
      setItems(recent);
    } finally {
      setLoading(false);
    }
  }, [impulseRepo]);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  const unlinked = items.filter((i) => i.links.threadIds.length === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>Sammelcontainer</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
          Alles landet hier — roh. ORIENT ordnet Themen selbst zu und sortiert im Laufe der Zeit nach.
        </div>
      </div>

      {loading && <div style={{ fontSize: 12, opacity: 0.55 }}>Lade…</div>}

      {!loading && items.length === 0 && (
        <div style={{ fontSize: 13, opacity: 0.55 }}>
          Noch leer. Sprich oder tippe deinen ersten Gedanken.
        </div>
      )}

      {!loading &&
        items.map((imp) => {
          const inTopic = imp.links.threadIds.length > 0;
          return (
            <div
              key={imp.id}
              style={{
                fontSize: 13,
                lineHeight: 1.45,
                padding: '10px 12px',
                borderRadius: 12,
                border: inTopic
                  ? '1px solid rgba(120,160,255,0.2)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: inTopic ? 'rgba(120,160,255,0.06)' : 'rgba(0,0,0,0.22)',
                opacity: inTopic ? 0.75 : 1,
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 6 }}>{formatWhen(imp.createdAt)}</div>
              {preview(imp)}
            </div>
          );
        })}

      {!loading && unlinked.length > 0 && (
        <div style={{ fontSize: 11, opacity: 0.5 }}>
          {unlinked.length} ohne Thema — ORIENT beobachtet Muster.
        </div>
      )}
    </div>
  );
}
