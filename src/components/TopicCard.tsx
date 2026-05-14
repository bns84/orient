/**
 * ORIENT - Topic Card Component
 * 
 * Topic-Karte mit weichem Interest-Hook.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (dezentes Feedback)
 * - Keine Favoritenliste (nur weiche Gewichtung)
 * - Menschliche Sprache ("Merke ich mir.")
 */

import React from 'react';
import { bumpInterest } from '../db/interest';
import { TopicShareButton } from './TopicShareButton';
import { ShareTopic } from '../share/compose';

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
  topic: Topic;
};

export function TopicCard({ topic }: Props) {
  const [bumped, setBumped] = React.useState(false);

  // Mark topic as seen when component mounts (if it's new)
  React.useEffect(() => {
    if (topic.isNew) {
      // Delay to avoid blocking render
      setTimeout(() => {
        void markTopicSeen(topic.key);
      }, 2000); // Mark as seen after 2 seconds
    }
  }, [topic.key, topic.isNew]);

  const onBump = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await bumpInterest(topic.key, 10);
    setBumped(true);
    window.setTimeout(() => setBumped(false), 900);
  };

  const shareTopic: ShareTopic = {
    key: topic.key,
    title: topic.title,
    summary: topic.summary,
    bullets: topic.bullets,
    link: topic.link,
    source: topic.source,
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 14, opacity: 0.92 }}>{topic.title}</div>
            {topic.isNew && (
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.7,
                  padding: '2px 6px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                neu
              </div>
            )}
          </div>
          {topic.subtitle && (
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>{topic.subtitle}</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <TopicShareButton topic={shareTopic} />
          <button
            onClick={onBump}
            title="Das interessiert mich"
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.16)',
              background: bumped ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
              color: 'white',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            ✓
          </button>
        </div>
      </div>

      {bumped && (
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>Merke ich mir.</div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 14,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
};
