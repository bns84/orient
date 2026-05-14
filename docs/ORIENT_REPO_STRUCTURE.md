# ORIENT — Repository-Struktur

Diese Struktur respektiert die ORIENT_DNA und folgt der modularen Architektur.

**Plattform**: PWA (TypeScript end-to-end)  
**Build**: Vite  
**Testing**: Vitest

---

## Verzeichnisstruktur

```
orient-world-intelligence-system/
├── docs/                          # Dokumentation
│   ├── ORIENT_DNA.md
│   ├── ORIENT_SYSTEMLOGIC.md
│   ├── ORIENT_DATA_MODEL_STORAGE.md
│   ├── ORIENT_DATABASE_SCHEMA.md
│   ├── ORIENT_ARCHITECTURE.md
│   ├── ORIENT_VISUAL_INTERACTION.md
│   ├── ORIENT_USER_FLOWS.md
│   ├── ORIENT_EXPORT_FORMATS.md
│   ├── ORIENT_TODO_PHASE1.md
│   ├── ORIENT_DEVELOPMENT_TASKS.md
│   └── ORIENT_VISUAL_PROTOTYPE_NOTES.md
│
├── src/
│   ├── core/                      # Core-Logik (DNA-konform)
│   │   ├── domain/               # Domain Layer
│   │   │   ├── entities/         # Domain Objects
│   │   │   │   ├── Impulse.ts
│   │   │   │   ├── Thread.ts
│   │   │   │   ├── Entity.ts
│   │   │   │   ├── Edge.ts
│   │   │   │   ├── ContextSnapshot.ts
│   │   │   │   ├── Source.ts
│   │   │   │   ├── Claim.ts
│   │   │   │   └── SnapshotExport.ts
│   │   │   │
│   │   │   ├── graph/            # Graph-Engine
│   │   │   │   ├── GraphEngine.ts
│   │   │   │   ├── Node.ts
│   │   │   │   └── Edge.ts
│   │   │   │
│   │   │   ├── lifecycle/        # Thread-Lifecycle
│   │   │   │   └── ThreadLifecycleEngine.ts
│   │   │   │
│   │   │   ├── context/          # Context-Manager
│   │   │   │   └── ContextManager.ts
│   │   │   │
│   │   │   └── escalation/      # Eskalations-Engine
│   │   │       └── EscalationEngine.ts
│   │   │
│   │   ├── data/                 # Data Layer
│   │   │   ├── database/        # SQLite
│   │   │   │   ├── DatabaseService.ts
│   │   │   │   ├── migrations/
│   │   │   │   │   └── 001_initial.sql
│   │   │   │   └── schema.ts
│   │   │   │
│   │   │   ├── repositories/    # Repository-Pattern
│   │   │   │   ├── ImpulseRepository.ts
│   │   │   │   ├── ThreadRepository.ts
│   │   │   │   ├── EntityRepository.ts
│   │   │   │   ├── EdgeRepository.ts
│   │   │   │   ├── ContextSnapshotRepository.ts
│   │   │   │   ├── SourceRepository.ts
│   │   │   │   ├── ClaimRepository.ts
│   │   │   │   └── ExportRepository.ts
│   │   │   │
│   │   │   └── encryption/      # Verschlüsselung
│   │   │       ├── EncryptionService.ts
│   │   │       └── KeyManager.ts
│   │   │
│   │   └── application/         # Application Layer
│   │       ├── input/           # Input-Processor
│   │       │   ├── InputProcessor.ts
│   │       │   ├── TextInputHandler.ts
│   │       │   └── VoiceInputHandler.ts
│   │       │
│   │       ├── export/          # Export-Engine
│   │       │   ├── ExportEngine.ts
│   │       │   └── templates/
│   │       │       ├── OverviewTemplate.ts
│   │       │       ├── WritingTemplate.ts
│   │       │       └── ReadmeTemplate.ts
│   │       │
│   │       └── commands/          # Command-Processor
│   │           └── CommandProcessor.ts
│   │
│   ├── ui/                       # Presentation Layer
│   │   ├── visual/              # Visual-Engine (Canvas/WebGL-light)
│   │   │   ├── VisualEngine.ts
│   │   │   ├── CanvasRenderer.ts
│   │   │   ├── WebGLRenderer.ts
│   │   │   └── mapping/         # Datenmodell → Visual
│   │   │       ├── DustMapper.ts
│   │   │       ├── ThreadMapper.ts
│   │   │       └── EntityMapper.ts
│   │   │
│   │   ├── hud/                 # HUD-System
│   │   │   └── HUD.ts
│   │   │
│   │   └── input/               # Input-Interface
│   │       ├── TextInput.ts
│   │       └── VoiceInput.ts
│   │
│   ├── app/                      # App-Entry & Orchestrierung
│   │   ├── App.ts
│   │   ├── main.ts
│   │   └── serviceWorker.ts
│   │
│   └── utils/                    # Utilities
│       ├── types.ts
│       └── constants.ts
│
├── tests/                         # Tests
│   ├── unit/                     # Unit-Tests (Vitest)
│   │   ├── domain/
│   │   ├── data/
│   │   └── application/
│   │
│   ├── integration/              # Integration-Tests
│   │   └── flows/
│   │
│   └── e2e/                      # E2E-Tests (Playwright, später)
│       └── (später)
│
├── public/                        # Statische Assets
│   ├── manifest.json             # PWA-Manifest
│   ├── icons/
│   └── sw.js                     # Service Worker (generiert)
│
├── .vscode/                       # VS Code Settings
│   └── settings.json
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

---

## Wichtige Dateien

### package.json (Auszug)

```json
{
  "name": "orient-world-intelligence-system",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "better-sqlite3": "^9.x",  // oder sql.js für Browser
    "uuid": "^9.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/uuid": "^9.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "vitest": "^1.x",
    "@vitest/ui": "^1.x"
  }
}
```

### tsconfig.json (Auszug)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "WebWorker"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@ui/*": ["src/ui/*"],
      "@app/*": ["src/app/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, './src/core'),
      '@ui': resolve(__dirname, './src/ui'),
      '@app': resolve(__dirname, './src/app'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
  },
});
```

