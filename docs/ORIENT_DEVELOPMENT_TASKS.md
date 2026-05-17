# ORIENT — Development Tasks (Phase 1)

Diese Tasks leiten sich direkt aus ORIENT_TODO_PHASE1.md ab und sind in umsetzbare Schritte zerlegt.

**Ziel**: Ein funktionierender, ruhiger ORIENT-Core ohne Feature-Explosion.

**Stand:** 2026-05-17

| Task | Kurz | Status |
|------|------|--------|
| A1 | Datenmodell + SQLite | ✅ |
| A2 | Verschlüsselung | ✅ |
| A3 | Thread-Lifecycle | ✅ |
| A4 | Graph-Engine | ✅ |
| B5 | Text + Voice Input | ✅ |
| B6 | Kontext-Snapshots | 🟡 |
| B7 | Eskalation 0–3 | ✅ |
| C8 | Visual / Präsenz | 🟡 (R3F-Bubble ✅, Haupt-Visual Debug) |
| C9 | HUD | 🟡 |
| D10 | Export | ✅ |
| D11 | Nutzer-Kommandos | 🟡 |

---

## PRIORITÄT A — Core & Fundament

### Task A1: Datenmodell & Datenbank-Setup

**Ziel**: Lokales Datenmodell implementieren (Impulse, Threads, Entities, Edges)

**Subtasks**:
1. SQLite-Datenbank initialisieren (sql.js für Browser oder better-sqlite3)
2. Schema aus ORIENT_DATABASE_SCHEMA.md implementieren
3. Migration-System erstellen (Version 1.0)
4. Repository-Pattern implementieren (TypeScript):
   - `ImpulseRepository`
   - `ThreadRepository`
   - `EntityRepository`
   - `EdgeRepository`
5. Basis-CRUD-Operationen für alle Repositories
6. Unit-Tests für Repositories (Vitest)

**Akzeptanzkriterien**:
- Alle Tabellen existieren
- CRUD-Operationen funktionieren
- Keine automatische Löschung
- Tests bestehen

**Geschätzte Zeit**: 3-5 Tage

---

### Task A2: Verschlüsselung-Service

**Ziel**: Lokale Verschlüsselung für sensible Felder

**Subtasks**:
1. Encryption-Service erstellen (Web Crypto API)
2. Key-Management (Browser KeyStore / IndexedDB)
3. Feldweise Verschlüsselung implementieren:
   - `impulses.content_text`
   - `impulses.content_payload`
   - `context_snapshots.fields`
4. Optional: Passphrase-Recovery
5. Unit-Tests für Verschlüsselung (Vitest)

**Akzeptanzkriterien**:
- Sensible Felder verschlüsselt "at rest"
- Key-Management funktioniert
- Keine Cloud-Abhängigkeit
- Tests bestehen

**Geschätzte Zeit**: 2-3 Tage

---

### Task A3: Thread-Lifecycle-Engine

**Ziel**: Thread-Status-Logik (ACTIVE / OBSERVED / DORMANT / CLOSED)

**Subtasks**:
1. Thread-Lifecycle-Engine erstellen
2. Status-Übergänge implementieren:
   - ACTIVE → OBSERVED (bei Inaktivität)
   - OBSERVED → DORMANT (nach Zeit)
   - DORMANT → ACTIVE (nur explizit)
   - ACTIVE/OBSERVED → CLOSED (nur explizit)
3. Reaktivierung-Logik (DORMANT → ACTIVE)
4. Automatische Übergänge nur bei expliziten Triggern
5. Unit-Tests für Lifecycle

**Akzeptanzkriterien**:
- Alle Status-Übergänge funktionieren
- Keine automatische Löschung
- Reaktivierung nur explizit
- Tests bestehen

**Geschätzte Zeit**: 2-3 Tage

---

### Task A4: Graph-Engine (minimal)

**Ziel**: Knoten + Kanten mit Gewichtung

**Subtasks**:
1. Graph-Engine erstellen
2. Knoten-Verwaltung (Threads, Entities, Impulses)
3. Kanten-Verwaltung (Edges)
4. Gewichtungs-Berechnung:
   - Recency (basierend auf last_seen_at)
   - Confidence (aus Metadaten)
   - User-Relevance (aus Nutzung)
5. Graph-Traversal (einfach, für Verknüpfungen)
6. Unit-Tests für Graph-Engine

**Akzeptanzkriterien**:
- Knoten und Kanten können erstellt/verwaltet werden
- Gewichtungen werden berechnet
- Graph-Traversal funktioniert
- Keine Visualisierung nötig (Phase 1)
- Tests bestehen

**Geschätzte Zeit**: 3-4 Tage

---

## PRIORITÄT B — Interaktion & Beziehung

### Task B1: Input-Layer

