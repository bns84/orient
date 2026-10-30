/**
 * ORIENT — Hauptscreen nach Onboarding
 *
 * Sichtbar: Uhr, Name, Bubble, „Halten & sprechen.“, Voice.
 * Themen, Sammlung, HUD und Modi nur mit ?debug=1.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppServices } from '../../ui/wiring/AppServicesContext';
import { VisualDebugCanvas } from '../../ui/components/VisualDebugCanvas';
import { VoiceHoldButton } from '../../components/VoiceHoldButton';
import { AnswerLine } from '../../components/AnswerLine';
import { TextImpulseInput } from '../../components/TextImpulseInput';
import { ThreadDetailPanel } from '../../components/ThreadDetailPanel';
import { CollectionInbox } from '../../components/CollectionInbox';
import { MorningBriefing } from '../../components/MorningBriefing';
import { EveningRitual } from '../../components/EveningRitual/EveningRitual';
import { TopicList } from '../../components/TopicList';
import { useDailyRituals } from '../../hooks/useDailyRituals';
import { useThreadTopics } from '../../hooks/useThreadTopics';
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
import { useAppStore } from '../../store/useAppStore';
import { HomeHeader } from './HomeHeader';
import { PresenceHud } from '../../components/PresenceHud';
import { usePresenceHud } from '../../hooks/usePresenceHud';
import { useBubbleKnowledge } from '../../hooks/useBubbleKnowledge';
import './home-screen.css';

const COMPANION_HINT = 'Halten & sprechen.';

export function HomeScreen() {
  const services = useAppServices();
  const { topics: threadTopics, reload: reloadTopics } = useThreadTopics();
  const presence = useAppStore((s) => s.presence);
  const pulsePresence = useAppStore((s) => s.pulsePresence);

  const [visualState, setVisualState] = useState<VisualState | null>(null);
  const [mode, setMode] = useState<ContextMode>(ContextMode.NORMAL);
  const [interestRankKey, setInterestRankKey] = useState(0);
  const [collectionRefreshKey, setCollectionRefreshKey] = useState(0);
  const [bubbleSize, setBubbleSize] = useState(260);
  const [debugThreadId, setDebugThreadId] = useState<string | null>(null);
  const bubbleSlotRef = useRef<HTMLDivElement>(null);
  const prevEscalationRef = useRef<EscalationLevel | null>(null);

  const rituals = useDailyRituals(true);
  const hudRefreshKey = interestRankKey + collectionRefreshKey;
  const presenceHud = usePresenceHud(debugThreadId, hudRefreshKey);
  const {
    knowledge: bubbleKnowledgeSnapshot,
    working: bubbleDataWorking,
    sortHighlightRegion,
    runWithWorking: runBubbleWorking,
  } = useBubbleKnowledge(hudRefreshKey);
  const bubbleWorking = bubbleDataWorking || presence === 'think';

  const bumpTopicRank = useCallback(() => {
    setInterestRankKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const el = bubbleSlotRef.current;
    if (!el) return;
    const measure = () => setBubbleSize(Math.round(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const refreshVisual = useCallback(async () => {
    const ctx = await services.contextService.getCurrent();
    setMode(ctx.mode);

    const daily = await services.dailyQuery.getDailyView({
      contextMode: ctx.mode,
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
        ctx.mode === ContextMode.QUIET
          ? 'QUIET'
          : ctx.mode === ContextMode.FOCUS
            ? 'FOCUS'
            : 'NORMAL',
      clusterHint,
    });

    setVisualState(vs);
  }, [services]);

  const reconcileTopics = useCallback(
    async (fullCatalog = true) => {
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
    void reconcileTopics(true).then(() => {
      reloadTopics();
      setCollectionRefreshKey((k) => k + 1);
      bumpTopicRank();
    });
  }, [reconcileTopics, reloadTopics, bumpTopicRank]);

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

  return (
    <div className="home-screen">
      <HomeHeader />

      <main className="home-body">
        <section className="home-main" aria-label="Präsenz">
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
          <AnswerLine hint={COMPANION_HINT} />
        </section>
      </main>

      <footer className="home-footer">
        <VoiceHoldButton
          threadId={null}
          reconcileTopics={reconcileTopics}
          onImpulseCaptured={() => void onDataChanged()}
        />
      </footer>

      <DebugOnly>
        <div className="home-debug">
          <PresenceHud hud={presenceHud} />

          {rituals.morning.visible && rituals.morning.lines ? (
            <MorningBriefing
              lines={rituals.morning.lines}
              onDismiss={() => void rituals.morning.dismiss()}
            />
          ) : null}

          {rituals.evening.visible && rituals.evening.line ? (
            <EveningRitual
              line={rituals.evening.line}
              onDismiss={() => void rituals.evening.dismiss()}
            />
          ) : null}

          <div className="home-debug__section">
            <div className="home-debug__title">Themen (Debug)</div>
            {threadTopics.length > 0 ? (
              <TopicList
                topics={threadTopics}
                selectedKey={debugThreadId}
                onSelectTopic={(key) =>
                  setDebugThreadId((prev) => (prev === key ? null : key))
                }
                interestRankKey={interestRankKey}
                listTitle=""
              />
            ) : (
              <p className="home-debug__empty">Noch keine Themen.</p>
            )}
          </div>

          <div className="home-debug__section">
            <div className="home-debug__title">Sammelcontainer</div>
            <CollectionInbox
              refreshKey={collectionRefreshKey}
              onReconcileTopics={() => reconcileTopics(true)}
              onReconcileDone={async () => {
                await reloadTopics();
                bumpTopicRank();
                setCollectionRefreshKey((k) => k + 1);
                await refreshVisual();
              }}
            />
          </div>

          {debugThreadId ? (
            <div className="home-debug__section">
              <div className="home-debug__title">Thema im Fokus</div>
              <ThreadDetailPanel
                threadId={debugThreadId}
                onChanged={() => void onDataChanged()}
                onClose={() => setDebugThreadId(null)}
              />
            </div>
          ) : null}

          <div className="home-debug__section">
            <div className="home-debug__title">Gedanke (Text)</div>
            <TextImpulseInput
              threadId={debugThreadId}
              reconcileTopics={reconcileTopics}
              onCaptured={() => void onDataChanged()}
            />
          </div>

          <div className="home-debug__tools">
            <div className="home-debug__title">Werkzeuge</div>
            <div className="home-debug__canvas">
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
        </div>
      </DebugOnly>
    </div>
  );
}
