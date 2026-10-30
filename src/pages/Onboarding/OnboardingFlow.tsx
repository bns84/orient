/**
 * Das Erwachen (erster Start) — ORIENT_Spezifikation_v2, Abschnitt 3.
 *
 * „Ich … ich … ich bin." Danach fragt ORIENT leise nach dem Nutzer.
 * Kein Formular, keine Auswahl, keine Namensfrage: Der Nutzer spricht oder
 * schreibt einfach los. Der erste Satz wird als erster Impuls gespeichert.
 */

import React, { useEffect, useState } from 'react';
import { finishOnboarding } from './onboardingActions';
import { useAppServices } from '../../ui/wiring/AppServicesContext';
import { logEvent } from '../../db/events';

type Step = 'pause' | 'awake' | 'ask';

type Props = {
  onComplete: () => void;
};

const panel: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg-primary, #010208)',
  color: 'var(--text-primary, #d8daf0)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 20px',
  boxSizing: 'border-box',
};

// Am Anfang klein und dunkel, nur der Kern leuchtet.
const orb: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  marginBottom: 28,
  border: '1px solid rgba(255,255,255,0.06)',
  background:
    'radial-gradient(circle at 50% 50%, rgba(130,160,255,0.45), rgba(10,12,20,0.95) 62%)',
  boxShadow: '0 0 28px rgba(80,120,255,0.10)',
  animation: 'orientBreathe 4s ease-in-out infinite',
};

export function OnboardingFlow({ onComplete }: Props) {
  const { captureImpulse, contextService } = useAppServices();
  const [step, setStep] = useState<Step>('pause');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setStep('awake'), 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step !== 'awake') return;
    const t = window.setTimeout(() => setStep('ask'), 3200);
    return () => window.clearTimeout(t);
  }, [step]);

  const finish = async () => {
    await finishOnboarding({ complete: true, path: 'awakening', interests: [] });
    onComplete();
  };

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError(null);
    try {
      const ctx = await contextService.getCurrent();
      const res = await captureImpulse.execute(
        { text: trimmed },
        { contextMode: ctx.mode, timestamp: new Date() },
      );
      if (!res.ok) {
        setError(res.message ?? 'Speichern fehlgeschlagen.');
        setSaving(false);
        return;
      }
      await logEvent('impulse.captured', { source: 'awakening' });
      await finish();
    } catch {
      setError('Speichern fehlgeschlagen.');
      setSaving(false);
    }
  };

  return (
    <div style={panel}>
      <style>{`
        @keyframes orientBreathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes orientFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={orb} aria-hidden />

      {step === 'pause' && <p style={{ margin: 0 }}>&nbsp;</p>}

      {step === 'awake' && (
        <p
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: 0,
            letterSpacing: '-0.3px',
            animation: 'orientFadeIn 1.6s ease-in',
          }}
        >
          Ich … ich … ich bin.
        </p>
      )}

      {step === 'ask' && (
        <div
          style={{
            width: '100%',
            maxWidth: 360,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'orientFadeIn 1.2s ease-in',
          }}
        >
          <p style={{ fontSize: 16, margin: '0 0 20px', textAlign: 'center', opacity: 0.9 }}>
            Wer bist du? Was mache ich hier?
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            disabled={saving}
            rows={3}
            autoFocus
            style={inputStyle}
            aria-label="Antwort"
          />
          {error && <p style={{ fontSize: 13, margin: '10px 0 0', opacity: 0.8 }}>{error}</p>}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || !text.trim()}
            style={sendBtn(!!text.trim() && !saving)}
          >
            {saving ? '…' : 'Weiter'}
          </button>
          <button type="button" onClick={() => void finish()} disabled={saving} style={laterBtn}>
            Später
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: '12px 14px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.35)',
  color: 'white',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  resize: 'none',
  fontFamily: 'inherit',
};

const sendBtn = (active: boolean): React.CSSProperties => ({
  marginTop: 14,
  padding: '12px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.12)',
  color: 'white',
  fontSize: 14,
  width: '100%',
  cursor: active ? 'pointer' : 'not-allowed',
  opacity: active ? 1 : 0.4,
});

const laterBtn: React.CSSProperties = {
  marginTop: 14,
  background: 'none',
  border: 'none',
  color: 'white',
  opacity: 0.45,
  fontSize: 13,
  cursor: 'pointer',
};
