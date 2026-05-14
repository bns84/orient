# ORIENT — Phase 1 Status & Prioritäten

**Stand:** Nach Delta 07 (Behavior & Presence Specification)

---

## ✅ Was ist bereits implementiert?

### PRIORITÄT A — Core & Fundament

#### 1. Lokales Datenmodell ✅
- ✅ **Domain Objects** vollständig:
  - `Thread` mit Status-Logik (ACTIVE, OBSERVED, DORMANT, CLOSED)
  - `Impulse` (moment-basiert, keine `updatedAt`)
  - `Entity` (verschiedene Types)
  - `Edge` (Graph-Verknüpfungen)
- ✅ **Status-Logik**: Thread-Lifecycle implementiert
- ✅ **Keine automatische Löschung**: DNA-konform

#### 2. Lokale Verschlüsselung ⚠️
- ⚠️ **Noch nicht implementiert** (geplant für später)
- ✅ Local-first Architektur vorbereitet

#### 3. Thread-Lifecycle-Engine ✅
- ✅ `ThreadLifecycle` implementiert:
  - `activate()`
  - `markDormant()`
  - `reactivate()`
  - `close()`
- ✅ Immutability gewährleistet

#### 4. Graph-Engine (minimal) ✅
- ✅ **Core Graph** (`src/core/graph/`):
  - `NodeRef`, `RelationType`, `EdgeWeights`
  - `Edge` mit deterministischen IDs
  - `GraphLinker` (idempotent)
- ✅ **DB Graph** (`src/db/graph.ts`):
  - `nodes` und `relations` Tabellen
  - `ensureNode()`, `ensureRelation()`
  - `linkVoiceToPanel()` (Bridge)
  - `getNeighbors()` (Debug)
- ✅ **Graph Inspector** (Debug-UI)

---

### PRIORITÄT B — Interaktion & Beziehung

#### 5. Input-Layer ⚠️ Teilweise
- ✅ **Voice-Input**:
  - `useVoiceRecorder` Hook
  - `VoiceHoldButton` Component
  - Voice-Recordings in IndexedDB
  - Transcription Stub (Phase 2)
- ⚠️ **Text-Input**: Noch nicht implementiert
- ✅ **Impulse-Speicherung**: Voice wird als Impulse gespeichert

#### 6. Kontext-Snapshot-System ⚠️ Teilweise
- ✅ **Context-Modes**: `ContextMode` Enum (QUIET, FOCUS, SOCIAL, FAMILY, NORMAL)
- ✅ **UserContext**: `UserContext` + `UserContextRepository`
- ✅ **ContextService**: `getCurrent()`, `setMode()`
- ⚠️ **UI für Context-Setting**: Noch nicht implementiert
- ✅ **Context Snapshot Persistenz**: KV-Store

#### 7. Eskalationslogik (0–3) ✅
- ✅ **Escalation Engine** vollständig:
  - `EscalationLevel` (0-3, Level 4 gesperrt)
  - `EscalationPolicy` (DNA-konform)
  - `EscalationEngine.evaluate()`
  - Context-Aware (ContextMode beeinflusst Output)
- ✅ **Signal-Modell**: `Signal` Interface

---

### PRIORITÄT C — Wahrnehmung & Feedback

#### 8. Minimaler Visual-Denkraum ⚠️ Teilweise
- ✅ **Visual-Kernel** (`src/visual/kernel/`):
  - `VisualNode`, `VisualEdge`, `VisualCluster`
  - `VisualState` (komplettes Modell)
  - `VisualMappingPolicy` (deterministisch)
  - `VisualKernel` (ThreadSnapshots → VisualState)
- ✅ **Visual-Pipeline**:
  - `VisualStatePipeline` (DailyView → VisualState)
  - Cluster-Builder
  - Focus-Model
- ✅ **Visual-Debug-Canvas**: Canvas 2D für Debug
- ⚠️ **Echte Visualisierung**: Noch rudimentär (Debug-only)

#### 9. Themen-Fokus & HUD ⚠️ Teilweise
- ✅ **Focusable Component**: Tap-to-focus, Double-tap lock
- ✅ **ThreadSnapshot**: Strukturierte Thread-Ansicht
- ✅ **DailyView**: Tägliche Übersicht (1-3 Threads)
- ⚠️ **HUD-UI**: Noch nicht vollständig implementiert

---

### PRIORITÄT D — Produktivität & Nutzen

