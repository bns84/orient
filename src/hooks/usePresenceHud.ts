/**
 * HUD-Daten für den Hauptscreen (Eskalation + Unsicherheit).
 */

import { useEffect, useState } from 'react';
import { useAppServices } from '../ui/wiring/AppServicesContext';
import { EscalationLevel } from '../core/escalation/EscalationLevel';
import { shouldShowHud } from '../utils/escalationLabel';
import { isAiEnrichmentEnabled } from '../services/ai/aiClient';
import { enrichThreadSummaryLine } from '../services/ai/enrichThreadSummary';
import { thoughtText } from '../services/thought-processor';
import { useAppStore } from '../store/useAppStore';

export type PresenceHudView = {
  title: string;
  escalationLevel: EscalationLevel;
  escalationReason: string;
  uncertainties: string[];
  hasFocus: boolean;
  visible: boolean;
};

export function usePresenceHud(selectedThreadId: string | null, refreshKey = 0) {
  const { dailyQuery, threadQuery, contextService, impulseRepo } = useAppServices();
  const companionName = useAppStore((s) => s.companionName);
  const [hud, setHud] = useState<PresenceHudView | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const ctx = await contextService.getCurrent();
      const opts = {
        contextMode: ctx.mode,
        allowHints: true,
        hintBudgetRemaining: ctx.hintBudgetPerDay ?? 3,
      };

      const allImpulses = await impulseRepo.getAll();
      const unlinkedCount = allImpulses.filter((i) => (i.links?.threadIds?.length ?? 0) === 0).length;

      const focus = selectedThreadId
        ? await threadQuery.getThreadSnapshot(selectedThreadId, opts)
        : null;

      if (!alive) return;

      // Unverknüpfte Gedanken haben Vorrang — HUD ist nicht „das oberste Thema“.
      if (!selectedThreadId && unlinkedCount > 0) {
        setHud({
          title: 'Sammelcontainer',
          escalationLevel: EscalationLevel.OBSERVE,
          escalationReason: `${unlinkedCount} Gedanke${unlinkedCount === 1 ? '' : 'n'} warten auf Zuordnung — unten „Alle Themen neu prüfen“ oder neue ähnliche Impulse.`,
          uncertainties: [],
          hasFocus: false,
          visible: true,
        });
        return;
      }

      const daily = await dailyQuery.getDailyView(opts);
      const top = daily.items[0] ?? null;
      const snap = focus ?? top;

      if (!snap) {
        const recent = await impulseRepo.findRecent(8);
        if (!alive) return;
        const visible = recent.length > 0;
        setHud({
          title: 'Sammelcontainer',
          escalationLevel: EscalationLevel.OBSERVE,
          escalationReason: recent.length
            ? `${recent.length} Gedanke${recent.length === 1 ? '' : 'n'} — Themen entstehen aus Mustern`
            : 'Noch leer',
          uncertainties: [],
          hasFocus: false,
          visible,
        });
        return;
      }

      let uncertainties = snap.uncertainties.slice(0, 2);
      let reason = snap.escalation.reason;
      const visible = shouldShowHud(snap.escalation.level, uncertainties.length, Boolean(focus));

      if (!focus && top) {
        reason = `Schwerpunkt unter deinen Themen (nicht der Sammelcontainer): ${reason}`;
      }

      setHud({
        title: snap.title,
        escalationLevel: snap.escalation.level,
        escalationReason: reason,
        uncertainties,
        hasFocus: Boolean(focus),
        visible,
      });

      if (isAiEnrichmentEnabled() && snap) {
        const snippets = (await impulseRepo.findByThread(snap.threadId))
          .map((i) => thoughtText(i.content))
          .filter(Boolean);
        const enriched = await enrichThreadSummaryLine(snap.summary, {
          companionName,
          title: snap.title,
          status: snap.status,
          impulseSnippets: snippets,
        });
        if (!alive) return;
        reason = enriched.summary;
        if (enriched.uncertainties.length) uncertainties = enriched.uncertainties;
        if (!focus && top) {
          reason = `Schwerpunkt: ${reason}`;
        }
        setHud({
          title: snap.title,
          escalationLevel: snap.escalation.level,
          escalationReason: reason,
          uncertainties,
          hasFocus: Boolean(focus),
          visible,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedThreadId, refreshKey, dailyQuery, threadQuery, contextService, impulseRepo, companionName]);

  return hud;
}
