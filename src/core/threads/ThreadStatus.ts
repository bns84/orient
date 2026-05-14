/**
 * ORIENT - Thread Status
 * 
 * Thread-Status respektiert ORIENT_DNA:
 * - Keine automatische Löschung
 * - DORMANT statt DELETE
 * - CLOSED kann später reaktiviert werden
 */

export enum ThreadStatus {
  ACTIVE = 'ACTIVE',
  OBSERVED = 'OBSERVED',
  DORMANT = 'DORMANT',
  CLOSED = 'CLOSED',
}
