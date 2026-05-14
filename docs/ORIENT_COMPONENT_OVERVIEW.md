# ORIENT — Komponenten-Übersicht

Diese Übersicht zeigt, welche Komponenten bereits implementiert sind.

---

## ✅ 1. System-Denken (Domain, Graph, Eskalation)

### Domain Objects
- ✅ **Threads** (`src/core/threads/`)
  - `Thread.ts` - Domain Object
  - `ThreadStatus.ts` - Status-Enum (ACTIVE, OBSERVED, DORMANT, CLOSED)
  - `ThreadLifecycle.ts` - Lifecycle-Engine (activate, markDormant, reactivate, close)
  - `ThreadRepository.ts` - Repository-Interface
  - `ThreadEvents.ts` - Event-Typen

- ✅ **Impulses** (`src/core/impulses/`)
  - `Impulse.ts` - Domain Object (Momentaufnahme)
  - `ImpulseState.ts` - State-Enum (DUST, CLOUD)
  - `ImpulseFactory.ts` - Factory für einheitliche Erstellung
  - `ImpulseLinker.ts` - Idempotente Verknüpfungen (Thread/Entity, Pin/Unpin)
  - `ImpulseRepository.ts` - Repository-Interface
  - `ImpulseClassifier.ts` - Optionaler Stub (Interface)

- ✅ **Entities** (`src/core/entities/`)
  - `Entity.ts` - Domain Object
  - `EntityType.ts` - Type-Enum (PERSON, ORG, COMPANY, PROJECT, PLACE, ASSET, NARRATIVE, TOPIC)
  - `EntityFactory.ts` - Factory für einheitliche Erstellung

### Graph-Engine
- ✅ **Graph** (`src/core/graph/`)
  - `NodeRef.ts` - Generische Referenz für Knoten (Thread, Impulse, Entity, Claim, Source)
  - `RelationType.ts` - Relation-Typen (RELATED_TO, SUPPORTS, CONTRADICTS, INFLUENCES, REACTIVATES, OCCURS_WITH)
  - `EdgeWeights.ts` - Gewichtungen (confidence, recency, frequency, userRelevance, sourceWeight)
  - `Edge.ts` - Edge Domain Object (immutable, idempotent)
  - `GraphLinker.ts` - Kern-Logik für Edge-Erstellung (deterministisch, idempotent)

### Eskalationslogik
- ✅ **Escalation** (`src/core/escalation/`)
  - `EscalationLevel.ts` - Level-Enum (OBSERVE, NOTE, HINT, FRAME)
  - `ContextMode.ts` - Context-Enum (QUIET, FOCUS, SOCIAL, FAMILY, NORMAL)
  - `Signal.ts` - Signal-Interface (Input für Escalation)
  - `EscalationPolicy.ts` - Policy (contextCap, baseScore, levelFromScore, applyGuards)
  - `EscalationEngine.ts` - Engine (evaluate)

### Storage
- ✅ **Storage** (`src/core/storage/`)
  - `Repository.ts` - Generisches Repository-Interface

- ✅ **Infrastructure** (`src/infrastructure/storage/`)
  - `LocalDatabase.ts` - Abstraktion für lokale Datenbank
  - `ThreadRepository.local.ts` - Lokale Thread-Repository-Implementierung
  - `ImpulseRepository.local.ts` - Lokale Impulse-Repository-Implementierung
  - `EdgeRepository.local.ts` - Lokale Edge-Repository-Implementierung

---

## ✅ 2. Lesen & Schreiben (Query + Command)

### Query Services (Lesen)
- ✅ **Queries** (`src/app/queries/`)
  - `ThreadQueryService.ts` - Erstellt ThreadSnapshot aus Thread + Impulses + Edges
  - `DailyQueryService.ts` - Erstellt DailyView (1-3 relevante Threads)
  - `helpers/TextDigest.ts` - Text-Helper (clampList, oneOrTwoSentences, safeBullet)
  - `helpers/ThreadScoring.ts` - Scoring-Helper (dailyPriorityScore)
  - `types/ThreadSnapshot.ts` - ThreadSnapshot-Interface
  - `types/DailyView.ts` - DailyView-Interface

