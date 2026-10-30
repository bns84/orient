/**
 * Antwort unter der Bubble. Während die KI denkt: „…“ und ein Knopf zum Abbrechen.
 */

import React from 'react';
import { useAnswerStore } from '../store/useAnswerStore';

type Props = { hint: string };

export function AnswerLine({ hint }: Props) {
  const text = useAnswerStore((s) => s.text);
  const thinking = useAnswerStore((s) => s.thinking);
  const cancel = useAnswerStore((s) => s.cancel);
  const clear = useAnswerStore((s) => s.clear);

  if (thinking) {
    return (
      <p className="home-main__hint" aria-live="polite">
        …{' '}
        <button type="button" className="home-main__link" onClick={cancel}>
          Abbrechen
        </button>
      </p>
    );
  }
  if (text) {
    return (
      <p className="home-main__hint home-main__answer" aria-live="polite" onClick={clear}>
        {text}
      </p>
    );
  }
  return <p className="home-main__hint">{hint}</p>;
}
