import { describe, expect, it, vi } from 'vitest';
import { buildCollectionMarkdown } from '../../../src/services/collection-export';

describe('buildCollectionMarkdown', () => {
  it('lists recent impulses', async () => {
    const impulseRepo = {
      findRecent: vi.fn(async () => [
        {
          id: '1',
          createdAt: new Date('2026-05-17T12:00:00'),
          content: { text: 'Testgedanke' },
          links: { threadIds: [] },
        },
      ]),
    };

    const { content, filename } = await buildCollectionMarkdown(impulseRepo as never);
    expect(filename).toContain('orient_sammlung_');
    expect(content).toContain('Testgedanke');
    expect(content).toContain('Sammelcontainer');
  });
});
