/** KI-Antwort bei Gedanken-Anreicherung (Cursor Schritt 9 / Phase-1-Stub). */
export type AiThoughtHint = {
  topic?: string;
  relatedTopics?: string[];
  category?: string;
  importance?: 'low' | 'medium' | 'high';
};

export type AiMorningBriefing = {
  lines: string[];
};

export type AiThreadSummary = {
  summary: string;
  uncertainties?: string[];
};
