/**
 * Sammelcontainer als Markdown (wenn noch keine Themen da sind).
 */

import type { ImpulseRepository } from '../core/impulses/ImpulseRepository';

function impulsePreview(imp: { content: { text?: string; transcript?: string } }): string {
  return imp.content.text?.trim() || imp.content.transcript?.trim() || '(ohne Text)';
}

export async function buildCollectionMarkdown(
  impulseRepo: ImpulseRepository,
  now = new Date(),
): Promise<{ content: string; filename: string }> {
  const items = await impulseRepo.findRecent(48);
  const date = now.toISOString().slice(0, 10);

  const lines = [
    `# ORIENT — Sammelcontainer (${date})`,
    '',
    '_Roh gesammelt — Themen entstehen aus Mustern im Laufe der Zeit._',
    '',
  ];

  if (items.length === 0) {
    lines.push('_Noch leer._');
  } else {
    for (const imp of items) {
      const when = imp.createdAt.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      const tag =
        imp.links.threadIds.length > 0 ? ' · schon einem Thema zugeordnet' : ' · noch ohne Thema';
      lines.push(`- **${when}**${tag}: ${impulsePreview(imp)}`);
    }
  }

  return {
    content: lines.join('\n').trim(),
    filename: `orient_sammlung_${date}.md`,
  };
}
