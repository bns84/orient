/**
 * ORIENT - Main App Component
 * 
 * One-Column Layout: Presence → Topics → Content
 * Debug-Komponenten sind standardmäßig versteckt.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (sauberer Flow)
 * - Companion-Gefühl (nicht Dev-Tool)
 * - Menschliche Sprache (keine technischen Begriffe)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createAppServices } from './ui/wiring/createAppServices';
import { VisualDebugCanvas } from './ui/components/VisualDebugCanvas';
import { CenterActionButton } from './ui/components/CenterActionButton';
import { Focusable } from './components/Focusable';
import { VoiceHoldButton } from './components/VoiceHoldButton';
import { TopicList } from './components/TopicList';
import { OrientShell } from './components/OrientShell';
import { PresenceHeader } from './components/PresenceHeader';

import { DebugOnly } from './debug/DebugOnly';
import { VoiceList } from './components/VoiceList';
import { EventList } from './components/EventList';
import { GraphInspector } from './components/GraphInspector';
import { NewTopicQuick } from './components/NewTopicQuick';
import { OverviewPanel } from './components/OverviewPanel';
import { BehaviorSnapshot } from './components/BehaviorSnapshot';
import { DBExportImport } from './components/DBExportImport';

import { VisualStatePipeline } from './visual/pipeline/VisualStatePipeline';
import { startBehaviorSimulation } from './behavior/simulate';
import { ContextMode } from './core/escalation/ContextMode';
import { ThreadStatus } from './core/threads/ThreadStatus';
import { Thread } from './core/threads/Thread';

export default function App() {
  const services = useMemo(() => createAppServices(), []);
  const [visualState, setVisualState] = useState<any>(null);
  const [mode, setMode] = useState<ContextMode>(ContextMode.NORMAL);

  // Demo topics for testing Interest Hook & Share
  const demoTopics = [
    {
      key: 't1',
      title: 'Feiern & Gestaltung',
      subtitle: 'Lifestyle',
      summary: 'Ideensammlung für elegante, nicht-kitschige Feierdekorationen',
      bullets: ['Elegante Servietten-Faltungen', 'Wunderkerzen als Tischdekoration', 'Minimalistische Farbpalette'],
    },
    {
      key: 't2',
      title: 'Investieren',
      subtitle: 'Finanzen',
      summary: 'Langfristige Anlagestrategien und Marktbeobachtung',
      bullets: ['Diversifikation über verschiedene Asset-Klassen', 'Langfristige Perspektive', 'Risikomanagement'],
    },
    {
      key: 't3',
      title: 'Gesundheit',
      subtitle: 'Persönlich',
      summary: 'Persönliche Gesundheitsziele und Routinen',
    },
    {
      key: 't4',
      title: 'Projekte',
      subtitle: 'Arbeit',
      summary: 'Aktuelle Arbeitsprojekte und Prioritäten',
      bullets: ['ORIENT Development', 'Dokumentation', 'Testing'],
    },
  ];

  // Start Behavior Simulation
  useEffect(() => {
    const cleanup = startBehaviorSimulation(1000);
    return cleanup;
  }, []);

  useEffect(() => {
    (async () => {
      // Seed minimal demo data (nur für Start)
      const demoThread1: Thread = {
        id: 't1',
        title: 'Feiern & Gestaltung',
        status: ThreadStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          recencyScore: 0.7,
          frequencyScore: 0.5,
          confidenceScore: 0.6,
          userRelevanceScore: 0.7,
        },
      };

      const demoThread2: Thread = {
        id: 't2',
        title: 'Investieren',
        status: ThreadStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          recencyScore: 0.5,
          frequencyScore: 0.3,
          confidenceScore: 0.4,
          userRelevanceScore: 0.5,
        },
      };

      await services.threadRepo.save(demoThread1);
      await services.threadRepo.save(demoThread2);

      // set context from persisted value
      const ctx = await services.contextService.getCurrent();
      setMode(ctx.mode);

      const daily = await services.dailyQuery.getDailyView({
        contextMode: ctx.mode,
        allowHints: true,
        hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
      });

      const edges = await services.edgeRepo.getAll();

      const vs = VisualStatePipeline.build({
        dailyView: daily,
        edges: edges as any,
        context:
          ctx.mode === ContextMode.QUIET
            ? 'QUIET'
            : ctx.mode === ContextMode.FOCUS
              ? 'FOCUS'
              : 'NORMAL',
        clusterHint: { byThreadId: { t1: 'Lifestyle', t2: 'Finanzen' } },
      });

      setVisualState(vs);
    })();
  }, [services]);

  const applyMode = async (m: ContextMode) => {
    await services.contextService.setMode(m);
    setMode(m);

    const daily = await services.dailyQuery.getDailyView({
      contextMode: m,
      allowHints: true,
      hintBudgetRemaining: (await services.contextService.getCurrent()).hintBudgetPerDay ?? 3,
    });

    const edges = await services.edgeRepo.getAll();

    const vs = VisualStatePipeline.build({
      dailyView: daily,
      edges: edges as any,
      context: m === ContextMode.QUIET ? 'QUIET' : m === ContextMode.FOCUS ? 'FOCUS' : 'NORMAL',
      clusterHint: { byThreadId: { t1: 'Lifestyle', t2: 'Finanzen' } },
    });

    setVisualState(vs);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07080c',
        color: 'white',
        boxSizing: 'border-box',
      }}
    >
      <OrientShell>
        <PresenceHeader />

        <Focusable id="topics-panel">
          <div
            style={{
              borderRadius: 14,
              padding: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <TopicList topics={demoTopics} />
          </div>
        </Focusable>

        <Focusable id="content-panel">
          <div
            style={{
              borderRadius: 14,
              padding: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>Kontext</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Mode: {mode}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => applyMode(ContextMode.QUIET)} style={btn(mode === ContextMode.QUIET)}>
                    Ruhe
                  </button>
                  <button onClick={() => applyMode(ContextMode.NORMAL)} style={btn(mode === ContextMode.NORMAL)}>
                    Normal
                  </button>
                  <button onClick={() => applyMode(ContextMode.FOCUS)} style={btn(mode === ContextMode.FOCUS)}>
                    Fokus
                  </button>
                </div>
              </div>

              <div style={{ height: 320 }}>
                <VisualDebugCanvas state={visualState} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CenterActionButton
                  onTap={() => console.log('tap')}
                  onHoldStart={() => console.log('hold start (voice later)')}
                  onHoldEnd={() => console.log('hold end')}
                />
              </div>

              <VoiceHoldButton />
            </div>
          </div>
        </Focusable>

        <DebugOnly>
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              opacity: 0.9,
              padding: 16,
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Debug-Modus aktiviert</div>
            <NewTopicQuick />
            <EventList limit={30} />
            <VoiceList />
            <GraphInspector />
            <BehaviorSnapshot />
            <OverviewPanel />
            <DBExportImport />
          </div>
        </DebugOnly>
      </OrientShell>
    </div>
  );
}

const btn = (active: boolean): React.CSSProperties => ({
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
  fontSize: 13,
});
