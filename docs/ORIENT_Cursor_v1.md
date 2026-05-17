# ORIENT — Cursor Arbeitsplan Version 1.1

> **Kanonisch:** [`ORIENT_KONZEPT.md`](./ORIENT_KONZEPT.md) Kap. 6–7 · Schema: [`ORIENT_DATABASE_SCHEMA.md`](./ORIENT_DATABASE_SCHEMA.md)  
> Phase 1 = **local-first**, SQLite, **kein** Supabase, **keine** Cloud-Pflicht. KI nur als optionaler Stub.

*Konkrete Prompts für Cursor. Reihenfolge einhalten.*

---

## Wie du Cursor benutzt

Öffne Cursor (CMD+L), Prompt kopieren, testen, nächster Schritt.

Bei Fehlern: Fehlermeldung einfügen + *„Bitte beheben, ORIENT_KONZEPT.md und ORIENT_ARCHITECTURE.md einhalten.“*

**Immer mitgeben:**
- Mobile-First, ein Daumen
- Kein sichtbarer Chat, kein Feed, keine Tab-Bar
- Local-first, offline vollständig
- Fehler still loggen (nicht als UI-Fehler)

---

## Schritt 1 — Projekt aufsetzen (PWA)

**Status im Repo:** ✅ Erledigt — Vite + React 19 + TS, `vite-plugin-pwa`, Design-Tokens, `manifest.webmanifest`, Service Worker.

**Cursor Prompt:**
```
Erstelle ein neues React + TypeScript + Vite PWA-Projekt "orient-app".

Dependencies (Phase 1):
- sql.js (SQLite im Browser)
- zustand
- vitest (dev)
- workbox oder vite-plugin-pwa für Offline/Service Worker

KEIN dexie, KEIN @supabase/supabase-js, KEIN axios für Sync in Phase 1.

Ordnerstruktur:
src/
  components/
  pages/
  store/
  services/
  domain/          # lifecycle, graph, escalation
  data/            # db, repositories, migrations
  hooks/
  utils/

TailwindCSS nach ORIENT_DesignSystem.md (dunkel, --bg-primary #010208).

PWA-Manifest + Service Worker: App offline nutzbar.
Optional .env.example mit VITE_AI_ENABLED=false (kein Pflicht-Key).
```

---

## Schritt 2 — SQLite & Repositories

**Status im Repo:** ✅ Erledigt — `sql.js`, `OrientDatabase`, Repositories, IDB-Persistenz, Dexie-Migration, Vitest.

**Cursor Prompt:**
```
Implementiere lokale SQLite mit sql.js gemäß docs/ORIENT_DATABASE_SCHEMA.md.

Erstelle:
- src/data/database.ts — DB init, Migration v1
- Repositories (TypeScript):
  - ImpulseRepository
  - ThreadRepository
  - EntityRepository
  - EdgeRepository
  - ContextSnapshotRepository

Kernregeln:
- impulses = rohe Gedanken (Sprache/Text) — zuerst im **Sammelcontainer**, ohne Pflicht-Kategorie
- threads = Themen **nur automatisch** (Auto-Topic-Engine, `runAutoTopicEngine`), nie manuell im Onboarding
- Dexie-`topics`-Store: Legacy/UI-Hilfen; **keine** manuelle Themenpflege durch den Nutzer
- entities = Personen, Firmen, Projekte, …
- edges = Verknüpfungen mit confidence/recency weights
- KEINE automatische Löschung

Vitest-Tests für CRUD auf allen Repositories.
Persistenz in IndexedDB (sql.js WASM + export/load).
```

---

## Schritt 3 — Verschlüsselung

**Status im Repo:** ✅ Erledigt — `encryption.ts`, Impulse seal/unseal, Key-Store, Migration.

**Cursor Prompt:**
```
Erstelle src/services/encryption.ts mit Web Crypto API.

Verschlüssele at rest:
- impulses.content_text
- impulses.content_payload

Key-Management lokal (IndexedDB / Browser), kein Cloud-Zwang.
Repositories rufen Encryption transparent auf.

Vitest-Tests: roundtrip encrypt/decrypt.
Siehe ORIENT_ARCHITECTURE.md Abschnitt Sicherheit.
```

