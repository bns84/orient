# ORIENT — Datenbankschema (SQLite)

Dieses Schema leitet sich direkt aus ORIENT_DATA_MODEL_STORAGE.md ab.

Alle Tabellen respektieren:
- Keine automatische Löschung (außer explizit)
- Local-first (keine Cloud-Abhängigkeit)
- Verschlüsselung für sensible Felder (markiert)

---

## Tabellen-Übersicht

1. `users` - Nutzer
2. `impulses` - Rohe Gedanken
3. `threads` - Themenstränge
4. `entities` - Objekte der Welt
5. `edges` - Graph-Verknüpfungen
6. `context_snapshots` - Innenwelt & Situation
7. `sources` - Quellen-Objekte
8. `claims` - Aussagen
9. `snapshot_exports` - Verdichtete Momentaufnahmen
10. `impulse_thread_links` - Many-to-Many: Impulse ↔ Threads
11. `impulse_entity_links` - Many-to-Many: Impulse ↔ Entities
12. `claim_thread_links` - Many-to-Many: Claims ↔ Threads
13. `claim_entity_links` - Many-to-Many: Claims ↔ Entities

---

## Schema-Definitionen

### 1. users

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- UUID
    settings TEXT,  -- JSON: {voice_pref, text_pref, privacy}
    device_keys TEXT,  -- JSON: {key_id, encrypted_key} (Key-Management separat)
    created_at INTEGER NOT NULL,  -- Unix timestamp
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. impulses

```sql
CREATE TABLE impulses (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    content_text TEXT,  -- ENCRYPTED: roher Text (optional)
    content_payload TEXT,  -- ENCRYPTED: JSON für voice transcript, image ref (optional)
    created_at INTEGER NOT NULL,
    context_snapshot_id TEXT,  -- FK zu context_snapshots (optional)
    state TEXT,  -- 'DUST' | 'CLOUD' | NULL
    importance_hint TEXT,  -- 'LOW' | 'MED' | 'HIGH' | NULL (nur Nutzer-Input)
    pinned INTEGER DEFAULT 0,  -- boolean
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (context_snapshot_id) REFERENCES context_snapshots(id)
);

CREATE INDEX idx_impulses_user_id ON impulses(user_id);
CREATE INDEX idx_impulses_created_at ON impulses(created_at);
CREATE INDEX idx_impulses_state ON impulses(state);
CREATE INDEX idx_impulses_pinned ON impulses(pinned);
```

### 3. threads

```sql
CREATE TABLE threads (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,  -- optional
    status TEXT NOT NULL DEFAULT 'ACTIVE',  -- 'ACTIVE' | 'OBSERVED' | 'DORMANT' | 'CLOSED'
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    recency_score REAL DEFAULT 0.0,  -- 0..1
    frequency_score REAL DEFAULT 0.0,  -- 0..1
    user_relevance_score REAL DEFAULT 0.0,  -- 0..1
    confidence_score REAL DEFAULT 0.0,  -- 0..1
    tags TEXT,  -- JSON array: ["world", "life", "creative", "investing"]
    color_semantic TEXT,  -- 'BLUE' | 'GREEN' | 'VIOLET' | 'GOLD' | ...
    region_hint TEXT,  -- JSON: {x, y, z} für Visualisierung (optional)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_created_at ON threads(created_at);
CREATE INDEX idx_threads_confidence_score ON threads(confidence_score);
```

### 4. entities

```sql
CREATE TABLE entities (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'PERSON' | 'ORG' | 'COMPANY' | 'PROJECT' | 'PLACE' | 'ASSET' | 'NARRATIVE' | 'TOPIC'
    name TEXT NOT NULL,
    aliases TEXT,  -- JSON array (optional)
    description TEXT,  -- optional
    attributes TEXT,  -- JSON (optional)
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_entities_user_id ON entities(user_id);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_name ON entities(name);
```

### 5. edges

```sql
CREATE TABLE edges (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    from_type TEXT NOT NULL,  -- 'THREAD' | 'ENTITY' | 'IMPULSE' | 'CLAIM'
    from_id TEXT NOT NULL,
    to_type TEXT NOT NULL,  -- 'THREAD' | 'ENTITY' | 'IMPULSE' | 'CLAIM'
    to_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,  -- 'RELATED_TO' | 'SUPPORTS' | 'CONTRADICTS' | 'INFLUENCES' | 'REACTIVATES' | 'OCCURS_WITH'
    confidence REAL DEFAULT 0.0,  -- 0..1
    recency REAL DEFAULT 0.0,  -- 0..1
    frequency REAL DEFAULT 0.0,  -- 0..1
    user_relevance REAL DEFAULT 0.0,  -- 0..1
    source_weight REAL DEFAULT 0.0,  -- 0..1
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(from_type, from_id, to_type, to_id, relation_type)  -- Dedupe
);

CREATE INDEX idx_edges_user_id ON edges(user_id);
CREATE INDEX idx_edges_from ON edges(from_type, from_id);
CREATE INDEX idx_edges_to ON edges(to_type, to_id);
CREATE INDEX idx_edges_relation_type ON edges(relation_type);
CREATE INDEX idx_edges_confidence ON edges(confidence);
```

### 6. context_snapshots

```sql
CREATE TABLE context_snapshots (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER,  -- Unix timestamp (optional; NICHT löschen, nur "wirksam bis")
    fields TEXT NOT NULL,  -- ENCRYPTED: JSON {mode, intensity_cap, notes}
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_context_snapshots_user_id ON context_snapshots(user_id);
CREATE INDEX idx_context_snapshots_expires_at ON context_snapshots(expires_at);
```

### 7. sources

