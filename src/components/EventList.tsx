/**
 * ORIENT - Event List Component
 * 
 * Debug-Liste für Events.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Events sichtbar)
 * - Local-first (nur lokale Events)
 */

import React from 'react';
import { getLastEvents } from '../db/events';
import { orientDb, EventRow } from '../db/orientDb';

export function EventList({ limit = 30 }: { limit?: number }) {
  const [rows, setRows] = React.useState<EventRow[]>([]);

  React.useEffect(() => {
    let alive = true;

    const load = async () => {
      const ev = await getLastEvents(limit);
      if (!alive) return;
      setRows(ev);
    };

    const onChange = () => {
      // Delay to avoid TransactionInactiveError (hook called during transaction)
      setTimeout(() => {
        void load();
      }, 0);
    };

    void load();

    orientDb.events.hook('creating', onChange);
    orientDb.events.hook('updating', onChange);
    orientDb.events.hook('deleting', onChange);

    return () => {
      alive = false;
      orientDb.events.hook('creating').unsubscribe(onChange);
      orientDb.events.hook('updating').unsubscribe(onChange);
      orientDb.events.hook('deleting').unsubscribe(onChange);
    };
  }, [limit]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>Aktivität</div>
      {rows.length === 0 && (
        <div style={{ fontSize: 12, opacity: 0.6 }}>No events yet.</div>
      )}
      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            borderRadius: 14,
            padding: 12,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ opacity: 0.9 }}>{r.type}</div>
            <div style={{ opacity: 0.6 }}>
              {new Date(r.createdAt).toLocaleTimeString()}
            </div>
          </div>
          {r.payload != null && (
            <pre
              style={{
                marginTop: 8,
                opacity: 0.75,
                whiteSpace: 'pre-wrap',
                fontSize: 11,
              }}
            >
              {JSON.stringify(r.payload, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
