/**
 * ORIENT - Behavior Snapshot (Debug)
 * 
 * Mini Debug-Panel für Behavior-State.
 * 
 * Respektiert ORIENT_DNA:
 * - Transparenz (Zustände sichtbar)
 * - Keine Fachwörter (nur für Debug)
 */

import React from 'react';
import { getBehaviorState, getPresentationHints } from '../behavior/engine';

export function BehaviorSnapshot() {
  const [state, setState] = React.useState(getBehaviorState());
  const [hints, setHints] = React.useState(getPresentationHints());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setState(getBehaviorState());
      setHints(getPresentationHints());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!state || !hints) {
    return (
      <div style={panelStyle}>
        <div style={titleStyle}>ORIENT fühlt gerade…</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Warte auf Daten…</div>
      </div>
    );
  }

  const moodText: Record<string, string> = {
    neutral: 'neutral',
    curious: 'neugierig',
    focused: 'fokussiert',
    scattered: 'zerstreut',
    tired: 'müde',
  };

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>ORIENT fühlt gerade…</div>

      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        <div style={statStyle}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Stimmung</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>
            {moodText[state.sessionMood] || state.sessionMood}
          </div>
        </div>

        <div style={statStyle}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Themen-Anzahl</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>{hints.topicCount}</div>
        </div>

        <div style={statStyle}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Dichte</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>
            {hints.density === 'low' ? 'niedrig' : hints.density === 'high' ? 'hoch' : 'mittel'}
          </div>
        </div>

        <div style={statStyle}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Ton</div>
          <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>
            {hints.tone === 'warm' ? 'warm' : hints.tone === 'crisp' ? 'klar' : 'neutral'}
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
          Audio: {Math.round(hints.preferAudio * 100)}% · Visual: {Math.round(hints.preferVisualCards * 100)}%
        </div>
      </div>
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

const statStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 10,
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.04)',
};
