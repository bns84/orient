# ORIENT — Architektur & Datenpipeline

> **Hinweis:** Ziel-Architektur ab Version 2+ (Sync, API, Queue). **Phase 1:** [`ORIENT_ARCHITECTURE.md`](./ORIENT_ARCHITECTURE.md) und [`ORIENT_KONZEPT.md`](./ORIENT_KONZEPT.md) Kap. 6.

*Version 0.1 — Das technische Fundament*

---

## Grundprinzip

ORIENT ist kein System das alles sofort verarbeitet.
Es ist ein System das denkt — in Schichten, mit Zeit, mit Pausen.

Wie ein Mensch.

Nicht jede Information ist sofort eine Erkenntnis.
Manche Dinge brauchen Minuten. Manche Stunden. Manche Wochen.
ORIENT ist ehrlich darüber wo es gerade steht.

---

## Die Architektur-Schichten

### Schicht 1 — Das Gerät
React + Vite + Dexie (IndexedDB)

Das Gesicht von ORIENT. Immer verfügbar, auch offline.
Hält einen lokalen Cache der wichtigsten aktuellen Daten.
Spricht nie direkt mit der Datenbank — immer nur mit der API.

### Schicht 2 — Die API (Nervensystem)
Node.js + Express — saubere Abstraktionsschicht

Alle Anfragen laufen hier durch.
Das Gerät kennt nur die API — nicht was dahinter liegt.
Wenn die Datenbank wechselt, merkt das Gerät nichts davon.
Flexibel, austauschbar, erweiterbar.

### Schicht 3 — Die Job Queue (Trichter)
Asynchrone Verarbeitungs-Pipeline

Alles was reinkommt landet hier zuerst.
Roh, unverarbeitet, priorisiert.
Die Queue entscheidet was wann verarbeitet wird.
Nie alles auf einmal — immer in der richtigen Reihenfolge.

### Schicht 4 — Die Datenbank (Gedächtnis)
PostgreSQL via Supabase (Start) — austauschbar später

Alle Nutzerdaten, strikt nach Nutzer-ID getrennt.
Schnell durch Caching — was einmal verarbeitet wurde bleibt abrufbar.
Vektorisierte Speicherung für semantische Suche und Verbindungen.

### Schicht 5 — Die KI-Schicht (Gehirn)
Anthropic API — erweiterbar mit anderen Modellen

Verarbeitet Jobs aus der Queue.
Zieht Verbindungen, erkennt Muster, generiert Erkenntnisse.
Arbeitet im Hintergrund — auch wenn der Nutzer schläft.

---

## Die Verarbeitungs-Pipeline

### Der Trichter

Alles was in ORIENT eingeht — Sprache, Ideen, Mails, News,
Beobachtungen, Recherchen — fließt zuerst in den Trichter.

Roh. Unbewertet. Einfach da.

Der Trichter sortiert und priorisiert.
Er entscheidet welche Stufe der Verarbeitung nötig ist.
Er schützt das System vor Überlastung.

---

### Stufe 1 — Sofortverarbeitung (Sekunden)

Direkte Anfragen die sofort beantwortet werden müssen.

Beispiele:
— Navigation: wo ist mein nächster Termin?
— Einfache Fakten: wie ist die Staulage?
— Aktionen: schreib eine kurze Mail

Kein Warten. Keine Queue. Direkte Antwort.

---

### Stufe 2 — Schnelle Verarbeitung (Minuten)

Neue Eingaben die eingeordnet werden müssen.

Beispiele:
— Eine neue Idee wird grob kategorisiert
— Eine Sprachnotiz wird transkribiert und verortet
— Ein neues Thema wird ersten Verbindungen zugeordnet

ORIENT sagt: *ich habe das — es wird eingeordnet.*

---

### Stufe 3 — Tiefe Verarbeitung (Minuten bis Stunden)

Komplexe Aufgaben die Zeit brauchen.

