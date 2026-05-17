/**
 * Erster Start — Name + Kommunikationsstil (keine manuellen Themen).
 */

import React, { useEffect, useState } from 'react';
import { NAME_SUGGESTIONS } from './interestTags';
import { finishOnboarding } from './onboardingActions';
import type { CommunicationStyle, OnboardingPath } from '../../profile/onboardingProfile';

type Step = 'pause' | 'greeting' | 'choices' | 'skip_done' | 'name' | 'style' | 'done';

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

const orb: React.CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  marginBottom: 28,
  border: '1px solid rgba(255,255,255,0.12)',
  background:
    'radial-gradient(circle at 32% 28%, rgba(130,160,255,0.35), rgba(10,12,20,0.9))',
  boxShadow: '0 0 40px rgba(80,120,255,0.12)',
  animation: 'orientBreathe 4s ease-in-out infinite',
};

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('pause');
  const [path, setPath] = useState<OnboardingPath>('skip');
  const [companionName, setCompanionName] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setStep('greeting'), 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step !== 'greeting') return;
    const t = window.setTimeout(() => setStep('choices'), 2400);
    return () => window.clearTimeout(t);
  }, [step]);

  const complete = async (
    p: OnboardingPath,
    name?: string,
    style?: CommunicationStyle,
  ) => {
    await finishOnboarding({
      complete: true,
      path: p,
      companionName: name?.trim() || undefined,
      communicationStyle: style,
      interests: [],
    });
    onComplete();
  };

  const renderLines = (lines: string[]) => (
    <div style={{ maxWidth: 420, textAlign: 'center', lineHeight: 1.55 }}>
      {lines.map((line) => (
        <p key={line} style={{ margin: '0 0 14px', fontSize: 15, opacity: 0.9 }}>
          {line}
        </p>
      ))}
    </div>
  );

  return (
    <div style={panel}>
      <style>{`
        @keyframes orientBreathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.04); opacity: 1; }
        }
      `}</style>

      <div style={orb} aria-hidden />

      {step === 'pause' && (
        <p style={{ fontSize: 15, opacity: 0.5, margin: 0 }}>&nbsp;</p>
      )}

      {step === 'greeting' && (
        <>
          <p style={{ fontSize: 22, fontWeight: 500, margin: '0 0 20px', letterSpacing: '-0.3px' }}>
            Hallo. Ich bin da.
          </p>
          {renderLines([
            'Ich bin dein persönlicher Companion.',
            'Kein Assistent der auf Befehle wartet.',
            'Jemand der mitdenkt. Zuhört. Ehrlich ist.',
          ])}
        </>
      )}

      {step === 'choices' && (
        <>
          {renderLines([
            'Du kannst einfach loslegen.',
            'Oder du nimmst dir eine Minute — Name und wie ich mit dir sprechen soll.',
            'Themen und Interessen lege ich nicht fest — die erkenne ich aus dem, was du sagst.',
          ])}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, width: '100%', maxWidth: 320 }}>
            <OnboardingButton
              label="Einfach loslegen"
              onClick={() => {
                setPath('skip');
                setStep('skip_done');
              }}
            />
            <OnboardingButton
              label="Kurz einrichten"
              primary
              onClick={() => {
                setPath('short');
                setStep('name');
              }}
            />
          </div>
        </>
      )}

      {step === 'skip_done' && (
        <>
          <p style={{ fontSize: 16, margin: '0 0 20px' }}>Gut. Ich lerne dich über die Zeit kennen.</p>
          <OnboardingButton label="Weiter" primary onClick={() => void complete('skip')} />
        </>
      )}

      {step === 'name' && (
        <>
          <p style={{ fontSize: 16, margin: '0 0 16px' }}>Wie soll ich heißen?</p>
          <input
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="Name oder Wort"
            style={inputStyle}
            autoFocus
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0 20px', justifyContent: 'center' }}>
            {NAME_SUGGESTIONS.map((n) => (
              <button key={n} type="button" onClick={() => setCompanionName(n)} style={tagBtn(false)}>
                {n}
              </button>
            ))}
          </div>
          <OnboardingButton
            label="Weiter"
            primary
            disabled={!companionName.trim()}
            onClick={() => setStep('style')}
          />
        </>
      )}

      {step === 'style' && (
        <>
          <p style={{ fontSize: 16, margin: '0 0 16px', textAlign: 'center', maxWidth: 360 }}>
            {companionName.trim()}. Schön.
            <br />
            Bist du eher jemand der viel erzählt — oder der lieber fragt?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
            <OnboardingButton
              label="Ich erzähle viel (aktiv)"
              onClick={() => {
                setCommunicationStyle('active');
                setStep('done');
              }}
            />
            <OnboardingButton
              label="Ich höre lieber zu (passiv)"
              onClick={() => {
                setCommunicationStyle('passive');
                setStep('done');
              }}
            />
          </div>
        </>
      )}

      {step === 'done' && (
        <>
          <p style={{ fontSize: 16, margin: '0 0 20px', textAlign: 'center', maxWidth: 360 }}>
            Gut. Alles andere — Themen, Schwerpunkte, Rhythmus — lerne ich aus dem, was kommt.
          </p>
          <OnboardingButton
            label="Loslegen"
            primary
            onClick={() =>
              void complete(path === 'skip' ? 'short' : path, companionName, communicationStyle ?? undefined)
            }
          />
        </>
      )}
    </div>
  );
}

function OnboardingButton({
  label,
  onClick,
  primary,
  disabled,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        background: primary ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        color: 'white',
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        width: '100%',
      }}
    >
      {label}
    </button>
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
  maxWidth: 320,
  boxSizing: 'border-box',
};

const tagBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.14)',
  background: active ? 'rgba(130,160,255,0.25)' : 'rgba(255,255,255,0.05)',
  color: 'white',
  fontSize: 13,
  cursor: 'pointer',
});
