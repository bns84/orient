/**
 * ORIENT - Impulse Linker
 * 
 * Verknüpfungen sind explizit und idempotent.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit
 * - Transparenz statt Blackbox
 * - Keine Side-Effects (immutable)
 */

import { Impulse } from './Impulse';

export class ImpulseLinker {
  /**
   * Verknüpft Impulse mit Thread (idempotent)
   */
  static linkToThread(impulse: Impulse, threadId: string): Impulse {
    if (impulse.links.threadIds.includes(threadId)) {
      return impulse; // Bereits verknüpft
    }

    return {
      ...impulse,
      links: {
        ...impulse.links,
        threadIds: [...impulse.links.threadIds, threadId],
      },
    };
  }

  /**
   * Entfernt Verknüpfung zu Thread (idempotent)
   */
  static unlinkFromThread(impulse: Impulse, threadId: string): Impulse {
    if (!impulse.links.threadIds.includes(threadId)) {
      return impulse; // Nicht verknüpft
    }

    return {
      ...impulse,
      links: {
        ...impulse.links,
        threadIds: impulse.links.threadIds.filter((id) => id !== threadId),
      },
    };
  }

  /**
   * Verknüpft Impulse mit Entity (idempotent)
   */
  static linkToEntity(impulse: Impulse, entityId: string): Impulse {
    if (impulse.links.entityIds.includes(entityId)) {
      return impulse; // Bereits verknüpft
    }

    return {
      ...impulse,
      links: {
        ...impulse.links,
        entityIds: [...impulse.links.entityIds, entityId],
      },
    };
  }

  /**
   * Entfernt Verknüpfung zu Entity (idempotent)
   */
  static unlinkFromEntity(impulse: Impulse, entityId: string): Impulse {
    if (!impulse.links.entityIds.includes(entityId)) {
      return impulse; // Nicht verknüpft
    }

    return {
      ...impulse,
      links: {
        ...impulse.links,
        entityIds: impulse.links.entityIds.filter((id) => id !== entityId),
      },
    };
  }

  /**
   * Pinnt einen Impulse (idempotent)
   */
  static pin(impulse: Impulse): Impulse {
    if (impulse.meta.pinned) {
      return impulse; // Bereits gepinnt
    }

    return {
      ...impulse,
      meta: {
        ...impulse.meta,
        pinned: true,
      },
    };
  }

  /**
   * Entfernt Pin (idempotent)
   */
  static unpin(impulse: Impulse): Impulse {
    if (!impulse.meta.pinned) {
      return impulse; // Nicht gepinnt
    }

    return {
      ...impulse,
      meta: {
        ...impulse.meta,
        pinned: false,
      },
    };
  }
}
