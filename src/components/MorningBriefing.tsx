/**
 * Morgen-Briefing — kurz, ohne Zwang.
 */

import React from 'react';

type Props = {
  lines: string[];
  onDismiss: () => void;
};

export function MorningBriefing({ lines, onDismiss }: Props) {
  return (
    <section
      style={{
        borderRadius: 14,
        padding: 16,
        border: '1px solid rgba(255,200,120,0.22)',
        background: 'rgba(255,200,120,0.06)',
      }}
      aria-labelledby="morning-briefing-title"
    >
      <div
        id="morning-briefing-title"
        style={{ fontSize: 13, fontWeight: 600, opacity: 0.88, marginBottom: 10 }}
      >
        Guten Morgen
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lines.map((line) => (
          <p key={line} style={{ margin: 0, fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>
            {line}
          </p>
        ))}
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 12, opacity: 0.55 }}>
        Du kannst einfach sprechen — z. B. „Was steht heute an?“
      </p>
      <button type="button" onClick={onDismiss} style={dismissBtn}>
        Verstanden
      </button>
    </section>
  );
}

const dismissBtn: React.CSSProperties = {
  marginTop: 14,
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  fontSize: 13,
  cursor: 'pointer',
  width: '100%',
};
