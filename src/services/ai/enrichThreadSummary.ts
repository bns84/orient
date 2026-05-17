import { aiJsonComplete } from './aiClient';
import type { AiThreadSummary } from './types';

export async function enrichThreadSummaryLine(
  fallback: string,
  params: {
    companionName: string;
    title: string;
    status: string;
    impulseSnippets: string[];
  },
): Promise<{ summary: string; uncertainties: string[] }> {
  const ai = await aiJsonComplete<AiThreadSummary>({
    task: 'thread_summary',
    companionName: params.companionName,
    userPrompt: JSON.stringify({
      instruction:
        '1–2 Sätze Zusammenfassung + optional uncertainties[] (max 2). JSON: { summary, uncertainties }',
      title: params.title,
      status: params.status,
      impulses: params.impulseSnippets.slice(0, 10),
      fallback,
    }),
  });

  if (!ai?.summary?.trim()) {
    return { summary: fallback, uncertainties: [] };
  }

  return {
    summary: ai.summary.trim(),
    uncertainties: (ai.uncertainties ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 2),
  };
}