#### 10. Snapshot-Export (Markdown/Text) ✅
- ✅ **Export-Services**:
  - `MarkdownExportService` (Thread → Markdown)
  - `CursorPackExportService` (DailyView → Cursor Pack)
  - `ExportOrchestrator` (zentrale Orchestrierung)
- ✅ **Export-Command**: `ExportThreadCommand`

#### 11. Explizite Nutzer-Kommandos ✅
- ✅ **Commands** implementiert:
  - `CaptureImpulseCommand`
  - `SetContextModeCommand`
  - `PinThreadCommand` (Stub)
  - `ArchiveThreadCommand`
  - `ExportThreadCommand`
- ⚠️ **UI für Commands**: Noch nicht vollständig

---

### Zusätzliche Features (Delta 01-06)

#### Delta 01-03: UI Foundation ✅
- ✅ **IndexedDB Setup**: Dexie mit `kv`, `events`, `voice` Tabellen
- ✅ **Event-Logging**: `logEvent()` für Transparenz
- ✅ **Voice-Recording**: Vollständig mit Retention-Policy
- ✅ **Focusable Panels**: Tap-to-focus, Double-tap lock
- ✅ **DB Export/Import**: Debug-Tool

#### Delta 04: Overview Panel ✅
- ✅ **Overview Selector**: Counts + Timestamps
- ✅ **OverviewPanel UI**: Status-Übersicht
- ✅ **Quick Actions**: Export, Clear events, Clear focus

#### Delta 05: Voice → Context Attachment ✅
- ✅ **Attachments Table**: Voice an Panels anhängen
- ✅ **Attachment API**: `attachVoiceToTarget()`, `getVoiceAttachmentsForTarget()`
- ✅ **UI**: Attach-Button + Attachment-Liste mit Playback

#### Delta 06: Context Graph ✅
- ✅ **Graph Tables**: `nodes`, `relations`
- ✅ **Graph API**: `ensureNode()`, `ensureRelation()`, `getNeighbors()`
- ✅ **Bridge**: Attachments → Graph Relations automatisch
- ✅ **Graph Inspector**: Debug-Panel für Graph-Exploration

#### Hook-Fixes ✅
- ✅ **Dexie-Hooks korrigiert**: `setTimeout` für TransactionInactiveError-Fix
- ✅ Alle drei Komponenten (VoiceList, EventList, VoiceAttachments) gefixt

---

## ⚠️ Was fehlt noch?

### Kritisch (für Phase 1)

1. **Text-Input** ⚠️
   - Text-Eingabe als Impulse
   - UI-Komponente für Text-Input
   - Integration mit `CaptureImpulseCommand`

2. **Integration Core → UI** ⚠️
   - `ThreadQueryService` + `DailyQueryService` in UI einbinden
   - Echte Thread-Snapshots statt Demo-Data
   - Visual-State aus echten Daten generieren

3. **Context-UI** ⚠️
   - UI zum Setzen des Context-Modes
   - Context-Mode im OverviewPanel anzeigen
   - Context-Mode beeinflusst Visual-State

4. **Thread-Management-UI** ⚠️
   - Thread-Liste anzeigen
   - Thread erstellen/aktivieren
   - Thread-Status ändern (Archive, etc.)

5. **Tests** ⚠️
   - Unit-Tests für Core-Logik
   - Integration-Tests für Storage
   - Tests für Eskalationslogik

### Wichtig (für Phase 1)

6. **Lokale Verschlüsselung** ⚠️
   - Web Crypto API Integration
   - Key-Management
   - Verschlüsselung für sensible Felder

7. **Visualisierung verbessern** ⚠️
   - Echte Visual-State aus Daten
   - Canvas/WebGL-light Rendering
   - Fokus/Zoom funktional machen

8. **HUD vollständig** ⚠️
   - Thread-HUD anzeigen
   - Unsicherheiten visualisieren
   - Status-Anzeige

### Optional (für Phase 1)

9. **Voice-Transcription** ⚠️
   - Echte Transcription (Web Speech API oder extern)
   - Transcription als Impulse-Content

10. **Performance-Optimierung** ⚠️
    - Lazy Loading für große Datenmengen
    - Debouncing für häufige Updates

---

## 🎯 Prioritätenliste (Nächste Schritte)

### PRIORITÄT 1 — Integration & Funktionalität (Sofort)

1. **Text-Input implementieren** 🔴
   - Text-Input-Komponente
   - Integration mit `CaptureImpulseCommand`
   - Impulse aus Text erstellen
   - **Geschätzt:** 2-3 Stunden

