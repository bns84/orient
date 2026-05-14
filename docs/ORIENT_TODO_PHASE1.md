# ORIENT — TODO Phase 1

Ziel von Phase 1:
Ein funktionierender, ruhiger ORIENT-Core,
der Denken, Gedächtnis und Beziehung abbildet –
ohne Feature-Explosion.

Maximal 10–20 Tasks.
Alles Weitere kommt später.

---

## PRIORITÄT A — Core & Fundament

1. **Lokales Datenmodell implementieren**
   - Impulse, Threads, Entities, Edges
   - Status-Logik (ACTIVE / DORMANT / CLOSED)
   - keine automatische Löschung

2. **Lokale Verschlüsselung**
   - Local-first
   - sensible Felder verschlüsselt
   - Key-Handling konzeptionell sauber (kein Cloud-Zwang)

3. **Thread-Lifecycle-Engine**
   - Aktivierung
   - Dormant-Übergang
   - Reaktivierung (nur bei explizitem Trigger)

4. **Graph-Engine (minimal)**
   - Knoten + Kanten
   - Gewichtung (recency, confidence, relevance)
   - keine Visualisierungspflicht in Phase 1

---

## PRIORITÄT B — Interaktion & Beziehung

5. **Input-Layer**
   - Text-Input
   - Voice-Input (Transkript genügt)
   - alles wird als Impulse gespeichert

6. **Kontext-Snapshot-System**
   - manuell setzbar („Ruhe", „Familie", „Fokus")
   - beeinflusst Antwortfrequenz & Tiefe
   - kein UI-Overkill

7. **Eskalationslogik (0–3)**
   - Beobachten
   - Vermerken
   - Hinweis
   - Einordnung
   - Stufe 4 technisch gesperrt

---

## PRIORITÄT C — Wahrnehmung & Feedback

8. **Minimaler Visual-Denkraum**
   - kein finales 3D
   - aber: Reaktion auf Aktivität
   - sichtbarer Fokuswechsel bei Themen

9. **Themen-Fokus & HUD (rudimentär)**
   - Status eines Threads anzeigen
   - Unsicherheit sichtbar machen
   - freiwillig, nicht persistent

---

## PRIORITÄT D — Produktivität & Nutzen

10. **Snapshot-Export (Markdown/Text)**
    - Overview
    - Writing
    - README (für Cursor)

11. **Explizite Nutzer-Kommandos**
    - „Fass das zusammen"
    - „Leg das ab"
    - „Ignorier das erstmal"
    - „Exportier mir das"

---

## NICHT Teil von Phase 1

- Kein Feed
- Keine Push-Notifications
- Keine Gamification
- Keine automatische Investment-Picks
- Keine finale 3D-Visualisierung
- Keine Cloud-Pflicht

Phase 1 endet,
wenn ORIENT ruhig, stabil und vertrauenswürdig denkt.
