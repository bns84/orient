# ORIENT — Phase 1 Status & Prioritäten

**Stand:** 2026-05-17 · Commit `8685ec3`  
**Branch:** `cursor/phase1-sqlite-onboarding-pwa`  
**Geschätzter Fortschritt:** ~92 %

---

## Kurzüberblick

| Bereich | Status |
|---------|--------|
| SQLite Domain (`sql.js` + Repositories) | ✅ |
| Verschlüsselung Impulse | ✅ |
| PWA + Onboarding (Name + Stil) | ✅ |
| Sammelcontainer + Auto-Topic-Engine | ✅ 🟡 |
| Präsenz-Bubble (R3F) + `useAppStore` | ✅ |
| Text + Voice → Impulse | ✅ |
| Morgen- + Abendritual UI | ✅ |
| Hauptscreen (Layout/Swipes) | ✅ |
| HUD (Eskalation/Unsicherheit) | ✅ |
| Sprach-/Text-Kommandos | ✅ 🟡 |
| KI optional (`VITE_AI_ENABLED`) | 🟡 |
| `useThreadsStore` / `useImpulsesStore` | ⬜ |

---

## Handoff — letzte größere Änderungen

1. **Hauptscreen** (`HomeScreen`): Bubble zentral, Swipes (Themen/Sammlung), Voice unten.
2. **Auto-Topic:** `topic-matching.ts` (Clustering, strengeres Erfassen), Vollabgleich alle 6 h.
3. **Rituale:** Morgenbriefing + Abendritual (einmal/Tag, kein Zwang).
4. **HUD + Kommandos:** `PresenceHud`, `commands.ts` (Voice/Text).
5. **Bubble:** Wissen aus Impulsen/Threads (`useBubbleKnowledge`); weiteres Tuning pausiert.

**Wichtige Dateien:** `HomeScreen.tsx`, `auto-topic-engine.ts`, `topic-matching.ts`, `thought-processor.ts`, `commands.ts`, `CollectionInbox.tsx`

---

## ✅ Erledigt

### Core & Speicher

- Domain: Thread, Impulse, Entity, Edge, ThreadLifecycle, EscalationEngine
- SQLite primär + Dexie (Voice, Events, KV)
- Verschlüsselung Impulse (AES-GCM)
- Vitest: SQLite, Encryption, topic-matching, auto-topic, rituals, commands

### Interaktion

- Onboarding minimal (`OnboardingFlow`)
- `TextImpulseInput` + `VoiceHoldButton` + `services/voice.ts`
- `CaptureImpulseCommand` → `thought-processor` + `afterImpulseInCollection`
- Kontext: Ruhe / Normal / Fokus (`ContextService`, Mode-Buttons)

### UI & Themen

- `CollectionInbox` — Sammelcontainer
- `TopicList` + `ThreadDetailPanel` inline
- `runAutoTopicEngine` + `topic-reconcile-schedule` (periodisch)
- `recordTopicEngagement` — Wichtigkeit aus Nutzung
- `MorningBriefing` + `EveningRitual`
- `HomeScreen` — zentrale Bubble, Swipes
- `PresenceHud` — Eskalation/Unsicherheit
- `OrientBubble` — daten- & präsenzgesteuert
- Debug: VisualDebugCanvas, NewTopicQuick, Export, …

### Verarbeitung

- `thought-processor.ts` — klares Match beim Erfassen, sonst Sammelcontainer
- `commands.ts` — Zusammenfassen, Ablegen, Ignorieren, Exportieren
- `services/ai/` — optionaler KI-Stub

---

## 🟡 Teilweise

| Thema | Offen |
|-------|--------|
| Auto-Topic / Matcher | Mit echten Daten validieren, Feintuning |
| `useThreadsStore` / `useImpulsesStore` | Optional (Cursor Schritt 5) |
| Kontext ↔ Visual | `contextBubbleModifiers`; Eskalation ↔ Bubble/2D |
| Nutzer-Kommandos | Mehr Phrasen / Edge Cases |
| KI-Stub | Aktivierung + Qualität in Produktion |
| Bubble | Animation/Thresholds — pausiert |
| Voice | Kein TTS; Firefox ohne Web Speech |

---

## ⬜ Noch offen (Phase 1)

1. **Themen-Einordnung** — Qualität am realen Datenbestand sichern
2. **Kontext ↔ Visual** — Feintuning
3. **Optional:** `useThreadsStore` / `useImpulsesStore`
4. **Optional:** Playwright E2E

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
| 10 | Onboarding minimal | ✅ |
| 11 | Morgenroutine UI | ✅ |
| 12 | Hauptscreen-Layout | ✅ |
| 13 | Abendritual + Commands | ✅ 🟡 |

Details: [`ORIENT_Cursor_v1.md`](./ORIENT_Cursor_v1.md)

---

## Nächste Prioritäten

1. Auto-Topic mit echten Daten testen und nachschärfen
2. Kontext ↔ Visual abstimmen
3. Optional: dedizierte Thread/Impulse-Stores

**Geschätzte Restzeit Phase 1:** ~4–6 h (Feinschliff, kein neues Großfeature)

---

*Abgestimmt mit [`ORIENT_TODO_PHASE1.md`](./ORIENT_TODO_PHASE1.md) und [`TODO.md`](../TODO.md).*
