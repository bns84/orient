import { aiJsonComplete } from './aiClient';
import type { AiMorningBriefing } from './types';

export async function enrichMorningBriefingLines(
  fallbackLines: string[],
  params: {
    companionName: string;
    impulseSnippets: string[];
    threadTitles: string[];
  },
): Promise<string[]> {
  const ai = await aiJsonComplete<AiMorningBriefing>({
    task: 'morning_briefing',
    companionName: params.companionName,
    userPrompt: JSON.stringify({
      instruction:
        'Kurzes Morgen-Briefing, max 4 Zeilen als JSON { lines: string[] }. Ruhig, ohne Druck.',
      threads: params.threadTitles.slice(0, 5),
      recentThoughts: params.impulseSnippets.slice(0, 8),
      fallback: fallbackLines,
    }),
  });

  if (!ai?.lines?.length) return fallbackLines;

  const lines = ai.lines
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);

  return lines.length > 0 ? lines : fallbackLines;
}
