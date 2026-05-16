# ORIENT — Technische Architektur

> **Gesamtkonzept:** [`ORIENT_KONZEPT.md`](./ORIENT_KONZEPT.md) (Kap. 6–7) · Dieses Dokument ist **bindend für Phase 1**.

Dieses Dokument beschreibt die modulare Architektur von ORIENT (local-first).

Alle Architektur-Entscheidungen sind der ORIENT_DNA untergeordnet:
- Ruhe vor Geschwindigkeit
- Local-first (keine Cloud-Pflicht)
- Stille ist ein Feature
- Keine automatische Löschung
- Transparenz statt Blackbox

---

## 1) Architektur-Prinzipien

### 1.1 Local-First
- Alle Daten primär lokal gespeichert
- Offline-Funktionalität vollständig
- Sync optional und später erweiterbar
- Keine Abhängigkeit von externen Services

### 1.2 Modularität
- Klare Trennung von Concerns
- Lose Kopplung zwischen Modulen
- Erweiterbar ohne DNA-Bruch

### 1.3 Ruhe & Stabilität
- Keine Polling-Loops
- Event-basiert statt Push
- Ressourcen-schonend
- Keine Hintergrund-Aktivität ohne Grund

### 1.4 Transparenz
- Keine Blackbox-Komponenten
- Logging für Debugging (aber nicht für Tracking)
- Klare Fehlerbehandlung

---

## 2) Schichten-Architektur

```
┌─────────────────────────────────────────┐
│  Presentation Layer (Visual/Interaction)│
│  - Visual Denkraum                      │
│  - HUD                                  │
│  - Input-Handler                        │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│  Application Layer (Orchestrierung)     │
│  - Thread-Lifecycle-Engine              │
│  - Eskalationslogik                      │
│  - Context-Manager                       │
│  - Export-Engine                        │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│  Domain Layer (Geschäftslogik)          │
│  - Graph-Engine                         │
│  - Thread-Manager                       │
│  - Entity-Manager                       │
│  - Claim-Processor                      │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│  Data Layer (Persistenz)                │
│  - Repository-Pattern                   │
│  - Encryption-Service                   │
│  - SQLite-Datenbank                     │
└─────────────────────────────────────────┘
```

---

## 3) Kern-Module

### 3.1 Data Layer

**Repository-Pattern**
- `ImpulseRepository`
- `ThreadRepository`
- `EntityRepository`
- `EdgeRepository`
- `ContextSnapshotRepository`
- `SourceRepository`
- `ClaimRepository`
- `ExportRepository`

**Encryption-Service**
- Feldweise Verschlüsselung für sensible Daten
- Key-Management (Secure Enclave/Keystore)
- Optional: Passphrase-Recovery

**Database-Service**
- SQLite-Verwaltung
- Migration-Handling
- Connection-Pooling (minimal, da local)

### 3.2 Domain Layer

**Graph-Engine**
- Knoten-Verwaltung (Threads, Entities, Impulses)
- Kanten-Verwaltung (Edges)
- Gewichtungs-Berechnung (recency, confidence, relevance)
- Graph-Traversal (für Verknüpfungen)

**Thread-Lifecycle-Engine**
- Status-Übergänge (ACTIVE → OBSERVED → DORMANT → CLOSED)
- Reaktivierung (DORMANT → ACTIVE)
- Automatische Übergänge nur bei expliziten Triggern

**Context-Manager**
- Context-Snapshot-Verwaltung
- Aktiver Kontext (mode, intensity_cap)
- Expiration-Handling (wirksam bis, nicht löschen)

**Eskalations-Engine**
- Stufen 0-3 (Stufe 4 technisch gesperrt)
- Nicht-linear (kann zurückfallen)
- Entscheidungslogik basierend auf Vertrauen, nicht Hype

### 3.3 Application Layer

**Input-Processor**
- Text-Input
- Voice-Input (Transkript)
- Alle Inputs werden als Impulse gespeichert
- NLP für Thread/Entity-Erkennung (optional, später)

**Export-Engine**
- Verdichtungs-Modi (OVERVIEW, WRITING, BUILD, README, etc.)
- Template-System für verschiedene Formate
- Provenance-Tracking

**Command-Processor**
- Explizite Nutzer-Kommandos
- "Fass das zusammen" → Export
- "Leg das ab" → Thread → DORMANT
- "Ignorier das erstmal" → Thread → OBSERVED
- "Exportier mir das" → Export-Engine

### 3.4 Presentation Layer

**Visual-Engine**
- Mapping von Datenmodell zu visuellen Zuständen
- Staub → Impulse (niedrige confidence)
- Adern → Thread + Edges
- Knoten → Entities/Threads (hohe confidence)
- Leuchten → aktive Threads/Entities

**HUD-System**
- Temporäre Anzeige bei Fokus
- Status, Entwicklung, Unsicherheiten
- Verschwindet von selbst

**Input-Interface**
- Text-Eingabe
- Voice-Eingabe (optional)
- Keine klassischen UI-Elemente

---

## 4) Datenfluss

### 4.1 Input → Impulse → Thread
```
User-Input
  ↓
Input-Processor
  ↓
Impulse (DUST/CLOUD)
  ↓
Thread-Erkennung/Erstellung
  ↓
Graph-Engine (Verknüpfungen)
  ↓
Visual-Engine (Reaktion)
```

