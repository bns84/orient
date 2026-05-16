import type { SessionMood } from '../behavior/types';
import type { AppMood } from './types';

export function sessionMoodToAppMood(sessionMood: SessionMood): AppMood {
  switch (sessionMood) {
    case 'focused':
      return 'fokussiert';
    case 'tired':
      return 'müde';
    case 'curious':
      return 'neugierig';
    case 'scattered':
      return 'aktiv';
    case 'neutral':
    default:
      return 'ruhe';
  }
}
