# ORIENT – Delta 07
## Behavior & Presence Specification

**Hybrid-Dokument:** Konzept + technische Mapping-Hinweise für Cursor

---

## 0️⃣ Zweck dieses Dokuments (wichtig)

Dieses Dokument ist:

❌ **kein UI-Design**

❌ **keine Feature-Liste**

❌ **keine technische Implementierung**

Es ist:

✅ **das Verhalten, nach dem ORIENT gebaut wird**

✅ **die Referenz, an der jede weitere Code-Entscheidung gemessen wird**

**Wenn etwas diesem Dokument widerspricht, ist der Code falsch, nicht das Dokument.**

---

## 1️⃣ Grundhaltung von ORIENT

**ORIENT ist …**
- ein Companion
- ein Denkraum
- eine präsente Instanz

**ORIENT ist nicht …**
- ein Assistent
- ein Chat
- ein Feed
- ein Archiv
- ein Tool

**Leitsatz:**

> ORIENT begleitet Denken.  
> Er ersetzt es nicht.

---

## 2️⃣ Sichtbare Struktur (aus Usersicht)

Es gibt nur **drei sichtbare Ebenen**:

1. **Präsenz** (die Kugel)
2. **Themen** (horizontal)
3. **Inhalte** (vertikal)

**Alles andere ist intern.**

---

## 3️⃣ Die Kugel – Präsenzmodell

### Bedeutung

Die Kugel ist ORIENT selbst.  
Nicht Symbol, nicht Button.

### Eigenschaften

- immer sichtbar
- immer erreichbar
- nie im Weg
- nie erklärend

### Reaktionen (konzeptionell)

| Situation | Verhalten |
|-----------|-----------|
| Ruhe | kaum Bewegung |
| Zuhören | langsames Pulsieren |
| Denken | tieferes Atmen, leichte Expansion |
| Fokus | Verdichtung |
| Müdigkeit | Rückzug, dunklere Töne |
| Überforderung | Beruhigung, Reduktion |

### ❌ Verboten

- Statusanzeigen
- Text
- Icons
- Ladeindikatoren
- Emojis

---

## 4️⃣ Sprache – Interaktionsmodell

**Sprache ist Eingriff, kein Objekt**

1. **Press & Hold**
2. sprechen
3. loslassen
4. **keine sichtbare Speicherung**
5. **keine Historie**
6. **kein Transkript**

**Sprache verändert:**
- Themengewichtung
- Tiefe
- Tonalität
- Reaktionsform

### ❌ Verboten

- Chatblasen
- Voice-Listen
- Logs
- „Deine letzte Frage war …"

---

## 5️⃣ Themen – horizontale Navigation

### Bedeutung

Themen sind **Angebote von ORIENT**, keine Inhalte.

### Eigenschaften

- horizontal swipbar
- Anzahl variiert
- nicht gleichwertig
- nicht persistent

### Verhalten

- **Swipe ≠ Ablehnung**
- **Swipe = Bewegung im Denkraum**

**Interessen markieren:**
- implizit
- durch:
  - Verweildauer
  - Tap
  - Sprache („Das ist interessant")

### ❌ Verboten

- „Speichern"-Buttons
- Ordner
- Favoritenlisten

---

## 6️⃣ Inhalte – Tiefe

### Bedeutung

Inhalte sind **temporäre Verdichtungen**.

### Eigenschaften

- vertikal scrollbar
- klar begrenzt
- jederzeit verlassbar
- **kein Endless Scroll**

### Rückkehr

- Scroll nach oben → Präsenz
- Doppeltap → Themenübersicht

---

## 7️⃣ Interne Zustände (nicht sichtbar)

**ORIENT arbeitet mit weichen Zuständen, keine Modi**

### Beispielhafte Dimensionen

- `activityLevel`
- `focusLevel`
- `tempo`
- `timeOfDay`
- `sessionMood`

**Diese Zustände:**
- sind numerisch
- überlagern sich
- ändern sich ständig
- **werden nie angezeigt**

---

## 8️⃣ ORIENT pusht – aber leise

**ORIENT darf:**
- vorschlagen
- fragen
- verdichten
- reduzieren

**ORIENT darf nicht:**
- drängen
- bewerten
- belehren
- überfordern

---

## 9️⃣ Verbotene Begriffe (ab jetzt verbindlich)

**Diese Begriffe dürfen niemals im Produkt auftauchen:**

- Graph
- Node
- Event
- DB
- Export / Import
- Inspector
- Debug

**Wenn etwas geteilt wird:**
- „Diesen Gedanken teilen"

**Wenn etwas gesichert wird:**
- „Später wieder aufgreifen"

---

## 🔧 10️⃣ Technisches Mapping für Cursor (ohne Code)

### Was Cursor daraus ableiten soll

**A) Es gibt eine Behavior-Schicht**
- getrennt von UI
- getrennt von Daten
- keine festen Regeln, sondern Gewichtungen

**B) Sprache triggert Zustandsänderung, nicht Objekte**
- keine „Voice Items"
- keine sichtbaren Records

**C) Themen sind Views auf Kontext**
- nicht Datencontainer
- nicht Listen

**D) Alles ist reversibel**
- kein Dead-End
- kein Verlust von Orientierung

---

## 11️⃣ Entwicklungsreihenfolge (ab jetzt verbindlich)

1. **Behavior Layer** (Zustände & Regeln)
2. **Interaction Mapping** (Swipe, Hold, Scroll)
3. **Visuelle Präsenz** (Kugel)
4. **Inhalte**
5. **Feinschliff**

**❗ UI kommt nach Verhalten, nicht davor.**

---

## 12️⃣ Status der Deltas (jetzt abgeschlossen)

| Delta | Status |
|-------|--------|
| 01–06 | technische Foundation |
| 07 | Verhaltens- & Präsenzdefinition ✅ |

👉 **Jetzt ist die Basis fertig.**

---

## Nächster Schritt (Delta 08 – Vorschlag)

**Delta 08: ORIENT Behavior Engine (Minimal)**

- Kein UI. Kein Design.
- Zustandsvariablen
- Gewichtungslogik
- einfache Regeln
- Simulation per Logs

👉 **Erst wenn das steht, gehen wir wieder ins Interface.**

---

**Wenn du willst, machen wir Delta 08 als nächstes.**  
**Sag einfach: „Delta 08".**
