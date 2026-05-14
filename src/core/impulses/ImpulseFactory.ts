/**
 * ORIENT - Impulse Factory
 * 
 * Einheitliche Erstellung von Impulsen.
 * Keine UI-Abhängigkeiten.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Stabilität durch einheitliche Erstellung
 */

import { Impulse, ImpulseContent, ImpulseMeta } from './Impulse';
import { ImpulseState } from './ImpulseState';

export class ImpulseFactory {
  /**
   * Erstellt einen neuen Impulse
   * Minimaler Schutz: leere Impulse verhindern
   */
  static create(params: {
    id: string;
    content: ImpulseContent;
    createdAt?: Date;
    meta?: Partial<ImpulseMeta>;
  }): Impulse {
    const createdAt = params.createdAt ?? new Date();

    // Minimaler Schutz: leere Impulse verhindern
    const hasText = !!params.content.text?.trim();
    const hasTranscript = !!params.content.transcript?.trim();
    const hasPayload = !!params.content.payloadRef?.trim();

    if (!hasText && !hasTranscript && !hasPayload) {
      throw new Error('Impulse must have at least one content field (text/transcript/payloadRef).');
    }

    return {
      id: params.id,
      content: params.content,
      state: ImpulseState.DUST,
      createdAt,
      links: { threadIds: [], entityIds: [] },
      meta: {
        pinned: false,
        ...params.meta,
      },
    };
  }
}
