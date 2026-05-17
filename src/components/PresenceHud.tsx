/**
 * Minimales HUD — Eskalation & Unsicherheit (ruhig, ohne Feed).
 */

import React from 'react';
import type { PresenceHudView } from '../hooks/usePresenceHud';
import { escalationLevelLabel, escalationLevelShort } from '../utils/escalationLabel';

type Props = {
  hud: PresenceHudView | null;
};

export function PresenceHud({ hud }: Props) {
  if (!hud?.visible) return null;

  const levelLabel = escalationLevelLabel(hud.escalationLevel);
  const levelShort = escalationLevelShort(hud.escalationLevel);

  return (
    <aside className="presence-hud" aria-label="Orient Status">
      <div className="presence-hud__row">
        <span className="presence-hud__level" data-level={hud.escalationLevel}>
          {levelShort} · {levelLabel}
        </span>
        <span className="presence-hud__title">{hud.title}</span>
      </div>
      {hud.escalationReason ? (
        <p className="presence-hud__reason">{hud.escalationReason}</p>
      ) : null}
      {hud.uncertainties.length > 0 ? (
        <p className="presence-hud__uncertainty">
          Unsicher: {hud.uncertainties.join(' · ')}
        </p>
      ) : null}
    </aside>
  );
}
