/**
 * ORIENT - Topic List Component
 *
 * Zeigt Thread-Themen (kanonisch über `topics`-Prop).
 */

import React from 'react';
import { rankTopics } from '../db/interest';
import { getPresentationHints } from '../behavior/engine';
import { TopicCard } from './TopicCard';

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
  topics?: Topic[];
  selectedKey?: string | null;
  onSelectTopic?: (key: string) => void;
  /** Erhöhen, wenn Interesse-Gewichte sich geändert haben (Neusortierung). */
  interestRankKey?: number;
  listTitle?: string;
};

function dedupeByKey(topics: Topic[]): Topic[] {
  const byKey = new Map<string, Topic>();
  for (const t of topics) {
    if (!byKey.has(t.key)) {
      byKey.set(t.key, t);
    }
  }
  return [...byKey.values()];
}

export function TopicList({
  topics = [],
  selectedKey,
  onSelectTopic,
  interestRankKey = 0,
  listTitle = 'Themen',
}: Props) {
  const hints = getPresentationHints();
  const allTopics = React.useMemo(() => dedupeByKey(topics), [topics]);

  const [ranked, setRanked] = React.useState<Topic[]>(allTopics);

  React.useEffect(() => {
    let alive = true;
    void (async () => {
      const r = await rankTopics(allTopics);
      if (!alive) return;
      setRanked(dedupeByKey(r));
    })();
    return () => {
      alive = false;
    };
  }, [allTopics, interestRankKey]);

  const topicCount = hints?.topicCount ?? 4;
  const shown = ranked.slice(0, topicCount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>{listTitle}</div>
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
