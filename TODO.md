# ORIENT — Projekt-TODO (Root)

**Stand:** 2026-05-17 (für neuen Chat)  
**App:** Orient World Intelligence System (Phase 1, local-first PWA)

> Kanonische Listen: [`docs/ORIENT_TODO_PHASE1.md`](docs/ORIENT_TODO_PHASE1.md) · [`docs/ORIENT_STATUS_PHASE1.md`](docs/ORIENT_STATUS_PHASE1.md) · [`docs/ORIENT_Cursor_v1.md`](docs/ORIENT_Cursor_v1.md)

---

## NEXT (als Nächstes)

- [ ] **Hauptscreen-Layout** (Cursor Schritt 12): Bubble zentral ~60 %, Swipes, Voice unten
- [ ] **Abendritual** (Cursor Schritt 13): nach 21:00, einmal fragen, kein Zwang
- [ ] **HUD** — Eskalationsstufe / Unsicherheit im Haupt-UI sichtbar
- [ ] **Auto-Topic-Engine** verfeinern (Muster, optional KI-Stub)
- [ ] **`useThreadsStore` / `useImpulsesStore`** (Cursor Schritt 5, optional)
- [ ] **Sprach-Kommandos** — „Fass zusammen“, „Leg ab“ (natürliche Sprache)

---

## IN ARBEIT / TEILWEISE

- [~] 3-Schichten-UI — Sammelcontainer → Themen inline → Kontext/Inhalt; Swipes/zentrale Bubble fehlen
- [~] Thread-Zuordnung — Match + `runAutoTopicEngine`; Heuristik iterieren
- [~] Kontext/Eskalation ↔ Visual

---

## DONE (Phase 1 Meilensteine)

- [x] PWA (Vite, Service Worker, Manifest)
- [x] SQLite `sql.js` + Domain-Repositories + IDB-Persistenz
- [x] Verschlüsselung Impulse (AES-GCM, Key-Store)
- [x] Thread-Lifecycle + Graph (Core + SQLite Edges)
- [x] Onboarding: nur Companion-Name + Kommunikationsstil (aktiv/passiv)
- [x] **Sammelcontainer** (`CollectionInbox`) — roh, ohne Kategorien
- [x] **Auto-Topic-Engine** (`runAutoTopicEngine`) — vollautomatisch, nachträglich umsortieren
- [x] Navigation: Themen-Detail inline, kein Focusable-Overlay
- [x] **Morgenroutine-UI** (`MorningBriefing`, `morning-briefing.ts`)
- [x] Share-System entfernt (v3.0: Teilen per Sprache)
- [x] Zustand `useAppStore` (Präsenz, Profil, Mood)
- [x] **OrientBubble** (R3F, 8 Regionen, presence-States)
- [x] Text- + Voice-Input → Impulse (`CaptureImpulseCommand`)
- [x] Web Speech API (`services/voice.ts`)
- [x] `thought-processor.ts` — Match bestehende Threads, sonst Sammelcontainer
- [x] Export Markdown / Cursor Pack
- [x] Vitest-Suite (inkl. `auto-topic-engine`, `morning-briefing`)
- [x] Voice-Button rund; 2D-Visual nur Debug
- [x] `npm run dev:clean` für Vite-Cache

---

## BACKLOG (nach Phase 1)

- [ ] KI-Anreicherung (`VITE_AI_ENABLED` + API)
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
