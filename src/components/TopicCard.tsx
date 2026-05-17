/**

 * ORIENT - Topic Card Component

 *

 * Themen-Karte; Wichtigkeit wird automatisch aus Nutzung abgeleitet (siehe interest.ts).

 */



import React from 'react';

import { markTopicSeen } from '../db/topics';



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

  selected?: boolean;

  onSelect?: (key: string) => void;

};



export function TopicCard({ topic, selected, onSelect }: Props) {

  React.useEffect(() => {

    if (topic.isNew) {

      setTimeout(() => {

        void markTopicSeen(topic.key);

      }, 2000);

    }

  }, [topic.key, topic.isNew]);



  return (

    <div

      role={onSelect ? 'button' : undefined}

      tabIndex={onSelect ? 0 : undefined}

      onClick={() => onSelect?.(topic.key)}

      onKeyDown={(e) => {

        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {

          e.preventDefault();

          onSelect(topic.key);

        }

      }}

      aria-label={onSelect ? `Thema ${topic.title} öffnen` : undefined}

      aria-pressed={selected}

      style={{

        ...cardStyle,

        cursor: onSelect ? 'pointer' : 'default',

        border: selected

          ? '1px solid rgba(120,160,255,0.45)'

          : '1px solid rgba(255,255,255,0.14)',

        background: selected ? 'rgba(120,160,255,0.1)' : 'rgba(255,255,255,0.06)',

        boxShadow: selected ? '0 0 20px rgba(80,120,255,0.12)' : undefined,

      }}

    >

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

  );

}



const cardStyle: React.CSSProperties = {

  borderRadius: 18,

  padding: 14,

  border: '1px solid rgba(255,255,255,0.14)',

  background: 'rgba(255,255,255,0.06)',

};

