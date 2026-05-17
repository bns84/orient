/**
 * Abendritual — einmal fragen, kein Zwang.
 */

import React from 'react';

type Props = {
  line: string;
  onDismiss: () => void;
};

export function EveningRitual({ line, onDismiss }: Props) {
  return (
    <section className="home-evening" aria-labelledby="evening-ritual-title">
      <div id="evening-ritual-title" className="home-evening__label">
        Gute Nacht
      </div>
      <p className="home-evening__line">{line}</p>
      <p className="home-evening__hint">Halten & sprechen — oder einfach weitergehen.</p>
      <button type="button" className="home-evening__dismiss" onClick={onDismiss}>
        Alles gut
      </button>
    </section>
  );
}
