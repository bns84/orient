/**
 * ORIENT - Overview Panel
 * 
 * Mini-Status-Übersicht: DB, Context, Fokus, Voice, Events.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (alle Daten sichtbar)
 * - Ruhe vor Geschwindigkeit (polling minimal)
 * - Keine neue Produktlogik
 */

import React from 'react';
import { useOrientOverview } from '../hooks/useOrientOverview';
import { exportDB } from '../db/exportImport';
import { orientDb } from '../db/orientDb';
import { kvSet } from '../db/kv';
import { AttachLastVoiceButton } from './AttachLastVoiceButton';

function fmt(ts: number | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

export function OverviewPanel() {
  const o = useOrientOverview(1000);

  const onExport = async () => {
    const data = await exportDB();
    const json = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(json);
    alert('DB export copied to clipboard (meta only).');
  };

  const onClearEvents = async () => {
    if (confirm('Clear all events?')) {
      await orientDb.events.clear();
    }
  };

  const onClearFocus = async () => {
    if (confirm('Clear focus state?')) {
      await kvSet('ui.focus', { openId: null });
    }
  };

  if (!o) {
    return (
      <div style={panelStyle}>
        <div style={titleStyle}>ORIENT Overview</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={titleStyle}>ORIENT Overview</div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>
          Updated: {new Date(o.now).toLocaleTimeString()}
        </div>
      </div>

      <div style={gridStyle}>
        <Stat
          label="KV entries"
          value={String(o.kvCount)}
          sub={`Last KV update: ${fmt(o.lastKvUpdateAt)}`}
        />
        <Stat
          label="Events"
          value={String(o.eventsCount)}
          sub={`Last event: ${fmt(o.lastEventAt)}`}
        />
        <Stat
          label="Voice notes"
          value={String(o.voiceCount)}
          sub={`Last voice: ${fmt(o.lastVoiceAt)}`}
        />
        <Stat
          label="Focus open"
          value={o.focusOpenId ?? '—'}
          sub={`Context snapshot: ${fmt(o.contextSnapshotAt)}`}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
        <AttachLastVoiceButton />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={btnStyle} onClick={onExport}>
            Export DB (copy)
          </button>
          <button style={btnStyle} onClick={onClearEvents}>
            Clear events
          </button>
          <button style={btnStyle} onClick={onClearFocus}>
            Clear focus
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={statStyle}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 18, opacity: 0.95, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 16,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.9,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  marginTop: 14,
};

const statStyle: React.CSSProperties = {
  borderRadius: 14,
  padding: 12,
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.04)',
};

const btnStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: '8px 12px',
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
};