2. **Core → UI Integration** 🔴
   - `DailyQueryService` in `App.tsx` einbinden
   - Echte Thread-Snapshots statt Demo-Data
   - Visual-State aus echten Daten
   - **Geschätzt:** 3-4 Stunden

3. **Thread-Management-UI** 🔴
   - Thread-Liste anzeigen
   - Thread erstellen (aus Impulse oder manuell)
   - Thread-Status ändern (Archive, etc.)
   - **Geschätzt:** 4-5 Stunden

### PRIORITÄT 2 — Context & UX (Diese Woche)

4. **Context-UI** 🟡
   - Context-Mode-Setter (Dropdown/Buttons)
   - Context-Mode im OverviewPanel anzeigen
   - Context-Mode beeinflusst Visual-State
   - **Geschätzt:** 2-3 Stunden

5. **Visualisierung verbessern** 🟡
   - Echte Visual-State aus Daten generieren
   - Canvas-Rendering verbessern
   - Fokus/Zoom funktional machen
   - **Geschätzt:** 4-6 Stunden

6. **HUD vollständig** 🟡
   - Thread-HUD anzeigen bei Fokus
   - Unsicherheiten visualisieren
   - Status-Anzeige
   - **Geschätzt:** 3-4 Stunden

### PRIORITÄT 3 — Stabilität & Qualität (Nächste Woche)

7. **Tests schreiben** 🟢
   - Unit-Tests für Core-Logik (ThreadLifecycle, GraphLinker, Escalation)
   - Integration-Tests für Storage
   - Tests für Eskalationslogik
   - **Geschätzt:** 6-8 Stunden

8. **Lokale Verschlüsselung** 🟢
   - Web Crypto API Integration
   - Key-Management
   - Verschlüsselung für sensible Felder
   - **Geschätzt:** 4-6 Stunden

### PRIORITÄT 4 — Nice-to-Have (Später)

9. **Voice-Transcription** 🔵
   - Echte Transcription (Web Speech API oder extern)
   - Transcription als Impulse-Content
   - **Geschätzt:** 4-6 Stunden

10. **Performance-Optimierung** 🔵
    - Lazy Loading
    - Debouncing
    - **Geschätzt:** 2-3 Stunden

---

## 📊 Fortschritt Phase 1

**Geschätzt:** ~60-70% von Phase 1 abgeschlossen

### Abgeschlossen:
- ✅ Core Domain Objects (100%)
- ✅ Graph-Engine (100%)
- ✅ Thread-Lifecycle (100%)
- ✅ Eskalationslogik (100%)
- ✅ Export-Services (100%)
- ✅ Commands (100%)
- ✅ Voice-Input (80%)
- ✅ Visual-Kernel (70%)
- ✅ DB-Layer (100%)
- ✅ Debug-UI (100%)

### In Arbeit:
- ⚠️ Text-Input (0%)
- ⚠️ Core → UI Integration (30%)
- ⚠️ Thread-Management-UI (0%)
- ⚠️ Context-UI (50%)
- ⚠️ Visualisierung (50%)
- ⚠️ HUD (50%)

### Noch nicht begonnen:
- ⚠️ Tests (0%)
- ⚠️ Lokale Verschlüsselung (0%)
- ⚠️ Voice-Transcription (10% - Stub vorhanden)

---

## 🎯 Nächste konkrete Schritte

**WICHTIG:** Nach Delta 07 (Behavior & Presence Specification) ändert sich die Priorität:

### Neue Entwicklungsreihenfolge (bindend):

1. **Behavior Layer** (Zustände & Regeln) - **Delta 08**
2. **Interaction Mapping** (Swipe, Hold, Scroll)
3. **Visuelle Präsenz** (Kugel)
4. **Inhalte**
5. **Feinschliff**

**❗ UI kommt nach Verhalten, nicht davor.**

### Delta 08: ORIENT Behavior Engine (Minimal)

- Kein UI. Kein Design.
- Zustandsvariablen (`activityLevel`, `focusLevel`, `tempo`, `timeOfDay`, `sessionMood`)
- Gewichtungslogik
- einfache Regeln
- Simulation per Logs

**Siehe:** `docs/ORIENT_DELTA07_BEHAVIOR_PRESENCE.md` für vollständige Spezifikation.

**Geschätzte Zeit bis Phase 1 komplett:** 20–30 Stunden (nach Behavior Engine)
