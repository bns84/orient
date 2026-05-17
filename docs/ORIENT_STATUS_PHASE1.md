# ORIENT — Phase 1 Status & Prioritäten



**Stand:** 2026-05-17 (für neuen Chat)  

**Branch:** `cursor/phase1-sqlite-onboarding-pwa`  

**Geschätzter Fortschritt:** ~85 %



---



## Kurzüberblick



| Bereich | Status |

|---------|--------|

| SQLite Domain (`sql.js` + Repositories) | ✅ |

| Verschlüsselung Impulse | ✅ |

| PWA + Onboarding (Name + Stil) | ✅ |

| Sammelcontainer + Auto-Topic-Engine | ✅ |

| Präsenz-Bubble (R3F) + `useAppStore` | ✅ |

| Text + Voice → Impulse | ✅ |

| Morgenroutine-UI | ✅ |

| 3-Schichten-UI (final Layout/Swipes) | 🟡 |

| Abendritual UI | ⬜ |

| KI optional | ⬜ Stub |



---



## Handoff — letzte größere Änderungen



1. **Themen-System:** Sammelcontainer statt manueller Themen; `runAutoTopicEngine` legt Themen **vollautomatisch** an und sortiert nachträglich zu (kein Ja/Nein-Dialog).

2. **Onboarding:** nur Companion-Name + Kommunikationsstil; keine Interessen-Inseln.

3. **Share:** aus v1.0 entfernt (v3.0 per Sprache).

4. **Navigation:** Themen-Detail inline unter der Liste; `Focusable`-Overlay aus Haupt-UI.

5. **Morgenroutine:** `MorningBriefing` ab 6:00, einmal pro Tag nach Pause.



**Wichtige Dateien:** `App.tsx`, `auto-topic-engine.ts`, `thought-processor.ts`, `morning-briefing.ts`, `CollectionInbox.tsx`, `OnboardingFlow.tsx`



---



## ✅ Erledigt



### Core & Speicher

- Domain: Thread, Impulse, Entity, Edge, ThreadLifecycle, EscalationEngine

- SQLite primär + Dexie (Voice, Events, KV)

- Verschlüsselung Impulse (AES-GCM)

- Vitest: SQLite, Encryption, thought-processor, auto-topic-engine, morning-briefing



### Interaktion

- Onboarding minimal (`OnboardingFlow`)

- `TextImpulseInput` + `VoiceHoldButton` + `services/voice.ts`

- `CaptureImpulseCommand` → `thought-processor` + `afterImpulseInCollection`

- Kontext: Ruhe / Normal / Fokus



### UI & Themen

- `CollectionInbox` — Sammelcontainer

- `TopicList` + `ThreadDetailPanel` inline

- `runAutoTopicEngine` — Muster, Zuordnung, Umsortieren

- `recordTopicEngagement` — Wichtigkeit aus Nutzung (kein Button)

- `MorningBriefing` + Session-KV

- `OrientBubble` in `PresenceHeader`

- Debug: VisualDebugCanvas, NewTopicQuick, Export, …



### Verarbeitung

- `thought-processor.ts`: Match bestehende Threads; sonst Sammelcontainer

- `generateMorningBriefing()` + UI



---



## 🟡 Teilweise



| Thema | Offen |

|-------|--------|

| Hauptscreen-Layout | Bubble noch im Header; zentrale Bubble ~60 %, Swipes |

| Auto-Topic / Matcher | Heuristik mit echten Daten testen |

| `useThreadsStore` / `useImpulsesStore` | Optional (Cursor Schritt 5) |

| HUD / Eskalation | Engine da, Haupt-UI minimal |

| Kontext ↔ Visual | Feintuning |

| Voice | Kein TTS; Firefox ohne Web Speech |



---



## ⬜ Noch offen (Phase 1)



1. **Hauptscreen** (Cursor Schritt 12) — Layout mobile-first final

2. **Abendritual** (Cursor Schritt 13)

3. **Sprach-Kommandos** — „Fass zusammen“, „Leg ab“

4. **KI-Stub** — `VITE_AI_ENABLED` + API

5. Playwright E2E (optional)



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

| 8 | Auto-Topic-Engine | ✅ |

| 9 | Gedanken-Verarbeitung | ✅ 🟡 |

| 10 | Onboarding minimal | ✅ |

| 11 | Morgenroutine UI | ✅ |

| 12 | Hauptscreen-Layout | 🟡 |

| 13 | Abendritual + Commands | ⬜ |



Details: [`ORIENT_Cursor_v1.md`](./ORIENT_Cursor_v1.md)



---



## Nächste Prioritäten



1. Schritt 12 — Hauptscreen-Layout

2. Schritt 13 — Abendritual

3. HUD + Sprach-Kommandos

4. Auto-Topic verfeinern



**Geschätzte Restzeit Phase 1:** ~8–12 h



---



*Abgestimmt mit [`ORIENT_TODO_PHASE1.md`](./ORIENT_TODO_PHASE1.md) und [`TODO.md`](../TODO.md).*


