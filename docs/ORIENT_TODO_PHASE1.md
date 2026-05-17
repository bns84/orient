# ORIENT — TODO Phase 1



**Stand:** 2026-05-17 · Branch `cursor/phase1-sqlite-onboarding-pwa`



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



Details 6: `ContextService` + Mode-Buttons; Feintuning Eskalation ↔ Visual noch offen.



---



## PRIORITÄT C — Wahrnehmung & Feedback



| # | Task | Status |

|---|------|--------|

| 8 | Präsenz / Visual-Denkraum | 🟡 |

| 9 | Themen-Fokus & HUD rudimentär | 🟡 |



Details 8:

- ✅ `OrientBubble` (R3F, Bloom, `presence`)

- ✅ Layout-Basis: Präsenz → Sammelcontainer → Themen → Inhalt

- ⬜ Bubble zentral ~60 %, Swipes (Cursor Schritt 12)



Details 9:

- ✅ `CollectionInbox`, `TopicList`, `ThreadDetailPanel` (inline)

- ✅ Auto-Topic + automatische Wichtigkeit (`recordTopicEngagement`)

- ⬜ HUD Eskalation/Unsicherheit im Haupt-UI



---



## PRIORITÄT D — Produktivität & Nutzen



| # | Task | Status |

|---|------|--------|

| 10 | Snapshot-Export (Markdown, Cursor Pack) | ✅ |

| 11 | Explizite Nutzer-Kommandos (zusammenfassen, ablegen, …) | 🟡 |



Details 11: `ArchiveThread`, `ExportThread` im Code; Voice/NL-Kommandos offen.



---



## Zusätzlich umgesetzt (über Basis-TODO)



| Thema | Status |

|-------|--------|

| PWA + Workbox | ✅ |

| Onboarding (Name + Stil, keine Interessen/Themen) | ✅ |

| Sammelcontainer + Auto-Topic-Engine (vollautomatisch) | ✅ |

| `thought-processor.ts` (Match nur; kein Auto-Thread ohne Engine) | ✅ 🟡 |

| Navigation ohne Focusable-Overlay | ✅ |

| Morgenroutine-UI (`MorningBriefing`) | ✅ |

| Share entfernt (v3.0 Sprache) | ✅ |

| `useAppStore` | ✅ |

| `useThreadsStore` / `useImpulsesStore` | ⬜ |

| Vitest (Core, SQLite, Encryption, auto-topic, morning-briefing, …) | ✅ |

| KI-Stub (`VITE_AI_ENABLED`) | ⬜ |



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



1. ⬜ **Schritt 12** — Hauptscreen-Layout (Bubble zentral, Swipes)

2. ⬜ **Schritt 13** — Abendritual

3. 🟡 Auto-Topic-Engine / Matcher verfeinern

4. ⬜ HUD + Sprach-Kommandos

5. ⬜ Optional: `useThreadsStore` / `useImpulsesStore`



Phase 1 „fertig“ wenn: offline stabil, Sammelcontainer, Auto-Themen, Morgen-Briefing, Voice+Text, Context, Export — **ruhig und vertrauenswürdig**.



Siehe [`ORIENT_STATUS_PHASE1.md`](./ORIENT_STATUS_PHASE1.md) · [`ORIENT_Cursor_v1.md`](./ORIENT_Cursor_v1.md)


