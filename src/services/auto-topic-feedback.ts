import type { AutoTopicResult } from './auto-topic-engine';

/** Kurzes UI-Feedback nach einer Abgleich-Runde. */
export function formatAutoTopicFeedback(result: AutoTopicResult): string {
  const parts: string[] = [];
  if (result.impulsesLinked > 0) {
    parts.push(
      `${result.impulsesLinked} Gedanke${result.impulsesLinked === 1 ? '' : 'n'} zugeordnet`,
    );
  }
  if (result.impulsesReassigned > 0) {
    parts.push(`${result.impulsesReassigned} umsortiert`);
  }
  if (result.threadsCreated > 0) {
    parts.push(`${result.threadsCreated} Thema${result.threadsCreated === 1 ? '' : 'n'} neu`);
  }
  if (result.threadsConsolidated > 0) {
    parts.push(`${result.threadsConsolidated} zusammengeführt`);
  }
  if (parts.length > 0) return parts.join(' · ');
  return 'Keine Änderung: noch kein klares Muster (oft ab 2 ähnlichen Gedanken) oder bereits passend zugeordnet.';
}