Beispiele:
— Recherche zu einem Thema oder einer Firma
— Verbindungen zu älteren Einträgen ziehen
— Eine Idee mit Marktrecherche anreichern
— Einen Ernährungsplan entwickeln

ORIENT sagt: *das braucht etwa eine Stunde —
ich lege das Ergebnis bereit wenn es fertig ist.*

---

### Stufe 4 — Langzeitverarbeitung (Tage bis Wochen)

Das große Bild entsteht.

Beispiele:
— Muster im Verhalten des Nutzers erkennen
— Themen die über Wochen wiederkehren verknüpfen
— Das Persönlichkeitsprofil verfeinern
— Verbindungen zwischen weit entfernten Ideen finden

Dieser Prozess läuft immer im Hintergrund.
Er braucht keine Anfrage — er passiert einfach.
Das Ergebnis erscheint als Intuition des Tages
oder als unerwartete Verbindung.

---

## Technische Kernprinzipien

### Evolvable Architecture
Das System ist wie Lego — nicht wie Beton.

Jede Funktion ist ein Modul.
Module können hinzukommen, wachsen, ersetzt werden.
Das Fundament bleibt — der Rest ist flexibel.

Heute: Supabase.
Morgen vielleicht: eigener Server.
ORIENT merkt keinen Unterschied.

### Abstraktionsschicht
Das Gerät spricht nie direkt mit der Datenbank.
Immer über die API.

Das schützt vor Abhängigkeiten.
Das erlaubt Veränderungen ohne alles kaputt zu machen.

### Vektorisierte Speicherung
Informationen werden nicht nur als Text gespeichert —
sondern als semantische Vektoren.

Das bedeutet: ORIENT versteht Bedeutung, nicht nur Worte.
Es findet Verbindungen auch wenn die Worte verschieden sind.
Suche und Verbindungen funktionieren blitzschnell —
auch bei Millionen von Einträgen.

### Inkrementelles Verknüpfen
Neue Information wird nicht mit allem verglichen.
Nur mit dem was relevant sein könnte.

Das spart Rechenleistung.
Das macht das System skalierbar.
Das erlaubt es auch bei sehr vielen Nutzern zu funktionieren.

### Caching
Was einmal verarbeitet wurde bleibt schnell abrufbar.

Ladezeiten entstehen nur beim ersten Mal.
Danach: sofort.

### Self-Extension (Phase 4+)
ORIENT kann erkennen wo Lösungen fehlen.
Es formuliert das Problem.
Es schlägt Code vor.
Es testet in sicherer Umgebung.
Es integriert wenn es funktioniert.

Das ist möglich — aber erst wenn das Fundament steht.
Das Fundament muss es erlauben — deshalb bauen wir es von Anfang an offen.

---

## Der Tech-Stack

| Schicht | Technologie | Warum |
|---------|-------------|-------|
| Gerät | React + Vite + Dexie | Bereits vorhanden, offline-fähig |
| API | Node.js + Express | Gleiche Sprache wie Frontend, Cursor-freundlich |
| Queue | Bull / BullMQ | Bewährt, einfach mit Cursor zu implementieren |
| Datenbank | PostgreSQL via Supabase | Stabil, Auth inklusive, austauschbar |
| Vektoren | pgvector (Supabase) | Semantische Suche direkt in der DB |
| KI | Anthropic API | Kern-Intelligenz, erweiterbar |
| Cache | Redis | Schnelle Zwischenspeicherung |

---

## Aufrichtigkeit über Verarbeitungsstatus

ORIENT sagt immer wo es steht.

Nicht: *"ich weiß es nicht"*
Sondern: *"ich habe das — in einer Stunde kann ich mehr sagen"*

Nicht: *"ich bin fertig"*
Sondern: *"hier ist ein erster Stand — die tiefe Analyse folgt"*

Das ist Gesetz 1 in der Praxis.
Aufrichtig auch über den eigenen Verarbeitungsstatus.

---

*ORIENT — Architektur v0.1*
*Das Fundament das alles andere trägt.*
