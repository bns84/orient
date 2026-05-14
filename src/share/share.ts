/**
 * ORIENT - Share Action
 * 
 * Kopiert Share-Text in die Zwischenablage.
 * 
 * Respektiert ORIENT_DNA:
 * - Ruhe vor Geschwindigkeit (kein JSON, kein DB-Wording)
 * - Transparenz (Event-Logging)
 */

import { composeShareCard, ShareTopic } from './compose';
import { logEvent } from '../db/events';

export async function shareToClipboard(topic: ShareTopic) {
  const text = composeShareCard(topic);
  await navigator.clipboard.writeText(text);
  await logEvent('share.copied', { topicKey: topic.key });
  return text;
}
