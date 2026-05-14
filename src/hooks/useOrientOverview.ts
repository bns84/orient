/**
 * ORIENT - Overview Hook
 * 
 * Polling-Hook für Overview-Daten.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (polling minimal, 1s)
 * - Transparenz (alle Daten sichtbar)
 */

import { useEffect, useState } from 'react';
import { getOrientOverview, OrientOverview } from '../db/overview';

export function useOrientOverview(pollMs = 1000) {
  const [data, setData] = useState<OrientOverview | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const o = await getOrientOverview();
      if (!alive) return;
      setData(o);
    };

    load();
    const t = window.setInterval(load, pollMs);

    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [pollMs]);

  return data;
}