### Commands (Schreiben)
- ✅ **Commands** (`src/app/commands/`)
  - `CaptureImpulseCommand.ts` - Erfasst neuen Impulse
  - `SetContextModeCommand.ts` - Setzt Context-Mode
  - `PinThreadCommand.ts` - Pinnt Thread (Stub, Meta-Feld fehlt noch)
  - `ArchiveThreadCommand.ts` - Archiviert Thread (DORMANT)
  - `ExportThreadCommand.ts` - Exportiert Thread als Markdown
  - `types/CommandContext.ts` - Command-Context-Interface
  - `types/CommandResult.ts` - Command-Result-Interface

---

## ✅ 3. LLM-Steckdose (optional, kontrolliert)

### Core
- ✅ **LLM Core** (`src/core/llm/`)
  - `LLMPolicy.ts` - Policy (OFF by default, Redaction, keine Autonomie)
  - `LLMTypes.ts` - Task-Typen (THREAD_SUMMARY, EXPORT_MARKDOWN_POLISH, etc.)
  - `LLMClient.ts` - Interface für LLM-Clients

### Infrastructure
- ✅ **LLM Infrastructure** (`src/infrastructure/llm/`)
  - `LLMClientMock.ts` - Deterministischer Mock für Tests
  - `LLMClientOpenAI.ts` - Stub für spätere OpenAI-Integration

### Application
- ✅ **LLM Application** (`src/app/llm/`)
  - `LLMOrchestrator.ts` - Orchestrator mit DNA-Logik (OFF by default, Redaction, Labeling)

### DNA-Konformität
- ✅ OFF by default: `DEFAULT_LLM_POLICY.mode = LLMMode.OFF`
- ✅ Keine Autonomie: `allowAutoActions: false` (immer)
- ✅ Privacy: `redactBeforeSend: true` (default)
- ✅ Keine persönlichen Daten: `allowSendPersonalData: false` (default)
- ✅ Transparenz: `labelOutputsAsSuggestion: true` (default)

---

## ✅ 4. Visual-Übersetzung (nicht gerendert, aber logisch)

### Visual Kernel
- ✅ **Visual Kernel** (`src/visual/kernel/`)
  - `VisualNode.ts` - Visual Node-Interface (THREAD, IMPULSE, ENTITY, DUST)
  - `VisualEdge.ts` - Visual Edge-Interface
  - `VisualCluster.ts` - Visual Cluster-Interface
  - `VisualState.ts` - Visual State-Interface (nodes, edges, clusters, focus, ambience)
  - `VisualMappingPolicy.ts` - Mapping-Regeln (colorForThread, sizeForRelevance, stabilityForConfidence, ambienceFromContext)
  - `VisualKernel.ts` - Übersetzungsmaschine (fromThreadSnapshots, coldStart)

### DNA-Konformität
- ✅ Jeder visuelle Effekt ist ableitbar aus Daten
- ✅ Kein "intelligent aussehendes Wabern ohne Grund"
- ✅ Transparenz statt Blackbox
- ✅ Farben sind semantisch, nicht dekorativ

---

## 📊 Zusammenfassung

| Kategorie | Status | Komponenten |
|----------|--------|-------------|
| **System-Denken** | ✅ Vollständig | Domain (Threads, Impulses, Entities), Graph, Eskalation, Storage |
| **Lesen & Schreiben** | ✅ Vollständig | Query Services (ThreadQuery, DailyQuery), Commands (Capture, SetContext, Pin, Archive, Export) |
| **LLM-Steckdose** | ✅ Vollständig | Policy, Types, Client-Interface, Mock, Orchestrator |
| **Visual-Übersetzung** | ✅ Vollständig | VisualKernel, VisualMappingPolicy, VisualState, VisualNode, VisualEdge, VisualCluster |

---

## 🎯 Nächste Schritte (optional)

1. **Storage-Implementierung**: Konkrete IndexedDB/SQLite-Implementierung
2. **Context-Manager**: Context-Snapshot-Verwaltung (ContextSnapshot-Objekt fehlt noch)
3. **Export-Templates**: Template-System für verschiedene Export-Formate
4. **Input-Processor**: Text/Voice-Input-Handler
5. **Visual-Rendering**: Canvas/WebGL-Rendering (Phase 1: light, Phase 2: Three.js/R3F)

---

**Stand**: Alle vier Kern-Komponenten sind implementiert und DNA-konform.
