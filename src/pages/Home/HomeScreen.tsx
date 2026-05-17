/**
 * ORIENT — Hauptscreen nach Onboarding (Cursor Schritt 12)
 *
 * Layout: Header (Uhr + Mood) · Bubble ~60 % · Voice unten
 * Swipe rechts → Themen · Swipe unten → Sammelcontainer / Detail
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppServices } from '../../ui/wiring/AppServicesContext';
import { useThreadTopics } from '../../hooks/useThreadTopics';
import { useSwipePanels } from '../../hooks/useSwipePanels';
import { VisualDebugCanvas } from '../../ui/components/VisualDebugCanvas';
import { VoiceHoldButton } from '../../components/VoiceHoldButton';
import { TextImpulseInput } from '../../components/TextImpulseInput';
import { ThreadDetailPanel } from '../../components/ThreadDetailPanel';
import { CollectionInbox } from '../../components/CollectionInbox';
import { MorningBriefing } from '../../components/MorningBriefing';
import { EveningRitual } from '../../components/EveningRitual/EveningRitual';
import { TopicList } from '../../components/TopicList';
import { useDailyRituals } from '../../hooks/useDailyRituals';
import { runAutoTopicEngine } from '../../services/auto-topic-engine';
import {
  markPeriodicTopicReconcileDone,
  shouldRunPeriodicTopicReconcile,
  startTopicReconcileSchedule,
} from '../../services/topic-reconcile-schedule';
import { OrientBubble } from '../../components/Bubble/OrientBubble';
import { DebugOnly } from '../../debug/DebugOnly';
import { VoiceList } from '../../components/VoiceList';
import { EventList } from '../../components/EventList';
import { GraphInspector } from '../../components/GraphInspector';
import { NewTopicQuick } from '../../components/NewTopicQuick';
import { OverviewPanel } from '../../components/OverviewPanel';
import { BehaviorSnapshot } from '../../components/BehaviorSnapshot';
import { DBExportImport } from '../../components/DBExportImport';
import { VisualStatePipeline } from '../../visual/pipeline/VisualStatePipeline';
import type { VisualState } from '../../visual/kernel/VisualState';
import { startBehaviorSimulation } from '../../behavior/simulate';
import { ContextMode } from '../../core/escalation/ContextMode';
import { EscalationLevel } from '../../core/escalation/EscalationLevel';
import { getPresentationHints } from '../../behavior/engine';
import { useAppStore } from '../../store/useAppStore';
import { recordTopicEngagement } from '../../db/interest';
import { HomeHeader } from './HomeHeader';
import { PresenceHud } from '../../components/PresenceHud';
import { usePresenceHud } from '../../hooks/usePresenceHud';
import { useBubbleKnowledge } from '../../hooks/useBubbleKnowledge';
import './home-screen.css';

export function HomeScreen() {
  const services = useAppServices();
  const { topics: threadTopics, reload: reloadTopics } = useThreadTopics();
  const presence = useAppStore((s) => s.presence);
  const { panel, goMain, goTopics, goDetail, onTouchStart, onTouchEnd } = useSwipePanels();

  const [visualState, setVisualState] = useState<VisualState | null>(null);
  const [mode, setMode] = useState<ContextMode>(ContextMode.NORMAL);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [interestRankKey, setInterestRankKey] = useState(0);
  const [collectionRefreshKey, setCollectionRefreshKey] = useState(0);
  const [bubbleSize, setBubbleSize] = useState(260);
  const bubbleSlotRef = useRef<HTMLDivElement>(null);
  const prevEscalationRef = useRef<EscalationLevel | null>(null);
  const pulsePresence = useAppStore((s) => s.pulsePresence);

  const rituals = useDailyRituals(true);
  const hudRefreshKey = interestRankKey + collectionRefreshKey;
  const presenceHud = usePresenceHud(selectedThreadId, hudRefreshKey);
  const {
    knowledge: bubbleKnowledgeSnapshot,
    working: bubbleDataWorking,
    sortHighlightRegion,
    runWithWorking: runBubbleWorking,
  } = useBubbleKnowledge(hudRefreshKey);
  const bubbleWorking = bubbleDataWorking || presence === 'think';
  const hints = getPresentationHints();
  const companionLine =
    hints?.tone === 'crisp'
      ? "Sag's kurz. Ich bin da."
      : hints?.tone === 'warm'
        ? 'Ganz ruhig. Sag, was du brauchst.'
        : 'Halten & sprechen.';

  const bumpTopicRank = useCallback(() => {
    setInterestRankKey((k) => k + 1);
  }, []);

  const onSelectTopic = useCallback(
    (key: string) => {
      setSelectedThreadId((prev) => {
        const next = prev === key ? null : key;
        if (next) {
          void recordTopicEngagement(next, 'focus').then(() => bumpTopicRank());
          goDetail();
        }
        return next;
      });
    },
    [bumpTopicRank, goDetail],
  );

  useEffect(() => {
    const el = bubbleSlotRef.current;
    if (!el) return;
    const measure = () => setBubbleSize(Math.round(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const reconcileTopics = useCallback(
    async (fullCatalog = false) => {
      const scope = fullCatalog || shouldRunPeriodicTopicReconcile() ? 'full' : 'recent';
      const result = await runAutoTopicEngine(
        {
          threadRepo: services.threadRepo,
          edgeRepo: services.edgeRepo,
          impulseRepo: services.impulseRepo,
        },
        { scope },
      );
      if (scope === 'full') markPeriodicTopicReconcileDone();
      return result;
    },
    [services],
  );

  const notifyEveningEngagement = rituals.evening.notifyEngagement;

  const onDataChanged = useCallback(async () => {
    notifyEveningEngagement();
    await runBubbleWorking(async () => {
      await reconcileTopics();
      await reloadTopics();
      await refreshVisual();
      bumpTopicRank();
      setCollectionRefreshKey((k) => k + 1);
    });
  }, [
    reconcileTopics,
    reloadTopics,
    refreshVisual,
    bumpTopicRank,
    notifyEveningEngagement,
    runBubbleWorking,
  ]);

  useEffect(() => {
    void reconcileTopics(shouldRunPeriodicTopicReconcile()).then(() => reloadTopics());
  }, [reconcileTopics, reloadTopics]);

  useEffect(() => {
    return startTopicReconcileSchedule(async () => {
      await reconcileTopics(true);
      await reloadTopics();
      bumpTopicRank();
      setCollectionRefreshKey((k) => k + 1);
    });
  }, [reconcileTopics, reloadTopics, bumpTopicRank]);

  useEffect(() => {
    const cleanup = startBehaviorSimulation(1000);
    return cleanup;
  }, []);

  useEffect(() => {
    void refreshVisual();
  }, [refreshVisual]);

  useEffect(() => {
    if (!presenceHud?.visible) return;
    const level = presenceHud.escalationLevel;
    const prev = prevEscalationRef.current;
    if (
      level >= EscalationLevel.HINT &&
      prev !== null &&
      level > prev &&
      presenceHud.hasFocus
    ) {
      pulsePresence('think', 1100);
    }
    prevEscalationRef.current = level;
  }, [presenceHud?.escalationLevel, presenceHud?.visible, presenceHud?.hasFocus, pulsePresence]);

  const applyMode = async (m: ContextMode) => {
    await services.contextService.setMode(m);
    await refreshVisual(m);
  };

  const closeDetail = () => {
    goMain();
  };

  return (
    <div className="home-screen" data-detail-open={panel === 'detail' || undefined}>
      <HomeHeader />

      <PresenceHud hud={presenceHud} />

      {rituals.morning.visible && rituals.morning.lines ? (
        <div className="home-morning">
          <MorningBriefing
            lines={rituals.morning.lines}
            onDismiss={() => void rituals.morning.dismiss()}
          />
        </div>
      ) : null}

      {rituals.evening.visible && rituals.evening.line ? (
        <EveningRitual
          line={rituals.evening.line}
          onDismiss={() => void rituals.evening.dismiss()}
        />
      ) : null}

      <div className="home-body">
        <div
          className="home-h-track"
          data-panel={panel === 'topics' ? 'topics' : 'main'}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <section className="home-h-panel home-main" aria-label="Präsenz">
            <div ref={bubbleSlotRef} className="home-bubble-slot">
              <OrientBubble
                state={presence}
                contextMode={mode}
                escalationLevel={presenceHud?.escalationLevel}
                knowledge={bubbleKnowledgeSnapshot}
                working={bubbleWorking}
                sortHighlightRegion={sortHighlightRegion}
                width={bubbleSize}
                height={bubbleSize}
              />
            </div>
            <p className="home-main__hint">{companionLine}</p>
            <div className="home-main__affordances">
              <button type="button" className="home-affordance" onClick={goTopics}>
                → Themen
              </button>
              <button type="button" className="home-affordance" onClick={goDetail}>
                ↓ Sammlung
              </button>
            </div>
          </section>

          <section className="home-h-panel home-topics" aria-label="Themen">
            {panel === 'topics' ? (
              <button type="button" className="home-back" onClick={goMain}>
                ← Zurück
              </button>
            ) : null}
            <div className="home-topics__title">Themen</div>
            {threadTopics.length > 0 ? (
              <TopicList
                topics={threadTopics}
                selectedKey={selectedThreadId}
                onSelectTopic={onSelectTopic}
                interestRankKey={interestRankKey}
                listTitle=""
              />
            ) : (
              <p style={{ fontSize: 13, opacity: 0.55 }}>
                Noch keine Themen — Gedanken landen im Sammelcontainer, ORIENT ordnet später zu.
              </p>
            )}
          </section>
        </div>

        <div className="home-detail-overlay" data-open={panel === 'detail'}>
          <div className="home-detail-sheet" role="dialog" aria-modal={panel === 'detail'}>
            <div className="home-detail-handle" aria-hidden />
            <button type="button" className="home-back" onClick={closeDetail}>
              ↑ Schließen
            </button>

            <div className="home-detail__section">
              <div className="home-detail__section-title">Sammelcontainer</div>
              <CollectionInbox refreshKey={collectionRefreshKey} />
            </div>

            {selectedThreadId ? (
              <div className="home-detail__section">
                <div className="home-detail__section-title">Thema im Fokus</div>
                <ThreadDetailPanel
                  threadId={selectedThreadId}
                  onChanged={() => void onDataChanged()}
                  onClose={() => setSelectedThreadId(null)}
                />
              </div>
            ) : null}

            <div className="home-detail__section">
              <div className="home-detail__section-title">Gedanke</div>
              <TextImpulseInput
                threadId={selectedThreadId}
                reconcileTopics={reconcileTopics}
                onCaptured={() => void onDataChanged()}
              />
            </div>

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
                <div style={{ fontSize: 12, opacity: 0.7 }}>Debug</div>
                <div style={{ height: 220 }}>
                  <VisualDebugCanvas state={visualState} />
                </div>
                <NewTopicQuick onCreated={() => void onDataChanged()} />
                <EventList limit={30} />
                <VoiceList />
                <GraphInspector />
                <BehaviorSnapshot />
                <OverviewPanel />
                <DBExportImport />
              </div>
            </DebugOnly>
          </div>
        </div>
      </div>

      <footer className="home-footer">
        <div className="home-footer__context">
          <button
            type="button"
            className="home-context-btn"
            data-active={mode === ContextMode.QUIET}
            onClick={() => void applyMode(ContextMode.QUIET)}
          >
            Ruhe
          </button>
          <button
            type="button"
            className="home-context-btn"
            data-active={mode === ContextMode.NORMAL}
            onClick={() => void applyMode(ContextMode.NORMAL)}
          >
            Normal
          </button>
          <button
            type="button"
            className="home-context-btn"
            data-active={mode === ContextMode.FOCUS}
            onClick={() => void applyMode(ContextMode.FOCUS)}
          >
            Fokus
          </button>
        </div>
        <VoiceHoldButton
          threadId={selectedThreadId}
          reconcileTopics={reconcileTopics}
          onImpulseCaptured={() => void onDataChanged()}
        />
      </footer>
    </div>
  );
}