---

## DNA-Konformität in der Struktur

### Ruhe vor Geschwindigkeit
- Keine Polling-Loops in `core/`
- Event-basiert statt Push
- Ressourcen-schonende Visual-Engine

### Local-First
- `data/database/` für lokale SQLite
- `data/encryption/` für lokale Verschlüsselung
- Keine Cloud-Abhängigkeiten in Core

### Stille ist ein Feature
- Keine automatischen Notifications
- Keine Hintergrund-Aktivität ohne Grund
- Visual-Engine zeigt nur bei echten Daten

### Keine automatische Löschung
- Repository-Pattern respektiert DNA
- Lifecycle-Engine: DORMANT statt DELETE
- Keine Cleanup-Jobs

### Transparenz
- Klare Modul-Trennung
- Keine Blackbox-Komponenten
- Logging nur für Debugging

---

## Entwicklungsworkflow

### 1. Core-Logik (DNA-konform)
- Start in `src/core/domain/`
- Tests parallel in `tests/unit/`
- Keine UI-Abhängigkeiten

### 2. Data-Layer
- Repository-Pattern in `src/core/data/repositories/`
- Migrationen in `src/core/data/database/migrations/`
- Verschlüsselung isoliert

### 3. Application-Layer
- Orchestrierung in `src/core/application/`
- Input/Export/Commands getrennt

### 4. UI-Layer (später)
- Visual-Engine in `src/ui/visual/`
- Canvas/WebGL-light (Phase 1)
- Kein Three.js (Phase 2)

---

## Testing-Strategie

### Unit-Tests (Vitest)
- `tests/unit/domain/` - Domain-Logik
- `tests/unit/data/` - Repository-Layer
- `tests/unit/application/` - Application-Layer

### Integration-Tests
- `tests/integration/flows/` - Datenfluss
- Input → Impulse → Thread
- Export-Engine

### E2E-Tests (später)
- `tests/e2e/` - Playwright (optional)

---

## Offline-First (PWA)

### Service Worker
- `src/app/serviceWorker.ts`
- Caching-Strategie
- Offline-Funktionalität

### Manifest
- `public/manifest.json`
- Installierbarkeit
- Icons

### Storage
- SQLite via `sql.js` (Browser) oder `better-sqlite3` (Node)
- IndexedDB als Fallback

---

## Erweiterbarkeit

### Phase 2: Three.js/R3F
- Neue Module in `src/ui/visual/threejs/`
- Keine Core-Änderung

### Phase 2: Desktop (Tauri)
- Separate `src-tauri/` (Tauri-spezifisch)
- Gleiche Core-Logik

### Später: Sync
- Neue Module in `src/core/sync/`
- Optional aktivierbar

---

Diese Struktur ist modular, DNA-konform und erweiterbar ohne DNA-Bruch.
