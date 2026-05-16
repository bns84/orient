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

**Status im Repo:** ✅ Basis vorhanden (Vite + React + TS). Ergänzt: `vite-plugin-pwa`, Design-Tokens, `.env.example`, `jsx` in tsconfig. **Offen:** Dexie → SQLite (Schritt 2).

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
- impulses = rohe Gedanken (Sprache/Text)
- threads = Themen (status: ACTIVE | OBSERVED | DORMANT | CLOSED)
- entities = Personen, Firmen, Projekte, …
- edges = Verknüpfungen mit confidence/recency weights
- KEINE automatische Löschung

Vitest-Tests für CRUD auf allen Repositories.
Persistenz in IndexedDB (sql.js WASM + export/load).
```

---

## Schritt 3 — Verschlüsselung

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

## Schritt 8 — Gedanken-Verarbeitung (lokal + KI-Stub)

**Cursor Prompt:**
```
src/services/thought-processor.ts

Phase 1 — immer lokal:
- Impuls speichern
- Grobe Thread-Zuordnung (Titel-Match oder neuer Thread ACTIVE)
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

## Schritt 9 — Onboarding (4 Wege)

**Cursor Prompt:**
```
src/pages/Onboarding/

Screen 0 — nach 2s Stille, Bubble in rest:
Text exakt: "Hallo. Ich bin da."
Dann kurz Companion-Erklärung (siehe ORIENT_ErsterSatz.md).

Vier Wege:
[ Einfach loslegen ]     → onboardingComplete, kein Formular
[ Kurz einrichten ]      → Name + ≥1 Interessen-Tag → Threads anlegen
[ Jetzt kennenlernen ]   → Name + Geber/Stiller + Voice-Impuls
(später: natürlich sprechen = normaler Impuls ohne Screen)

Interessen-Inseln → threads mit tags (design, tech, familie, …).
Kommunikationstyp → user settings (active/passive) für Behavior.

Speichern: companionName in useAppStore + users.settings in SQLite.
Kein "Willkommen bei ORIENT!" — siehe ORIENT_ErsterSatz.md
```

---

## Schritt 10 — Morgenroutine

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

## Schritt 11 — Hauptscreen + Context + Behavior

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

## Schritt 12 — Abendritual + Export-Basis

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

## Nach Schritt 12 — Phase 1 fertig

**Checkliste:**

- [ ] PWA offline nutzbar
- [ ] Onboarding: „Hallo. Ich bin da.“ + 3 Buttons (+ natürlicher Impuls möglich)
- [ ] Bubble reagiert auf presence
- [ ] Voice → Impulse in SQLite (verschlüsselt)
- [ ] Threads mit Lifecycle (DORMANT bleibt erhalten)
- [ ] Context „Ruhe“ unterdrückt Push
- [ ] Morgen/Abend ohne Zwang
- [ ] **Kein** Supabase, **kein** Sync-Zwang
- [ ] Mit `VITE_AI_ENABLED=false` voll nutzbar

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
| topics Store | threads |
| relations | edges |
| Supabase Sync | **entfällt in Phase 1** |
| Pflicht Anthropic | optionaler Stub |
| 3D-Bubble | Canvas Phase 1 |

---

*ORIENT — Cursor Arbeitsplan v1.1 · aligned mit ORIENT_KONZEPT.md*
