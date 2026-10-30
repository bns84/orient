# ORIENT — TODO Phase 1

**Stand:** 2026-05-17 · Commit `8685ec3` · Branch `cursor/phase1-sqlite-onboarding-pwa` · Geschätzter Fortschritt ~92 %

Ziel: Ein funktionierender, ruhiger ORIENT-Core (Denken, Gedächtnis, Beziehung) — ohne Feature-Explosion.

Legende: ✅ erledigt · 🟡 teilweise · ⬜ offen

---

## PRIORITÄT A — Core & Fundament

| # | Task | Status |
|---|------|--------|
| 1 | Lokales Datenmodell (Impulse, Threads, Entities, Edges) + SQLite `sql.js` | ✅ |
| 2 | Lokale Verschlüsselung (Impulse `text`/`transcript`, Key in IDB) | ✅ |
| 3 | Thread-Lifecycle-Engine | ✅ |
| 4 | Graph-Engine minimal + `GraphLinker` / Edges in SQLite | ✅ |

---

## PRIORITÄT B — Interaktion & Beziehung

| # | Task | Status |
|---|------|--------|
| 5 | Input-Layer: Text + Voice → Impulse | ✅ |
| 6 | Kontext-Snapshot (Ruhe / Normal / Fokus) + UI | 🟡 |
| 7 | Eskalationslogik 0–3 (Stufe 4 gesperrt) | ✅ |

Details 6: `ContextService` + Mode-Buttons ✅; Feintuning Eskalation ↔ Visual/Bubble noch offen.

---

## PRIORITÄT C — Wahrnehmung & Feedback

| # | Task | Status |
|---|------|--------|
| 8 | Präsenz / Visual-Denkraum | 🟡 |
| 9 | Themen-Fokus & HUD rudimentär | ✅ |

Details 8:

- ✅ `OrientBubble` (R3F, Bloom, `presence`, `bubbleKnowledge`)
- ✅ Hauptscreen: Bubble zentral ~60 %, Swipes (`HomeScreen`, Schritt 12)
- 🟡 Bubble-Animation / weiteres Feintuning pausiert
- Voice: kein TTS, Firefox ohne Web Speech

Details 9:

- ✅ `CollectionInbox`, `TopicList`, `ThreadDetailPanel` (inline)
- ✅ Auto-Topic + `recordTopicEngagement`
- ✅ `PresenceHud` — Eskalation/Unsicherheit im Haupt-UI

---

## PRIORITÄT D — Produktivität & Nutzen

| # | Task | Status |
|---|------|--------|
| 10 | Snapshot-Export (Markdown, Cursor Pack) | ✅ |
| 11 | Explizite Nutzer-Kommandos (zusammenfassen, ablegen, …) | 🟡 |

Details 11: `commands.ts` + Voice/Text ✅; Randfälle / mehr Phrasen optional.

---

## Zusätzlich umgesetzt (über Basis-TODO)

| Thema | Status |
|-------|--------|
| PWA + Workbox | ✅ |
| Onboarding (Name + Stil, keine Interessen/Themen) | ✅ |
| Sammelcontainer + Auto-Topic-Engine | ✅ |
| `topic-matching.ts` + periodischer Vollabgleich (6 h) | ✅ |
| `thought-processor.ts` (strengeres Sofort-Match) | ✅ 🟡 |
| Navigation ohne Focusable-Overlay | ✅ |
| Morgenroutine + Abendritual UI | ✅ |
| Share entfernt (v3.0 Sprache) | ✅ |
| `useAppStore` | ✅ |
| `useThreadsStore` / `useImpulsesStore` | 🟡 Dateien vorhanden, aber noch nirgends eingebunden |
| Vitest (topic-matching, auto-topic, rituals, commands, …) | ✅ |
| KI-Stub (`VITE_AI_ENABLED`, `services/ai/`) | 🟡 |

---

## NICHT Teil von Phase 1

- Kein Feed · keine Push-Pflicht · keine Gamification
- Keine Cloud-/Supabase-Pflicht
- Kein voller Chat-Verlauf
- **Kein Share-Button** (→ v3.0)
- **Keine manuellen Themen** / Interessen im Onboarding
- **Kein** „Wichtig“-Button (Wichtigkeit aus Nutzung)

---

## Nächste Schritte (empfohlen)

1. 🟡 **Themen-Einordnung** — reale Daten, Matcher/Cluster nachjustieren
2. 🟡 **Kontext ↔ Visual** — Feintuning
3. 🟡 Optional: `useThreadsStore` / `useImpulsesStore` einbinden
4. ⬜ Playwright E2E (optional)

Phase 1 „fertig“ wenn: offline stabil, Sammelcontainer, Auto-Themen, Briefings, Voice+Text, Context, Export — **ruhig und vertrauenswürdig**.

---

## Handoff — letzte größere Änderungen

1. **Hauptscreen** (`HomeScreen`): Bubble zentral, Swipes (Themen/Sammlung), Voice unten.
2. **Auto-Topic:** `topic-matching.ts` (Clustering, strengeres Erfassen), Vollabgleich alle 6 h.
3. **Rituale:** Morgenbriefing + Abendritual (einmal/Tag, kein Zwang).
4. **HUD + Kommandos:** `PresenceHud`, `commands.ts` (Voice/Text).
5. **Bubble:** Wissen aus Impulsen/Threads (`useBubbleKnowledge`); weiteres Tuning pausiert.

**Wichtige Dateien:** `HomeScreen.tsx`, `auto-topic-engine.ts`, `topic-matching.ts`, `thought-processor.ts`, `commands.ts`, `CollectionInbox.tsx`

**Geschätzte Restzeit Phase 1:** ~4–6 h (Feinschliff, kein neues Großfeature)

---

## Cursor-Arbeitsplan (Schritte 1–13)

| Schritt | Thema | Status |
|---------|--------|--------|
| 1 | PWA | ✅ |
| 2 | SQLite & Repositories | ✅ |
| 3 | Verschlüsselung | ✅ |
| 4 | Lifecycle & Graph | ✅ |
| 5 | Zustand Stores | 🟡 |
| 6 | Präsenz-Bubble | ✅ |
| 7 | Sprache → Impulse | ✅ |
| 8 | Auto-Topic-Engine | ✅ 🟡 |
| 9 | Gedanken-Verarbeitung | ✅ 🟡 |
| 10 | Onboarding = Erwachen (kein Formular, erster Satz wird erster Impuls) | ✅ |
| 11 | Morgenroutine UI | ✅ |
| 12 | Hauptscreen-Layout | ✅ |
| 13 | Abendritual + Commands | ✅ 🟡 |

Details: [`ORIENT_Cursor_v1.md`](./ORIENT_Cursor_v1.md)
