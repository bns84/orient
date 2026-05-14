# ORIENT — Behavior Engine

**Delta 08: Behavior Engine (Minimal)**

## Übersicht

Die Behavior Engine ist eine interne Schicht, die aus Zeit + Interaktion + Sprachmerkmalen einen weichen Zustand ableitet und daraus Präsentations-Entscheidungen trifft.

**Kein Feed, kein Chat, keine neuen UI-Module.**

## Architektur

### Dateien

- `types.ts` - Type-Definitionen (BehaviorState, BehaviorInputs, PresentationHints)
- `sensors.ts` - Rolling-window Aggregation aus Events (60s Window)
- `policies.ts` - Weiche Heuristiken (keine KI)
- `engine.ts` - State-Holding + Snapshot
- `simulate.ts` - Debug-Simulation (Tick alle 1s)

### Hook-In

Die Behavior Engine wird automatisch durch `logEvent()` gefüttert:

```typescript
import { ingestBehaviorEvent } from '../behavior/sensors';

export async function logEvent(type: string, payload?: unknown) {
  ingestBehaviorEvent(type, payload); // <- sync, in-memory
  await orientDb.events.add({ type, payload, createdAt: Date.now() });
}
```

## Zustandsvariablen

### BehaviorState

- `activityLevel` (0..1) - Wie aktiv ist der Nutzer?
- `focusLevel` (0..1) - Stabilität der Aufmerksamkeit
- `tempo` (0..1) - Interaktions-Tempo
- `fatigue` (0..1) - Erschöpfung
- `curiosity` (0..1) - Neugier / Exploration
- `scatteredness` (0..1) - Häufiges Wechseln / Abbrechen
- `timeOfDay` - "morning" | "day" | "evening" | "night"
- `sessionMood` - "neutral" | "curious" | "focused" | "scattered" | "tired"

### PresentationHints

- `preferAudio` (0..1) - Bevorzugung von Audio
- `preferVisualCards` (0..1) - Bevorzugung von visuellen Karten
- `topicCount` (2..6) - Anzahl der Themen
- `density` - "low" | "medium" | "high"
- `nudgeLevel` - 0 | 1 | 2 (kein Nudge, sanft, sanft+strukturiert)
- `tone` - "warm" | "neutral" | "crisp"

## Regeln (Beispiele)

### Scatteredness ↑
- Viele Fokus-Wechsel → `scatteredness` steigt
- Viele Abbrüche → `scatteredness` steigt
- → `topicCount` sinkt, `nudgeLevel` steigt

### Focus ↑
- Langes Scrollen → `focusLevel` steigt
- Wenige Wechsel → `focusLevel` steigt
- → `density` wird "high", `tone` wird "crisp"

### Fatigue ↑
- Später Tag (Abend/Nacht) → `fatigue` steigt
- Niedrige Aktivität → `fatigue` steigt
- → `preferAudio` steigt, `topicCount` sinkt, `tone` wird "warm"

## Simulation

```typescript
import { startBehaviorSimulation } from './behavior/simulate';

// Start simulation (tick alle 1s)
const cleanup = startBehaviorSimulation(1000);
// cleanup() zum Stoppen
```

## Debug-Panel

Optional: `BehaviorSnapshot` Component zeigt aktuellen State (nur für Debug).

## Acceptance Criteria

Delta 08 gilt als erledigt, wenn:

- ✅ `logEvent()` füttert die Behavior Engine
- ✅ `behaviorTick()` läuft (per Simulation)
- ✅ Hints ändern sich sichtbar bei:
  - Schnellen Fokuswechseln → `scatteredness` ↑, `topicCount` ↓, `nudge` ↑
  - Länger scrollen → `focus` ↑, `density` ↑
  - Abends/nachts → `fatigue` ↑, `preferAudio` ↑
