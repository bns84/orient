# ORIENT — Projekt-TODO (Root)

**Stand:** 2026-05-17 · Commit `8685ec3` · Branch `cursor/phase1-sqlite-onboarding-pwa`  
**App:** Orient World Intelligence System (Phase 1, local-first PWA)

> Kanonische Listen: [`docs/ORIENT_TODO_PHASE1.md`](docs/ORIENT_TODO_PHASE1.md) · [`docs/ORIENT_STATUS_PHASE1.md`](docs/ORIENT_STATUS_PHASE1.md) · [`docs/ORIENT_Cursor_v1.md`](docs/ORIENT_Cursor_v1.md)

---

## NEXT (als Nächstes)

- [ ] **Auto-Topic / Themen-Einordnung** — mit echten Daten testen, Heuristik nachschärfen
- [ ] **Kontext ↔ Visual** — Eskalation/Präsenz und Bubble/2D-Visual feiner abstimmen
- [ ] **`useThreadsStore` / `useImpulsesStore`** (optional, Cursor Schritt 5)

---

## IN ARBEIT / TEILWEISE

- [~] **Auto-Topic-Engine** — Clustering, periodischer Vollabgleich (6 h); Qualität am Datenbestand prüfen
- [~] **KI-Stub** — `VITE_AI_ENABLED` + API angebunden; optional nutzbar, kein Pflicht-Feature
- [~] **Nutzer-Kommandos** — Basis (Voice/Text); ggf. mehr Formulierungen / Randfälle
- [~] **Bubble** — daten gekoppelt; weiteres Feintuning bewusst pausiert

---

## DONE (Phase 1 Meilensteine)

- [x] PWA (Vite, Service Worker, Manifest)
- [x] SQLite `sql.js` + Domain-Repositories + IDB-Persistenz
- [x] Verschlüsselung Impulse (AES-GCM, Key-Store)
- [x] Thread-Lifecycle + Graph (Core + SQLite Edges)
- [x] Onboarding: nur Companion-Name + Kommunikationsstil (aktiv/passiv)
- [x] **Sammelcontainer** (`CollectionInbox`) — roh, ohne Kategorien
- [x] **Auto-Topic-Engine** — `topic-matching`, Vollabgleich, nachträgliches Umsortieren
- [x] **Hauptscreen** (`HomeScreen`) — Bubble ~60 %, Swipes, Voice unten
- [x] **Morgenroutine** + **Abendritual** (`MorningBriefing`, `EveningRitual`)
- [x] **HUD** — Eskalation / Unsicherheit (`PresenceHud`)
- [x] **Sprach-Kommandos** — „Fass zusammen“, „Leg ab“, „Ignorier“, „Exportier“ (`commands.ts`)
- [x] Navigation: Themen-Detail inline, kein Focusable-Overlay
- [x] Share-System entfernt (v3.0: Teilen per Sprache)
- [x] Zustand `useAppStore` (Präsenz, Profil, Mood)
- [x] **OrientBubble** (R3F, 8 Regionen, Wissens-Snapshot, Kontext-Modifikatoren)
- [x] Text- + Voice-Input → Impulse (`CaptureImpulseCommand`)
- [x] Web Speech API (`services/voice.ts`)
- [x] `thought-processor.ts` — strengeres Erfassen, sonst Sammelcontainer + Engine
- [x] Export Markdown / Cursor Pack
- [x] Vitest-Suite (auto-topic, topic-matching, morning/evening-ritual, commands, …)
- [x] `npm run dev:clean` für Vite-Cache

---

## BACKLOG (nach Phase 1)

- [ ] KI-Anreicherung produktiv (über Stub hinaus)
- [ ] Supabase/Sync (Version 2)
- [ ] Playwright E2E
- [ ] TTS / Wake Word
- [ ] Teilen per Sprache (Version 3.0)
- [ ] Volle 3D-Bubble ~460px (Phase 2)

---

## Dev-Kurzbefehle

```powershell
npm run dev          # normal
npm run dev:clean    # Vite --force (Dep-Cache neu)
# Bei 504 Outdated Optimize Dep:
Remove-Item -Recurse -Force node_modules\.vite
npm run dev:clean
# Browser: Ctrl+Shift+R
```