---

## Schritt 4 — Thread-Lifecycle & Graph (minimal)

**Status im Repo:** ✅ Erledigt — `ThreadLifecycle`, `GraphLinker`, Edges in SQLite; Dexie-Graph legacy.

**Cursor Prompt:**
```
Domain-Layer:

1) src/domain/thread-lifecycle.ts
   - Übergänge: ACTIVE → OBSERVED → DORMANT → CLOSED
   - Reaktivierung nur bei explizitem Nutzer-Trigger
   - Kein Auto-Delete

2) src/domain/graph-engine.ts
   - Knoten: Thread, Entity, Impulse
   - Kanten aus EdgeRepository
   - Gewichtung: recency, confidence, user_relevance

Vitest für Lifecycle-Übergänge und einfache Graph-Traversal.
Orientierung: docs/ORIENT_SYSTEMLOGIC.md
```

---

## Schritt 5 — Zustand (UI-State + Persistenz)

**Status im Repo:** 🟡 Teilweise — `useAppStore` + Persistenz ✅; `useThreadsStore` / `useImpulsesStore` ⬜.

**Cursor Prompt:**
```
Zustand-Stores (src/store/):

useAppStore:
- presence: 'rest' | 'listen' | 'think' | 'emotion' | 'connect' | 'ready'
- companionName: string
- onboardingComplete: boolean
- currentMood: 'aktiv' | 'fokussiert' | 'müde' | 'neugierig' | 'ruhe'
- activeContextId?: string

useThreadsStore:
- threads, activeThreadId
- addThread, setStatus (via ThreadLifecycle)
- loadFromRepository()

useImpulsesStore:
- addImpulse(text, threadIds?)
- loadRecent()

Persistenz: Stores schreiben über Repositories in SQLite — NICHT Dexie.
Reaktive UI via Zustand subscribe + async reload nach Writes.
```

---

## Schritt 6 — Präsenz (Bubble, Phase 1)

**Status im Repo:** ✅ Erledigt — `OrientBubble` (R3F, drei/postprocessing), 8 Regionen, `presence`-States, Header-Integration. *(Spec war Canvas; Repo nutzt WebGL bewusst.)*

**Cursor Prompt:**
```
src/components/Bubble/OrientBubble.tsx — Canvas ~460px, Phase 1 KEIN Three.js.

Zustände von useAppStore.presence (ORIENT_DELTA07 + DesignSystem):
- rest: langsames Atmen, wenige Partikel
- listen: Wellen/EKG-artig
- think: pulsierende Zonen, Bezier-Verbindungen
- emotion: warm orange
- connect: zwei Zentren nähern sich
- ready: goldener Pulse

Phase 1: 2.5D/Canvas mit Perspektive — kein voller WebGL-3D-Engine-Pflicht.
Farben aus ORIENT_DesignSystem.md (--bubble-*).
Langsame Rotation optional; Touch-Drag optional.

Bubble zeigt nur Aktivität wenn echte Verarbeitung läuft.
```

---

## Schritt 7 — Sprachaufnahme → Impulse

**Status im Repo:** ✅ Erledigt — `services/voice.ts`, runder `VoiceHoldButton`, Präsenz-Flow listen→think→ready.

**Cursor Prompt:**
```
src/services/voice.ts:
- Web Speech API (SpeechRecognition), Push-to-talk
- start/stop → Transkript als string

src/components/VoiceButton/:
- Press & Hold, Wellen-Feedback
- Bei Loslassen: ImpulseRepository.create({ content_text: transcript })
- Optional: Thread zuordnen (heuristisch oder Nutzer wählt später)
- KEIN Chat-Verlauf

Flow:
presence 'listen' → Transkript → 'think' → Impulse speichern → 'rest'

Referenz: ORIENT_TODO_PHASE1 Task B5
```

---

## Schritt 8 — Auto-Topic-Engine (Sammelcontainer → Themen)

**Status im Repo:** ✅ Erledigt — `auto-topic-engine.ts`, `CollectionInbox`, `runAutoTopicEngine` (still, ohne Dialog).

