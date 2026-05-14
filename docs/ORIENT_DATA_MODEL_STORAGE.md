# ORIENT — Data Model & Storage

Dieses Dokument beschreibt das technische Datenmodell von ORIENT
sowie die Speicher- und Sync-Strategie.

Alle Entscheidungen sind der ORIENT_DNA untergeordnet:
- Gedanken werden nicht automatisch gelöscht
- Stille ist ein Feature
- Innenwelt wird lokal verschlüsselt gespeichert
- Server/Synchronisation ist optional und später erweiterbar

---

## 1) Speicher-Ziele

ORIENT muss:
- Kontext über Jahre halten (Threads schlafen, verschwinden nicht)
- Verknüpfungen stabil speichern (Graph)
- Inhalte exportierbar verdichten (Momentaufnahmen)
- lokal-first funktionieren
- optional später synchronisieren (Server) ohne DNA-Bruch

---

## 2) Kernobjekte (Domain Objects)

### 2.1 User
- id
- settings (voice/text prefs, privacy)
- device_keys (für lokale Verschlüsselung; Key-Management separat)
- created_at / updated_at

### 2.2 Impulse (rohe Gedanken)
Repräsentiert: spontane Einträge, Notizen, Sprach-Schnipsel, Bild-Inputs (später).
- id
- user_id
- content_text (optional)
- content_payload (optional; z.B. voice transcript, image ref)
- created_at
- context_snapshot_id (optional)
- links:
  - thread_ids (0..n)
  - entity_ids (0..n)
- attributes:
  - state: DUST | CLOUD (früh) (optional)
  - importance_hint: LOW | MED | HIGH (nur Nutzer-Input, keine Auto-Bewertung)
  - pinned: boolean (vom Nutzer)

### 2.3 Thread (Themenstrang)
Repräsentiert: Themen über Zeit (Welt- oder Lebens-Themen).
- id
- user_id
- title
- description (optional)
- status: ACTIVE | OBSERVED | DORMANT | CLOSED
- created_at / updated_at
- metrics:
  - recency_score
  - frequency_score
  - user_relevance_score
  - confidence_score
- tags (optional; z.B. "world", "life", "creative", "investing")
- display:
  - color_semantic (BLUE/GREEN/VIOLET/GOLD/…)
  - region_hint (für Visualisierung; optional)

### 2.4 Entity (Objekte der Welt)
Personen, Firmen, Projekte, Orte, Narrative.
- id
- user_id
- type: PERSON | ORG | COMPANY | PROJECT | PLACE | ASSET | NARRATIVE | TOPIC
- name
- aliases (optional)
- description (optional)
- attributes (json)
- created_at / updated_at

### 2.5 Edge (Graph-Verknüpfung)
Verbindet Threads, Entities, Impulses (und später Sources/Claims).
- id
- user_id
- from_type / from_id
- to_type / to_id
- relation_type:
  - RELATED_TO
  - SUPPORTS
  - CONTRADICTS
  - INFLUENCES
  - REACTIVATES
  - OCCURS_WITH
- weights:
  - confidence (0..1)
  - recency (0..1)
  - frequency (0..1)
  - user_relevance (0..1)
  - source_weight (0..1) (wenn aus externen Quellen abgeleitet)
- timestamps:
  - created_at
  - last_seen_at

