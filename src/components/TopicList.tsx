/**
 * ORIENT - Topic List Component
 * 
 * Liste von Topics mit Ranking nach Interest.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (weiches Ranking)
 * - Keine Favoritenliste (nur weiche Gewichtung)
 */

import React from 'react';
import { rankTopics } from '../db/interest';
import { getPresentationHints } from '../behavior/engine';
import { TopicCard } from './TopicCard';
import { useTopics } from '../hooks/useTopics';
import { TopicRow } from '../db/orientDb';

type Topic = {
  key: string;
  title: string;
  subtitle?: string;
  summary?: string;
  bullets?: string[];
  link?: string;
  source?: string;
  isNew?: boolean;
};

type Props = {
  topics?: Topic[]; // systemTopics (optional)
  selectedKey?: string | null;
  onSelectTopic?: (key: string) => void;
};

export function TopicList({ topics: systemTopics = [], selectedKey, onSelectTopic }: Props) {
  const dbTopics = useTopics(); // from DB
  const hints = getPresentationHints();

  // Merge: systemTopics first, then dbTopics
  const allTopics = React.useMemo(() => {
    const db = dbTopics.map((t: TopicRow) => ({
      key: t.key,
      title: t.title,
      subtitle: undefined,
      summary: t.summary,
      bullets: undefined,
      link: undefined,
      source: undefined,
      isNew: t.isNew ?? false,
    }));
    return [...systemTopics, ...db];
  }, [dbTopics, systemTopics]);

  const [ranked, setRanked] = React.useState<Topic[]>(allTopics);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const r = await rankTopics(allTopics);
      if (!alive) return;
      setRanked(r);
    })();
    return () => {
      alive = false;
    };
  }, [allTopics]);

  const topicCount = hints?.topicCount ?? 4;
  const shown = ranked.slice(0, topicCount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>Themen</div>
      {shown.length === 0 && (
        <div style={{ fontSize: 12, opacity: 0.6 }}>Keine Themen verfügbar.</div>
      )}
      {shown.map((topic) => (
        <TopicCard
          key={topic.key}
          topic={topic}
          selected={topic.key === selectedKey}
          onSelect={onSelectTopic}
        />
      ))}
    </div>
  );
}