**Cursor Prompt:**
```
src/services/auto-topic-engine.ts

Prinzip:
- Alle Impulse landen zuerst im Sammelcontainer (unverknüpft möglich).
- ORIENT erkennt Muster aus Sprache/Text (wiederkehrende Titel/Keywords).
- Keine Nutzer-Rückfrage: bei klarem Muster Thread anlegen + Impulse verknüpfen.
- `runAutoTopicEngine`: nachträglich unverknüpfte Impulse zuordnen, schwache Zuordnungen korrigieren.
- Kein manuelles Anlegen von Themen durch den Nutzer.

UI:
- CollectionInbox (chronologisch, roh)
- Themenliste erscheint, sobald ORIENT Muster erkannt hat
- Kein Share-Button, kein manuelles Thema anlegen (Debug: `NewTopicQuick` optional)

Vitest: `auto-topic-engine.spec.ts` — automatische Themenanlage nach ≥2 ähnlichen Impulsen.
```

---

## Schritt 9 — Gedanken-Verarbeitung (lokal + KI-Stub)

**Status im Repo:** ✅ Erledigt (lokal) — `thought-processor.ts`, Thread-Match, Edge, `generateMorningBriefing()`. 🟡 KI nur Stub. Matching wird iteriert.

**Cursor Prompt:**
```
src/services/thought-processor.ts

Phase 1 — immer lokal:
- Impuls speichern (zuerst Sammelcontainer)
- Thread-Zuordnung nur bei Match zu **bestehendem** Thema (kein Auto-Neuanlegen hier — das macht Schritt 8)
- Optional: Edge zwischen Impulse und Thread

Optional (nur wenn import.meta.env.VITE_AI_ENABLED === 'true'):
- API-Call an Backend/Anthropic
- System Prompt aus docs/ORIENT_SystemPrompt.md
- JSON: { topic, relatedTopics, category, importance }
- Ergebnis in Thread-Tags/Metadaten — nie UI blockieren

Ohne KI: App muss voll funktionsfähig bleiben.

generateMorningBriefing(): nur aus lokalen Impulses/Threads der letzten 24h —
regelbasiert oder KI wenn enabled. Kein Fehler-Toast bei API-Ausfall.
```

---

## Schritt 10 — Onboarding (minimal)

**Status im Repo:** ✅ Erledigt — `OnboardingFlow`: Companion-Name + Kommunikationsstil (aktiv/passiv). **Keine** Interessen-/Themen-Auswahl.

**Cursor Prompt:**
```
src/pages/Onboarding/

Screen 0 — nach 2s Stille:
"Hallo. Ich bin da." + kurze Companion-Erklärung (ORIENT_ErsterSatz.md).

Wege:
[ Einfach loslegen ]  → sofort fertig, ORIENT lernt aus Nutzung
[ Kurz einrichten ]   → Companion-Name → Kommunikationsstil (aktiv/passiv) → fertig

ENTFERNT in v1.0:
- Interessen-Inseln / Themen-Tags
- Manuelle Thread-Anlage im Onboarding
- Erster-Gedanke-Screen als Pflicht

Kommunikationstyp → profile (active/passive) für Behavior.
Themen nur über Auto-Topic-Engine (Schritt 8).

Kein "Willkommen bei ORIENT!" — siehe ORIENT_ErsterSatz.md
```

---

## Schritt 11 — Morgenroutine

**Status im Repo:** ✅ Erledigt — `generateMorningBriefing()`, `morning-briefing.ts`, `MorningBriefing`, `useMorningBriefing`.

**Cursor Prompt:**
```
src/components/MorningBriefing/

Zeigen wenn: erste Öffnung nach 6:00, letzte Session war gestern+.
Inhalt: Begrüßung mit companionName, 3 Punkte aus gestrigen Impulses/Threads
(regelbasiert oder thought-processor).

Voice: "Was steht heute an?" → neuer Impulse.
Schließen: Wisch oder Sprache — kein Zwang.

Ton: ruhig, kurz (ORIENT_Stimme.md). Keine Notification-Badges.
```

---

## Schritt 12 — Hauptscreen + Context + Behavior

