/**
 * ORIENT - Thread Lifecycle Engine
 * 
 * Der Kern der Thread-Verwaltung.
 * Immutable, keine Side-Effects.
 * 
 * Respektiert ORIENT_DNA:
 * - Kein Erzwingen
 * - Kein Auto-Löschen
 * - Rückfall möglich
 * - Stille respektiert
 * - Gedanken werden nicht gelöscht, nur DORMANT
 */

import { Thread } from './Thread';
import { ThreadStatus } from './ThreadStatus';

export class ThreadLifecycle {
  /**
   * Aktiviert einen Thread
   * CLOSED Threads können nicht aktiviert werden (müssen erst reaktiviert werden)
   */
  static activate(thread: Thread): Thread {
    if (thread.status === ThreadStatus.CLOSED) {
      return thread; // Kein Erzwingen - CLOSED bleibt CLOSED
    }

    return {
      ...thread,
      status: ThreadStatus.ACTIVE,
      updatedAt: new Date(),
    };
  }

  /**
   * Markiert Thread als OBSERVED
   * Nur von ACTIVE möglich
   */
  static markObserved(thread: Thread): Thread {
    if (thread.status !== ThreadStatus.ACTIVE) {
      return thread; // Kein Erzwingen
    }

    return {
      ...thread,
      status: ThreadStatus.OBSERVED,
      updatedAt: new Date(),
    };
  }

  /**
   * Markiert Thread als DORMANT (schlafend)
   * Nur von ACTIVE oder OBSERVED möglich
   * Thread wird NICHT gelöscht - DNA: Gedanken werden nicht gelöscht
   */
  static markDormant(thread: Thread): Thread {
    if (thread.status !== ThreadStatus.ACTIVE && thread.status !== ThreadStatus.OBSERVED) {
      return thread; // Kein Erzwingen
    }

    return {
      ...thread,
      status: ThreadStatus.DORMANT,
      updatedAt: new Date(),
    };
  }

  /**
   * Reaktiviert einen DORMANT Thread
   * Nur explizite Reaktivierung möglich - DNA: keine automatische Reaktivierung
   */
  static reactivate(thread: Thread): Thread {
    if (thread.status !== ThreadStatus.DORMANT) {
      return thread; // Kein Erzwingen - nur DORMANT kann reaktiviert werden
    }

    return {
      ...thread,
      status: ThreadStatus.ACTIVE,
      updatedAt: new Date(),
    };
  }

  /**
   * Schließt einen Thread
   * Kann später reaktiviert werden (später erweiterbar)
   * DNA: CLOSED bedeutet explizit abgeschlossen, nicht gelöscht
   */
  static close(thread: Thread): Thread {
    return {
      ...thread,
      status: ThreadStatus.CLOSED,
      updatedAt: new Date(),
    };
  }

  /**
   * Prüft, ob ein Status-Übergang erlaubt ist
   * DNA: Transparenz statt Blackbox
   */
  static canTransition(from: ThreadStatus, to: ThreadStatus): boolean {
    // CLOSED ist Endzustand (kann später reaktiviert werden)
    if (from === ThreadStatus.CLOSED && to !== ThreadStatus.CLOSED) {
      return false;
    }

    // DORMANT kann nur zu ACTIVE (Reaktivierung)
    if (from === ThreadStatus.DORMANT && to !== ThreadStatus.ACTIVE) {
      return false;
    }

    // Alle anderen Übergänge sind erlaubt (flexibel, DNA-konform)
    return true;
  }
}