**Ziel**: Text-Input und Voice-Input (Push-to-talk + Transkript) als Impulse speichern

**Subtasks**:
1. Input-Processor erstellen (TypeScript)
2. Text-Input-Handler
3. Voice-Input-Handler (Web Speech API, Push-to-talk)
   - Transkript als Impulse speichern
   - Kein TTS in Phase 1
   - Keine NLP (Thread-Erkennung später)
4. Alle Inputs als Impulse speichern (DUST/CLOUD)
5. Impulse mit Thread/Entity-Verknüpfung (später, optional)
6. Integration-Tests für Input-Flow (Vitest)

**Akzeptanzkriterien**:
- Text-Input wird als Impulse gespeichert
- Voice-Input (Transkript) wird als Impulse gespeichert
- Alle Inputs haben Timestamp und Context
- Tests bestehen

**Geschätzte Zeit**: 2-3 Tage

---

### Task B2: Kontext-Snapshot-System

**Ziel**: Manuell setzbare Kontexte (Ruhe, Familie, Fokus)

**Subtasks**:
1. Context-Manager erstellen
2. Context-Snapshot-Erstellung
3. Aktiver Kontext (mode, intensity_cap)
4. Expiration-Handling (expires_at, nicht löschen)
5. Kontext beeinflusst Antwortfrequenz & Tiefe
6. Kein UI-Overkill (einfache API)
7. Unit-Tests für Context-Manager

**Akzeptanzkriterien**:
- Kontexte können gesetzt werden
- Aktiver Kontext wird berücksichtigt
- Expiration funktioniert (wirksam bis, nicht löschen)
- Keine UI-Komplexität
- Tests bestehen

**Geschätzte Zeit**: 2 Tage

---

### Task B3: Eskalationslogik (0-3)

**Ziel**: Interne Eskalationsstufen (Beobachten, Vermerken, Hinweis, Einordnung)

**Subtasks**:
1. Eskalations-Engine erstellen
2. Stufe 0: Beobachten (keine Ausgabe)
3. Stufe 1: Vermerken
4. Stufe 2: Hinweis (optional)
5. Stufe 3: Einordnung (Konsequenzen)
6. Stufe 4 technisch gesperrt
7. Nicht-linear (kann zurückfallen)
8. Entscheidungslogik basierend auf Vertrauen, nicht Hype
9. Unit-Tests für Eskalation

**Akzeptanzkriterien**:
- Alle Stufen 0-3 funktionieren
- Stufe 4 ist technisch gesperrt
- Nicht-linear (kann zurückfallen)
- Entscheidungen basieren auf Vertrauen
- Tests bestehen

**Geschätzte Zeit**: 3-4 Tage

---

## PRIORITÄT C — Wahrnehmung & Feedback

### Task C1: Minimaler Visual-Denkraum

**Ziel**: Reaktion auf Aktivität, sichtbarer Fokuswechsel (Canvas/WebGL-light)

**Subtasks**:
1. Visual-Engine erstellen (TypeScript, Canvas/WebGL-light)
   - Kein Three.js in Phase 1 (Phase 2)
2. Mapping von Datenmodell zu visuellen Zuständen:
   - Staub → Impulse (niedrige confidence) → Canvas-Partikel
   - Adern → Thread + Edges → Canvas-Linien
   - Knoten → Entities/Threads (hohe confidence) → Canvas-Kreise
   - Leuchten → aktive Threads/Entities → WebGL-Effekte
3. Reaktion auf Aktivität (kein finales 3D)
4. Fokuswechsel sichtbar machen
5. Keine Aktivität ohne zugrunde liegende Objekte
6. Integration-Tests für Visual-Mapping (optional, da subjektiv)

**Akzeptanzkriterien**:
- Visual reagiert auf Datenmodell
- Fokuswechsel ist sichtbar
- Keine "fake" Aktivität
- Kein finales 3D (Phase 1)
- Tests bestehen

**Geschätzte Zeit**: 4-5 Tage

---

### Task C2: Themen-Fokus & HUD (rudimentär)

**Ziel**: Status eines Threads anzeigen, Unsicherheit sichtbar machen

**Subtasks**:
1. HUD-System erstellen
2. HUD bei Fokus auf Thread
3. Anzeige: Status, Entwicklung, Unsicherheiten
4. HUD ist temporär und freiwillig
5. HUD verschwindet von selbst
6. Integration-Tests für HUD

**Akzeptanzkriterien**:
- HUD wird bei Fokus angezeigt
- Status und Unsicherheiten werden gezeigt
- HUD ist temporär (verschwindet)
- Freiwillig (nicht persistent)
- Tests bestehen

**Geschätzte Zeit**: 2-3 Tage

---

## PRIORITÄT D — Produktivität & Nutzen

### Task D1: Snapshot-Export (Markdown/Text)

