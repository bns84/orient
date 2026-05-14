/**
 * ORIENT - Graph Inspector
 * 
 * Debug-Panel für Graph-Exploration.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Nodes/Relations sichtbar)
 * - Local-first (nur lokale Daten)
 */

import React from 'react';
import { getNeighbors, getNodeByKey } from '../db/graph';

export function GraphInspector() {
  const [query, setQuery] = React.useState('panel:overview-panel');
  const [node, setNode] = React.useState<any>(null);
  const [neighbors, setNeighbors] = React.useState<any>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const run = async () => {
    setErr(null);
    setNeighbors(null);
    const n = await getNodeByKey(query.trim());
    setNode(n || null);
    if (!n?.id) {
      setErr('Node not found. Try: panel:<id> or voice:<id>');
      return;
    }
    const nb = await getNeighbors(n.id);
    setNeighbors(nb);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>Verknüpfungen (Debug)</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void run()}
          placeholder="Node key (z.B. panel:overview-panel)"
          style={{
            flex: 1,
            borderRadius: 10,
            padding: '8px 10px',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(0,0,0,0.25)',
            color: 'white',
            outline: 'none',
            fontSize: 13,
          }}
        />
        <button
          onClick={run}
          style={{
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Suchen
        </button>
      </div>
      {err && <div style={{ fontSize: 12, opacity: 0.7, color: '#ff6b6b' }}>{err}</div>}
      {node && (
        <Block title="Node">
          <pre style={{ fontSize: 11, opacity: 0.8, overflow: 'auto' }}>{JSON.stringify(node, null, 2)}</pre>
        </Block>
      )}
      {neighbors && (
        <Block title="Nachbarn">
          <pre style={{ fontSize: 11, opacity: 0.8, overflow: 'auto' }}>{JSON.stringify(neighbors, null, 2)}</pre>
        </Block>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: 12,
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