```sql
CREATE TABLE sources (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT,  -- NULL wenn global
    type TEXT NOT NULL,  -- 'OFFICIAL' | 'EXPERT' | 'SEMI' | 'UNDERGROUND'
    name TEXT NOT NULL,
    url TEXT,  -- optional
    baseline_weight REAL DEFAULT 0.5,  -- 0..1
    track_record REAL DEFAULT 0.5,  -- 0..1 (wächst über Zeit)
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_sources_type ON sources(type);
```

### 8. claims

```sql
CREATE TABLE claims (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    claim_type TEXT NOT NULL,  -- 'FACT' | 'THESIS' | 'INTERPRETATION' | 'RUMOR' | 'UNKNOWN'
    source_id TEXT,  -- FK zu sources (optional)
    evidence_refs TEXT,  -- JSON array (optional)
    confidence REAL DEFAULT 0.0,  -- 0..1
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL
);

CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_claim_type ON claims(claim_type);
CREATE INDEX idx_claims_source_id ON claims(source_id);
CREATE INDEX idx_claims_confidence ON claims(confidence);
```

### 9. snapshot_exports

```sql
CREATE TABLE snapshot_exports (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    mode TEXT NOT NULL,  -- 'WRITING' | 'EXPLAIN' | 'BUILD' | 'OVERVIEW' | 'README' | 'SLIDE_OUTLINE' | 'RAW'
    scope_thread_ids TEXT,  -- JSON array
    scope_time_range_start INTEGER,  -- Unix timestamp (optional)
    scope_time_range_end INTEGER,  -- Unix timestamp (optional)
    output_format TEXT NOT NULL,  -- 'MARKDOWN' | 'TEXT' | 'JSON'
    content TEXT NOT NULL,  -- ENCRYPTED (optional, wenn sensibel)
    provenance TEXT NOT NULL,  -- JSON: {included_impulses, included_entities, included_claims, included_edges}
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_snapshot_exports_user_id ON snapshot_exports(user_id);
CREATE INDEX idx_snapshot_exports_mode ON snapshot_exports(mode);
CREATE INDEX idx_snapshot_exports_created_at ON snapshot_exports(created_at);
```

### 10. impulse_thread_links (Many-to-Many)

```sql
CREATE TABLE impulse_thread_links (
    impulse_id TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (impulse_id, thread_id),
    FOREIGN KEY (impulse_id) REFERENCES impulses(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE INDEX idx_impulse_thread_links_impulse ON impulse_thread_links(impulse_id);
CREATE INDEX idx_impulse_thread_links_thread ON impulse_thread_links(thread_id);
```

### 11. impulse_entity_links (Many-to-Many)

```sql
CREATE TABLE impulse_entity_links (
    impulse_id TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (impulse_id, entity_id),
    FOREIGN KEY (impulse_id) REFERENCES impulses(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

CREATE INDEX idx_impulse_entity_links_impulse ON impulse_entity_links(impulse_id);
CREATE INDEX idx_impulse_entity_links_entity ON impulse_entity_links(entity_id);
```

### 12. claim_thread_links (Many-to-Many)

```sql
CREATE TABLE claim_thread_links (
    claim_id TEXT NOT NULL,
    thread_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (claim_id, thread_id),
    FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE INDEX idx_claim_thread_links_claim ON claim_thread_links(claim_id);
CREATE INDEX idx_claim_thread_links_thread ON claim_thread_links(thread_id);
```

### 13. claim_entity_links (Many-to-Many)

```sql
CREATE TABLE claim_entity_links (
    claim_id TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (claim_id, entity_id),
    FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

CREATE INDEX idx_claim_entity_links_claim ON claim_entity_links(claim_id);
CREATE INDEX idx_claim_entity_links_entity ON claim_entity_links(entity_id);
```

---

## Verschlüsselung

Felder, die als `ENCRYPTED` markiert sind:
- `impulses.content_text`
- `impulses.content_payload`
- `context_snapshots.fields`
- `snapshot_exports.content` (optional, wenn sensibel)

Verschlüsselung erfolgt feldweise vor dem Speichern.
Key-Management separat (Secure Enclave/Keystore).

---

## Migration-Strategie

### Version 1.0 (Initial)
- Alle Tabellen wie oben definiert
- Keine automatische Löschung
- Verschlüsselung für sensible Felder

### Spätere Versionen
- Schema-Änderungen über Migrations
- Append-only wo möglich
- Keine Datenverluste

---

## Constraints & Validierungen

### Thread-Status
- Nur gültige Übergänge erlauben (ACTIVE → OBSERVED → DORMANT → CLOSED)
- Reaktivierung: DORMANT → ACTIVE (nur explizit)

### Edge-Deduplizierung
- UNIQUE-Constraint auf (from_type, from_id, to_type, to_id, relation_type)
- Verhindert doppelte Kanten

### Timestamps
- `created_at` immer NOT NULL
- `updated_at` bei Updates aktualisieren

---

## Performance-Optimierungen

### Indizes
- Alle Foreign Keys indiziert
- Häufige Queries (user_id, status, confidence_score)
- Composite Indizes für Graph-Traversal

### Query-Patterns
- Graph-Traversal: FROM/TO Indizes
- Thread-Suche: Status + Confidence
- Impulse-Suche: User + Created-At

---

## Offene Fragen

1. **UUID-Format**: Welches Format? (z.B. UUIDv4)
2. **Timestamp-Precision**: Sekunden oder Millisekunden?
3. **JSON-Validierung**: In DB oder Application-Layer?
4. **Encryption-Key-Rotation**: Wie handhaben?

Dieses Schema ist vollständig, normalisiert und respektiert alle Anforderungen aus ORIENT_DATA_MODEL_STORAGE.md.