### 2.6 Context Snapshot (Innenwelt & Situation)
Repräsentiert: zeitlich begrenzte Zustände und Umgebungsmarker.
Wichtig: nicht klinisch, nicht diagnostisch.
- id
- user_id
- created_at
- expires_at (optional; NICHT löschen, nur „wirksam bis")
- fields (json), z.B.:
  - mode: QUIET | FOCUS | SOCIAL | FAMILY | TRAVEL
  - intensity_cap: (z.B. max hints/day)
  - notes (optional, user provided)
- used_for:
  - output throttling
  - tone selection
  - HUD frequency

### 2.7 Source (Quellen-Objekt)
Quellen als Objekt getrennt von Aussagen.
- id
- user_id (oder global, je nach Architektur)
- type: OFFICIAL | EXPERT | SEMI | UNDERGROUND
- name
- url (optional)
- reliability_profile:
  - baseline_weight (0..1)
  - track_record (0..1) (wächst über Zeit)
- created_at / updated_at

### 2.8 Claim (Aussage)
Konkrete Behauptung/Informationseinheit, getrennt nach Status.
- id
- user_id
- text
- claim_type: FACT | THESIS | INTERPRETATION | RUMOR | UNKNOWN
- topic_links:
  - thread_ids
  - entity_ids
- source_refs:
  - source_id
  - evidence_refs (optional)
- confidence (0..1)
- created_at / updated_at

### 2.9 Snapshot Export (Verdichtete Momentaufnahme)
Für README, Präsentation, Lesefassung etc.
- id
- user_id
- created_at
- mode: WRITING | EXPLAIN | BUILD | OVERVIEW | README | SLIDE_OUTLINE | RAW
- scope:
  - thread_id(s)
  - time_range (optional)
- output_format:
  - MARKDOWN | TEXT | JSON
- content (rendered)
- provenance:
  - included_impulses
  - included_entities
  - included_claims
  - included_edges

---

## 3) Persistenz-Strategie (Local-First)

### 3.1 Lokaler Speicher
- Primär: lokale Datenbank (z.B. SQLite)
- Alle Inhalte, die Innenwelt betreffen (Context Snapshot, Impulses, persönliche Threads):
  - standardmäßig lokal gespeichert
  - verschlüsselt „at rest" (feldweise oder db-weit)

### 3.2 Verschlüsselung (konzeptionell)
- Pro User/Device: Key (Secure Enclave/Keystore)
- Optional: Passphrase-gestützt (für Recovery)
- Verschlüsselungsumfang:
  - Impulse.content_text/payload
  - Context Snapshot komplett
  - Snapshot Export optional (wenn sensibel)

Keine Cloud-Pflicht.

---

## 4) Sync-Strategie (später, optional)

Ziel: Server/Synchronisation hinzufügen, ohne Verhalten zu ändern.

### 4.1 Prinzip
- Sync ist optional
- Nutzer entscheidet, ob/was synchronisiert wird
- Konflikte werden transparent gelöst (merge, nicht überschreiben)

### 4.2 Sync-Objekte
- Threads, Entities, Edges, Claims, Sources, Exports
- Context Snapshots:
  - standardmäßig lokal-only
  - optional: nur „Meta" (z.B. mode ohne Details)

### 4.3 Konfliktlösung
- bevorzugt append-only Events
- deterministische Merge-Regeln:
  - neuere Updates gewinnen bei Titel/Meta
  - Kanten/Edges werden zusammengeführt (dedupe per hash)

---

## 5) Lebenszyklus: Schlafen statt Löschen

- Threads gehen in DORMANT (schlafend), bleiben erhalten
- Impulse altern nicht weg, können aber „dimmbar" werden (UI)
- CLOSED bedeutet: vom Nutzer abgeschlossen (kann später reaktiviert werden)
- Hard delete nur:
  - explizit vom Nutzer
  - oder klar „banale Tasks", die als erledigt markiert wurden (und nur wenn Nutzer das will)

---

## 6) Anbindung an Visualisierung (Mapping-Hooks)

Für Visual Layer werden aus dem Modell abgeleitet:
- Staub: Impulse mit niedriger confidence / neu / unpinned
- Adern/Arme: Thread + Edges (wachsende Verknüpfungen)
- Knoten: Entities/Threads mit hoher confidence + häufiger Nutzung
- Leuchten: aktuell adressierte Threads/Entities/Claims

Visual darf niemals Aktivität zeigen ohne zugrunde liegende Objekte.

---

## 7) Investing-spezifischer Rahmen (Default)

Investing-Modus Default = Research & Szenarien.
- Keine automatischen Picks
- Claims/Sources/Edges bilden Basis für Szenarien
- Exporte trennen strikt:
  - Fakt / These / Interpretation / Unsicherheit