**Status im Repo:** 🟡 Teilweise — 3 Panels + Behavior-Simulation ✅; Bubble noch im Header, Swipes/zentrale Bubble ⬜.

**Cursor Prompt:**
```
src/pages/Home/ — einziger Hauptscreen nach Onboarding.

Layout mobile-first:
- Header: Uhrzeit, Mood-Dot (kein Sync-Dot in Phase 1)
- Mitte: OrientBubble ~60%
- Unten: VoiceButton
- Swipe rechts: Thread-Liste (Themen horizontal)
- Swipe unten: letzter Impulse / Thread-Detail

src/services/behavior.ts:
- Session-Dauer, Öffnungszeiten, Impulse/Session
- mood → useAppStore.currentMood → Bubble

src/services/context.ts:
- Snapshots: mode FAMILY | FOCUS | REST, intensity_cap
- Bei REST/FAMILY: Eskalation max Stufe 1, keine proaktiven Einladungen

src/domain/escalation.ts Stufen 0–3, Stufe 4 gesperrt.
Siehe ORIENT_SYSTEMLOGIC.md + ORIENT_KONZEPT.md Kap. 4.6.
```

---

## Schritt 13 — Abendritual + Export-Basis

**Status im Repo:** 🟡 Export ✅ · Abendritual-UI ⬜ · Sprach-Kommandos ⬜.

**Cursor Prompt:**
```
src/components/EveningRitual/
- Trigger: nach 21:00, 30min Inaktivität
- Text: "[companionName], gute Nacht. Gibt es noch etwas?"
- Einmal fragen, 5s ohne Antwort → ausblenden

src/services/commands.ts — explizite Nutzer-Kommandos:
- "Fass das zusammen" → snapshot_exports (Markdown OVERVIEW)
- "Leg das ab" → Thread DORMANT
- "Ignorier das erstmal" → Thread OBSERVED
- "Exportier mir das" → Markdown-Datei/Download

Siehe ORIENT_EXPORT_FORMATS.md und ORIENT_TODO_PHASE1 Task D10/D11.
```

---

## Nach Schritt 13 — Phase 1 fertig

**Checkliste:**

- [x] PWA offline nutzbar
- [x] Onboarding: „Hallo. Ich bin da.“ + Name/Stil (ohne Themen-Auswahl)
- [x] Sammelcontainer + Auto-Topic-Engine (selbstlernend, nachträgliche Zuordnung)
- [x] Bubble reagiert auf presence
- [x] Voice → Impulse in SQLite (verschlüsselt)
- [x] Threads mit Lifecycle (DORMANT bleibt erhalten)
- [~] Context „Ruhe“ (Modus da; Eskalation/Push-Feintuning offen)
- [x] Morgen-Briefing UI (Abend-UI fehlt noch)
- [x] **Kein** Supabase, **kein** Sync-Zwang
- [x] Mit `VITE_AI_ENABLED=false` voll nutzbar

Dann: Version 2.0 (Sync-Modul, volle Bubble, KI-Queue) — siehe ORIENT_Versionsplan.md.

---

## Version 2 — Vorbereitung (noch nicht bauen)

Wenn Phase 1 rund ist, separates Modul:

- `src/services/sync/` — Supabase optional
- `src/services/ai-queue/` — BullMQ/Server, Anthropic
- Gerät spricht nur mit eigener API

Siehe `ORIENT_Architektur.md` und ORIENT_KONZEPT.md Kap. 6.3.

---

## Mapping (alte Begriffe → neu)

| Alt (v1.0 Plan) | Phase 1 kanonisch |
|-----------------|-------------------|
| Dexie / nodes | SQLite / impulses + threads |
| topics Store (Dexie, legacy) | threads nur via Auto-Topic-Engine |
| Share-Button / share.ts | **entfällt v1.0** → Version 3.0 (Sprache) |
| relations | edges |
| Supabase Sync | **entfällt in Phase 1** |
| Pflicht Anthropic | optionaler Stub |
| 3D-Bubble | R3F-Bubble im Header (Phase 1); Canvas nur Debug |

---

*ORIENT — Cursor Arbeitsplan v1.1 · aligned mit ORIENT_KONZEPT.md*
