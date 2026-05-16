/**
 * ORIENT - Main App Component
 *
 * Presence → Themen → Inhalte
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useAppServices } from './ui/wiring/AppServicesContext';
import { useThreadTopics } from './hooks/useThreadTopics';
import { VisualDebugCanvas } from './ui/components/VisualDebugCanvas';
import { CenterActionButton } from './ui/components/CenterActionButton';
import { Focusable } from './components/Focusable';
import { VoiceHoldButton } from './components/VoiceHoldButton';
import { TextImpulseInput } from './components/TextImpulseInput';
import { ThreadDetailPanel } from './components/ThreadDetailPanel';
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
import type { VisualState } from './visual/kernel/VisualState';
import { startBehaviorSimulation } from './behavior/simulate';
import { ContextMode } from './core/escalation/ContextMode';
import { OnboardingFlow } from './pages/Onboarding/OnboardingFlow';
import { loadOnboardingProfile } from './profile/onboardingProfile';

export default function App() {
  const services = useAppServices();
  const { topics: threadTopics, reload: reloadTopics } = useThreadTopics();
  const [visualState, setVisualState] = useState<VisualState | null>(null);
  const [mode, setMode] = useState<ContextMode>(ContextMode.NORMAL);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const refreshVisual = useCallback(
    async (contextMode?: ContextMode) => {
      const ctx = await services.contextService.getCurrent();
      const activeMode = contextMode ?? ctx.mode;
      setMode(activeMode);

      const daily = await services.dailyQuery.getDailyView({
        contextMode: activeMode,
        allowHints: true,
        hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
      });

      const edges = await services.edgeRepo.getAll();
      const threads = await services.threadRepo.getAll();
      const clusterHint = {
        byThreadId: Object.fromEntries(threads.map((t) => [t.id, t.title])),
      };

      const vs = VisualStatePipeline.build({
        dailyView: daily,
        edges: edges as Parameters<typeof VisualStatePipeline.build>[0]['edges'],
        context:
          activeMode === ContextMode.QUIET
            ? 'QUIET'
            : activeMode === ContextMode.FOCUS
              ? 'FOCUS'
              : 'NORMAL',
        clusterHint,
      });

      setVisualState(vs);
    },
    [services],
  );

  const onDataChanged = useCallback(async () => {
    await reloadTopics();
    await refreshVisual();
  }, [reloadTopics, refreshVisual]);

  useEffect(() => {
    const cleanup = startBehaviorSimulation(1000);
    return cleanup;
  }, []);

  useEffect(() => {
    void (async () => {
      const profile = await loadOnboardingProfile();
      setShowOnboarding(!profile.complete);
      setOnboardingChecked(true);
      if (profile.complete) {
        await refreshVisual();
      }
    })();
  }, [services, refreshVisual]);

  const handleOnboardingComplete = useCallback(async () => {
    setShowOnboarding(false);
    await reloadTopics();
    await refreshVisual();
  }, [reloadTopics, refreshVisual]);

  const applyMode = async (m: ContextMode) => {
    await services.contextService.setMode(m);
    await refreshVisual(m);
  };

  if (!onboardingChecked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary, #010208)',
        }}
      />
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => void handleOnboardingComplete()} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary, #010208)',
        color: 'var(--text-primary, #d8daf0)',
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
            <TopicList
              topics={threadTopics}
              selectedKey={selectedThreadId}
              onSelectTopic={setSelectedThreadId}
            />
          </div>
        </Focusable>

        <Focusable id="thread-detail-panel">
          <div
            style={{
              borderRadius: 14,
              padding: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <ThreadDetailPanel
              threadId={selectedThreadId}
              onChanged={() => void onDataChanged()}
              onClose={() => setSelectedThreadId(null)}
            />
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
                  <button onClick={() => void applyMode(ContextMode.QUIET)} style={btn(mode === ContextMode.QUIET)}>
                    Ruhe
                  </button>
                  <button onClick={() => void applyMode(ContextMode.NORMAL)} style={btn(mode === ContextMode.NORMAL)}>
                    Normal
                  </button>
                  <button onClick={() => void applyMode(ContextMode.FOCUS)} style={btn(mode === ContextMode.FOCUS)}>
                    Fokus
                  </button>
                </div>
              </div>

              <div style={{ height: 320 }}>
                <VisualDebugCanvas state={visualState} />
              </div>

              <TextImpulseInput
                threadId={selectedThreadId}
                onCaptured={() => void onDataChanged()}
              />
              <VoiceHoldButton
                threadId={selectedThreadId}
                onImpulseCaptured={() => void onDataChanged()}
              />

              <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                <CenterActionButton
                  onTap={() => console.log('tap')}
                  onHoldStart={() => console.log('hold start')}
                  onHoldEnd={() => console.log('hold end')}
                />
              </div>
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
            <NewTopicQuick onCreated={() => void onDataChanged()} />
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