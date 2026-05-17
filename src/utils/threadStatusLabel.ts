import { ThreadStatus } from '../core/threads/ThreadStatus';

const LABELS: Record<ThreadStatus, string> = {
  [ThreadStatus.ACTIVE]: 'aktiv',
  [ThreadStatus.OBSERVED]: 'beobachtet',
  [ThreadStatus.DORMANT]: 'ruhend',
  [ThreadStatus.CLOSED]: 'abgelegt',
};

export function threadStatusLabel(status: string | ThreadStatus): string {
  return LABELS[status as ThreadStatus] ?? 'Thema';
}
