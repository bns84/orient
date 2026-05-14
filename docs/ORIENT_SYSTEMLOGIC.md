# ORIENT — Systemlogik

Diese Systemlogik beschreibt, wie ORIENT Informationen speichert,
verknüpft, priorisiert und nutzbar macht.

Alle Logik ist der ORIENT_DNA untergeordnet.

---

## 1. Gedächtnismodell

ORIENT speichert Informationen nicht als Listen,
sondern als verknüpften Denkraum.

### Speicherarten

**Impulse**
- rohe, unfertige Gedanken
- unbewertet
- kontextualisiert (Zeit, Anlass, Zustand)

**Threads**
- Themenstränge über Zeit
- besitzen Zustände: aktiv / beobachtet / dormant / abgeschlossen
- wachsen, schlafen ein, reaktivieren sich

**Entities**
- Personen, Organisationen, Firmen, Projekte, Narrative, Orte, Assets

**Kontext**
- zeitlich begrenzte Zustände (z. B. Ruhe, Familie, Fokus)
- beeinflussen Priorisierung, nicht Inhalte

Gedanken werden niemals automatisch gelöscht.
Nur explizit abgeschlossene Aufgaben dürfen entfernt werden.

---

## 2. Verknüpfung (Wissensgraph)

ORIENT arbeitet intern mit einem Graphen:

- Knoten: Threads, Entities, Impulse
- Kanten: beeinflusst, bestätigt, widerspricht, gehört zu, erinnert an

Jede Verbindung besitzt Metadaten:
- Confidence (Staub → Wolke → Knoten)
- Recency
- Frequency
- User-Relevance
- Source-Weight

---

## 3. Zeitlogik

Jeder Thread besitzt drei Perspektiven:
- Past (Entstehung & Muster)
- Now (aktuelle Verdichtung)
- Forward (Szenarien, keine Vorhersagen)

Zeit dient der Verifikation, nicht der Prognose.

---

## 4. Eskalationslogik

ORIENT nutzt interne Eskalationsstufen,
die für den Nutzer nicht explizit sichtbar sind.

- Stufe 0: Beobachten (keine Ausgabe)
- Stufe 1: Vermerken
- Stufe 2: Hinweis (optional)
- Stufe 3: Einordnung (Konsequenzen)
- Stufe 4: Handlungsvorschläge (konzeptionell vorhanden, technisch gesperrt)

Eskalation ist nicht linear.
Stufen können zurückfallen.

---

## 5. Themenkompass

Der Themenkompass ist keine Liste,
sondern die sichtbare Struktur des Denkraums.

- Welt-Themen und Lebens-Themen koexistieren
- Relevanz entsteht durch Wiederkehr + Kontext + Zeit
- Themen sind Regionen im Denkraum, keine Menüpunkte

---

## 6. Visuelles Mapping

Interne Zustände → sichtbare Phänomene:

- Impulse → feiner Staub
- wachsende Threads → Adern / Arme
- stabiles Wissen → Knoten
- aktive Verarbeitung → lokales Leuchten
- Kontext → Veränderung von Intensität & Tempo

ORIENT zeigt nur Aktivität,
wenn reale gespeicherte Informationen genutzt werden.

---

## 7. Content-Generierung

ORIENT erzeugt Content anschlussfähig,
nicht isoliert.

Neue Inhalte bauen immer auf:
- bestehenden Threads
- früheren Ideen
- bekannten Kontexten

ORIENT liefert:
- Ideen-Cluster
- Vergleiche
- Übersichten
- Szenarien
- HUDs pro Thema

Keine Dokumente, keine Seiten, keine Navigation.

---

## 8. Themen-HUD

Bei Fokus auf einen Thread kann ORIENT
eine kontextuelle Übersicht einblenden:

- Status
- Entwicklung
- Stabilität
- Unsicherheiten
- Szenarien

HUDs sind temporär und freiwillig.

---

## 9. Export & Verdichtung

ORIENT kann Denkstände verdichten,
wenn der Nutzer es explizit wünscht.

Verdichtungsmodi:
- Schreiben
- Erklären
- Entwickeln
- Übersicht
- README (für Cursor)
- Präsentations-Outline

Exporte sind Momentaufnahmen,
keine endgültigen Wahrheiten.

---

## 10. Multimodale Erweiterung

ORIENT kann optional externe Generatoren anbinden
(Bild, Ton, Video).

ORIENT erzeugt dafür kontextreiche Prompts
aus dem bestehenden Gedächtnis.

Generierte Medien sind Referenzen,
keine Fakten.

---

## 11. Grenzen

ORIENT:
- handelt nicht autonom
- automatisiert keine Entscheidungen
- gibt keine Garantien
- optimiert nicht auf Aufmerksamkeit

ORIENT bleibt ein Denkraum,
kein Kontrollsystem.