**Ziel**: Export-Engine für OVERVIEW, WRITING, README

**Subtasks**:
1. Export-Engine erstellen
2. Template-System für verschiedene Modi:
   - OVERVIEW
   - WRITING
   - README (für Cursor)
3. Provenance-Tracking (included_impulses, entities, claims, edges)
4. Markdown/Text-Output
5. Export nur auf expliziten Wunsch
6. Integration-Tests für Export

**Akzeptanzkriterien**:
- Alle drei Modi funktionieren
- Provenance wird getrackt
- Export nur auf Wunsch
- Markdown/Text-Output korrekt
- Tests bestehen

**Geschätzte Zeit**: 3-4 Tage

---

### Task D2: Explizite Nutzer-Kommandos

**Ziel**: Kommandos wie "Fass das zusammen", "Leg das ab", etc.

**Subtasks**:
1. Command-Processor erstellen
2. Kommando-Parsing
3. Kommandos implementieren:
   - "Fass das zusammen" → Export (OVERVIEW)
   - "Leg das ab" → Thread → DORMANT
   - "Ignorier das erstmal" → Thread → OBSERVED
   - "Exportier mir das" → Export-Engine
4. Integration mit Input-Layer
5. Integration-Tests für Kommandos

**Akzeptanzkriterien**:
- Alle Kommandos funktionieren
- Kommandos werden korrekt geparst
- Integration mit Input-Layer funktioniert
- Tests bestehen

**Geschätzte Zeit**: 2-3 Tage

---

## Gesamt-Übersicht

### Priorität A (Core & Fundament)
- A1: Datenmodell & Datenbank-Setup (3-5 Tage)
- A2: Verschlüsselung-Service (2-3 Tage)
- A3: Thread-Lifecycle-Engine (2-3 Tage)
- A4: Graph-Engine (3-4 Tage)
**Gesamt**: 10-15 Tage

### Priorität B (Interaktion & Beziehung)
- B1: Input-Layer (2-3 Tage)
- B2: Kontext-Snapshot-System (2 Tage)
- B3: Eskalationslogik (3-4 Tage)
**Gesamt**: 7-9 Tage

### Priorität C (Wahrnehmung & Feedback)
- C1: Minimaler Visual-Denkraum (4-5 Tage)
- C2: Themen-Fokus & HUD (2-3 Tage)
**Gesamt**: 6-8 Tage

### Priorität D (Produktivität & Nutzen)
- D1: Snapshot-Export (3-4 Tage)
- D2: Explizite Nutzer-Kommandos (2-3 Tage)
**Gesamt**: 5-7 Tage

**Gesamt Phase 1**: 28-39 Tage (ca. 6-8 Wochen bei Vollzeit)

---

## Abhängigkeiten

```
A1 (Datenbank) → A2 (Verschlüsselung)
A1 (Datenbank) → A3 (Thread-Lifecycle)
A1 (Datenbank) → A4 (Graph-Engine)

A3 (Thread-Lifecycle) → B3 (Eskalation)
A4 (Graph-Engine) → C1 (Visual)

B1 (Input) → B2 (Kontext)
B1 (Input) → B3 (Eskalation)
B1 (Input) → D2 (Kommandos)

C1 (Visual) → C2 (HUD)

D1 (Export) → D2 (Kommandos)
```

---

## Nicht Teil von Phase 1

- Kein Feed
- Keine Push-Notifications
- Keine Gamification
- Keine automatische Investment-Picks
- Keine finale 3D-Visualisierung
- Keine Cloud-Pflicht
- Keine NLP (Thread-Erkennung später)
- Keine Multimodal (später)

---

## Definition of Done

Phase 1 ist abgeschlossen, wenn:
- Alle Tasks A-D implementiert sind
- Tests bestehen
- ORIENT ruhig, stabil und vertrauenswürdig denkt
- Keine Feature-Explosion
- DNA-Regeln respektiert werden

---

## Technologie-Entscheidungen Phase 1 (Final)

✅ **Plattform**: PWA (Web), offline-first. Später optional Desktop-Wrap (Tauri).  
✅ **Sprache**: TypeScript end-to-end.  
✅ **Voice-Input**: Ja in Phase 1, aber minimal (Push-to-talk + Transkript als Impulse). Kein TTS in Phase 1.  
🟡 **Visual**: Spec war Canvas-only; Repo hat **OrientBubble (R3F)** im Header + 2D-Debug-Canvas. Volles Zentral-Layout (Schritt 11) noch offen.  
✅ **Testing**: Vitest für Core-Logik + Storage; Playwright optional später.

## Repo-Struktur

Siehe `ORIENT_REPO_STRUCTURE.md` für die vollständige Verzeichnisstruktur.

Diese Tasks sind konkret, umsetzbar und respektieren die ORIENT_DNA strikt als oberste Constraint.