### 4.2 Thread-Lifecycle
```
Thread erstellt → ACTIVE
  ↓
Nutzung → OBSERVED
  ↓
Inaktivität → DORMANT (nicht gelöscht!)
  ↓
Explizite Reaktivierung → ACTIVE
  ↓
Explizit abgeschlossen → CLOSED
```

### 4.3 Eskalation
```
Neue Information → Stufe 0 (Beobachten)
  ↓
Relevanz erkannt → Stufe 1 (Vermerken)
  ↓
Wichtigkeit gestiegen → Stufe 2 (Hinweis, optional)
  ↓
Konsequenzen klar → Stufe 3 (Einordnung)
  ↓
Stufe 4 technisch gesperrt
```

---

## 5) Technologie-Stack (Phase 1 - Entscheidungen)

### 5.1 Plattform
- **Primär**: PWA (Progressive Web App), offline-first
- **Später**: Optional Desktop-Wrap mit Tauri
- **Service Worker**: Für Offline-Funktionalität

### 5.2 Sprache & Core
- **Sprache**: TypeScript end-to-end
- **Build-Tool**: Vite (für PWA)
- **Datenbank**: SQLite (via `better-sqlite3` oder `sql.js` für Browser)
- **Verschlüsselung**: Web Crypto API (Browser-native)
- **Graph**: Eigene Implementierung (einfach, transparent)

### 5.3 Frontend (Visual)
- **Framework**: Vanilla TypeScript oder minimal React (kein UI-Framework)
- **Visual-Engine**: Canvas/WebGL-light (Phase 1)
  - Canvas für Staub/Partikel
  - WebGL für Leuchten/Fokus-Effekte
  - Kein Three.js in Phase 1 (Phase 2)
- **Styling**: CSS (minimal, keine UI-Frameworks)

### 5.4 Voice-Input (Phase 1)
- **API**: Web Speech API (SpeechRecognition)
- **Modus**: Push-to-talk
- **Output**: Transkript als Impulse
- **Kein TTS**: Text-to-Speech erst Phase 2

### 5.5 Testing
- **Unit/Integration**: Vitest (für Core-Logik + Storage)
- **E2E**: Playwright (optional, später)

---

## 6) Erweiterbarkeit

### 6.1 Sync-Layer (später)
- Separate Sync-Module
- Keine Änderung am Core
- Optional aktivierbar

### 6.2 Multimodal (später)
- Externe Generator-Anbindung
- Prompt-Generierung aus Gedächtnis
- Medien als Impulse/Attachments

---

## 7) Sicherheit & Privacy

### 7.1 Lokale Verschlüsselung
- Sensible Felder verschlüsselt "at rest"
- Key im Secure Enclave/Keystore
- Keine Cloud-Übertragung ohne explizite Zustimmung

### 7.2 Keine Tracking
- Keine Analytics
- Keine User-Tracking
- Logging nur für Debugging (lokal)

---

## 8) Performance-Überlegungen

### 8.1 Ruhe vor Geschwindigkeit
- Keine Optimierung auf Millisekunden
- Stabilität wichtiger als Speed
- Ressourcen-schonend

### 8.2 Skalierung
- SQLite für lokale Daten (ausreichend für Jahre)
- Graph-Engine optimiert für lokale Größen
- Keine Cloud-Skalierung nötig (local-first)

---

## 9) Testing-Strategie

### 9.1 Unit-Tests
- Domain-Logik (Thread-Lifecycle, Graph)
- Repository-Layer
- Encryption

### 9.2 Integration-Tests
- Datenfluss (Input → Impulse → Thread)
- Export-Engine
- Context-Manager

### 9.3 Keine Tests für
- Visual-Engine (zu subjektiv)
- HUD (temporär, freiwillig)

---

## 10) Deployment

### 10.1 Phase 1: PWA (Offline-First)
- **Service Worker**: Für Offline-Funktionalität
- **Manifest**: PWA-Manifest für Installierbarkeit
- **Storage**: IndexedDB für SQLite (via sql.js) oder LocalStorage
- **Keine Server-Infrastruktur** nötig

### 10.2 Phase 2: Optional Desktop-Wrap
- **Tauri**: Native Desktop-App (später)
- **Keine Core-Änderung**: Gleiche Codebase

### 10.3 Optional: Sync-Server (später)
- Separater Service
- Optional aktivierbar
- Keine Core-Änderung

---

## 11) Entscheidungen Phase 1 (Final)

✅ **Plattform**: PWA (Web), offline-first. Später optional Desktop-Wrap (Tauri).  
✅ **Sprache**: TypeScript end-to-end.  
✅ **Voice-Input**: Ja in Phase 1, aber minimal (Push-to-talk + Transkript als Impulse). Kein TTS in Phase 1.  
✅ **Visual**: Phase 1 ohne echte 3D-Engine (Canvas/WebGL-light für Staub/Leuchten/Fokus). Three.js/R3F erst Phase 2.  
✅ **Testing**: Vitest für Core-Logik + Storage; Playwright optional später.

Diese Architektur ist modular und erweiterbar, respektiert die ORIENT_DNA strikt als oberste Constraint und ermöglicht einen ruhigen, stabilen Core.
