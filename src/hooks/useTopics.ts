/**
 * ORIENT - useTopics Hook
 * 
 * Live-Update Hook für Topics aus IndexedDB.
 * 
 * Respektiert ORIENT_DNA:
 * - Local-first (nur lokale Daten)
 * - Transparenz (Live-Updates via Dexie Hooks)
 */

import React from 'react';
import { listTopics } from '../db/topics';
import { orientDb, TopicRow } from '../db/orientDb';

export function useTopics() {
  const [rows, setRows] = React.useState<TopicRow[]>([]);

  React.useEffect(() => {
    let alive = true;

    const load = async () => {
      const t = await listTopics();
      if (!alive) return;
      setRows(t);
    };

    const onChange = () => {
      // Delay to avoid TransactionInactiveError (hook called during transaction)
      setTimeout(() => {
        void load();
      }, 0);
    };

    void load();

    orientDb.topics.hook('creating', onChange);
    orientDb.topics.hook('updating', onChange);
    orientDb.topics.hook('deleting', onChange);

    return () => {
      alive = false;
      orientDb.topics.hook('creating').unsubscribe(onChange);
      orientDb.topics.hook('updating').unsubscribe(onChange);
      orientDb.topics.hook('deleting').unsubscribe(onChange);
    };
  }, []);

  return rows;
}
