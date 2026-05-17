# ORIENT — ToDo (Übersicht)



**Stand:** 2026-05-17 (für neuen Chat)  

Detail-Liste: [`ORIENT_TODO_PHASE1.md`](./ORIENT_TODO_PHASE1.md) · Status: [`ORIENT_STATUS_PHASE1.md`](./ORIENT_STATUS_PHASE1.md)



---



## Version 1.0 — erledigt



| Aufgabe | Status |

|---------|--------|

| Sammelcontainer (`CollectionInbox`) | ✅ |

| Auto-Topic-Engine vollautomatisch (`runAutoTopicEngine`) | ✅ |

| Onboarding: Name + Kommunikationsstil | ✅ |

| Share-System entfernt | ✅ |

| Morgenroutine-UI | ✅ |

| Navigation: Themen inline, kein Overlay | ✅ |

| Text + Voice → Impulse | ✅ |

| SQLite + Verschlüsselung + PWA | ✅ |



---



## Version 1.0 — offen



| Aufgabe | Status |

|---------|--------|

| Hauptscreen-Layout (Bubble zentral, Swipes) | ⬜ |

| Abendritual | ⬜ |

| HUD (Eskalation sichtbar) | ⬜ |

| Sprach-Kommandos / KI-Stub | ⬜ |



---



## Version 3.0 (später)



| Aufgabe | Hinweis |

|---------|---------|

| **Teilen per Sprache** | Was, an wen, welche Form — kein UI-Button in v1.0 |



---



## Architektur-Kurz (für neuen Chat)



- **Impulse** → zuerst **Sammelcontainer** (unverknüpft möglich)

- **Themen (Threads)** nur via `auto-topic-engine.ts` + Match in `thought-processor.ts`

- **Kein** manuelles Thema, kein Share, kein Interessen-Onboarding

- Haupt-UI: `App.tsx` — `PresenceHeader` → `MorningBriefing?` → `CollectionInbox` → `TopicList` → `TextImpulseInput` / `VoiceHoldButton`



---



*Cursor-Plan: [`ORIENT_Cursor_v1.md`](./ORIENT_Cursor_v1.md)*


