# ORIENT — Design System

*Version 0.1 — Für Cursor. Konsistent. Immer.*

---

## Das Grundgefühl

Subtil stark.
Fast leer — aber lebendig.
Man öffnet die App und atmet aus.

Nicht: was muss ich jetzt tun?
Sondern: ich bin angekommen.

Dunkel. Tief. Intelligent.
Wie durch ein Bullauge in ein Universum schauen.

---

## Farben

### Hintergründe
```
--bg-primary:     #010208   /* Tiefstes Schwarz — Haupthintergrund */
--bg-secondary:   #0a0b14   /* Bubble-Inneres, Karten */
--bg-tertiary:    #0d0f1a   /* Widgets, erhöhte Elemente */
--bg-overlay:     rgba(1,2,8,0.85) /* Overlays, Modal */
```

### Text
```
--text-primary:   #d8daf0   /* Haupttext — leicht bläulich weiß */
--text-secondary: #4a4a6a   /* Sekundärtext, Labels */
--text-tertiary:  #252535   /* Sehr dezent, Hints */
--text-disabled:  #181828   /* Deaktiviert */
```

### Akzente — Themenfarben
```
--color-science:    rgb(255,130,30)   /* Naturwissenschaften — Orange */
--color-philosophy: rgb(150,70,255)   /* Philosophie — Violett */
--color-language:   rgb(30,150,255)   /* Sprachen — Blau */
--color-art:        rgb(255,60,170)   /* Kunst — Pink */
--color-history:    rgb(190,40,50)    /* Geschichte — Dunkelrot */
--color-tech:       rgb(0,210,190)    /* Technologie — Cyan */
--color-economics:  rgb(50,190,70)    /* Wirtschaft — Grün */
--color-personal:   rgb(255,190,50)   /* Persönliches — Gold */
```

### Bubble-Farben (Zustände)
```
--bubble-rest:    rgba(80,120,255,0.18)   /* Ruhig — Blau */
--bubble-listen:  rgba(0,180,255,0.28)    /* Zuhören — Hellblau */
--bubble-think:   rgba(130,80,255,0.22)   /* Denken — Violett */
--bubble-emotion: rgba(255,100,40,0.30)   /* Emotion — Orange */
--bubble-connect: rgba(50,190,70,0.20)    /* Verbinden — Grün */
--bubble-ready:   rgba(200,160,20,0.28)   /* Ergebnis — Gold */
```

### Borders & Divider
```
--border-subtle:  rgba(255,255,255,0.04)
--border-default: rgba(255,255,255,0.07)
--border-strong:  rgba(255,255,255,0.12)
```

---

## Typografie

### Schriften
```
Primär:    -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif
Monospace: 'SF Mono', 'JetBrains Mono', monospace  /* für Daten, Zeiten */
Serif:     'New York', Georgia, serif               /* für Zitate, Insights */
```

### Größen
```
--text-xs:   9px   /* Labels, Tags, Hints — letter-spacing: 2px */
--text-sm:   11px  /* Sekundärtext, Meta */
--text-base: 13px  /* Haupttext, Widgets */
--text-md:   15px  /* Karten-Titel */
--text-lg:   18px  /* Themen-Titel */
--text-xl:   22px  /* Begrüßung */
--text-2xl:  28px  /* Selten — großer Moment */
```

### Gewichte
```
Regular:  400  /* Fließtext */
Medium:   500  /* Navigation, Labels */
Semibold: 600  /* Titel, wichtige Infos */
Bold:     700  /* Selten — nur für Betonung */
```

### Letter-Spacing
```
Labels/Tags:  2px — 3px  /* immer uppercase */
Fließtext:    0px — 0.3px
Titel:        -0.3px — -0.5px
```

---

## Abstände

### Basis-Einheit: 4px
```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

### Screen-Padding
```
Horizontal: 20px — 24px
Vertikal oben: 14px (nach Status Bar)
Vertikal unten: 32px — 40px
```

### Komponenten
```
Widget padding:     12px 14px
Karten padding:     16px 20px
Button padding:     8px 20px
Icon-Größe klein:   20px
Icon-Größe mittel:  28px
```

---

## Border Radius
```
--radius-sm:   8px   /* Tags, kleine Elemente */
--radius-md:   12px  /* Widgets, kleine Karten */
--radius-lg:   16px  /* Karten */
--radius-xl:   24px  /* Große Karten */
--radius-full: 9999px /* Pills, Buttons, Bubble */
```

---

## Animationen

### Grundprinzip
Nie abrupt. Nie zu langsam.
Organisch — wie Atem, nicht wie Maschine.

### Zeiten
```
--duration-fast:   150ms  /* Hover, kleine Reaktionen */
--duration-default:300ms  /* Standard-Übergänge */
--duration-slow:   500ms  /* Ein- und Ausblenden */
--duration-bubble: 4000ms /* Bubble-Atem-Zyklus */
```

### Easing
```
--ease-default: cubic-bezier(0.4, 0, 0.2, 1)  /* Standard */
--ease-in:      cubic-bezier(0.4, 0, 1, 1)     /* Rein */
--ease-out:     cubic-bezier(0, 0, 0.2, 1)     /* Raus */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) /* Sanfter Sprung */
```

### Bubble-Animationen
```
Ruhezustand:  langsames Atmen — scale 1.0 → 1.02 → 1.0, 4s, ease-in-out
Zuhören:      Wellen reagieren auf Stimme, EKG-Muster
Denken:       Knoten pulsieren unregelmäßig, Kaskaden
Emotion:      Warme Ringe expandieren, 3-4s Zyklus
Verbinden:    Zwei Zentren nähern sich, Burst bei Merge
Ergebnis:     Gold-Pulse vom Zentrum, Spiral-Arme
```

### Screen-Übergänge
```
Einblenden:   opacity 0→1, translateY 8px→0, 300ms ease-out
Ausblenden:   opacity 1→0, 200ms ease-in
Karte öffnen: scale 0.96→1, opacity 0→1, 300ms ease-spring
Karte schließen: scale 1→0.96, opacity 1→0, 200ms ease-in
```

---

## Komponenten-Regeln

### Buttons
```
Primär:    Kein klassischer Button — eher ein Kreis oder Signal
Sekundär:  Transparenter Hintergrund, subtiler Border
Gefahr:    Nie rot — nur gedämpftes Dunkelrot, selten
Disabled:  opacity: 0.3, cursor: not-allowed
```

### Widgets
```
Hintergrund: rgba(255,255,255,0.02)
Border:      1px solid rgba(255,255,255,0.04)
Radius:      16px
Padding:     12px 14px
Label:       9px, letter-spacing 2px, uppercase, color: --text-tertiary
```

### Status-Bar (oben)
```
Höhe:        44px
Inhalt:      Uhrzeit links — Sync-Dot rechts
Schrift:     11px, --text-tertiary
Sync-Dot:    5px Kreis, rgba(50,180,80,0.4) wenn online
             rgba(255,255,255,0.1) wenn offline
```

### Voice Button
```
Größe:       56px × 56px
Form:        Kreis
Hintergrund: rgba(255,255,255,0.03)
Border:      1px solid rgba(255,255,255,0.07)
Icon:        Mikrofon — 18px × 22px, opacity 0.3
Aktiv:       Border-Farbe → rgba(0,180,255,0.4)
             Puls-Animation nach außen
```

---

## Was nie erlaubt ist

— Weiße oder helle Hintergründe (kein Light Mode in v1)
— Harte Schatten (nur subtile Glows)
— Mehr als 2 Schriftgrößen pro Komponente
— Mehr als 3 Elemente pro Widget
— Animationen über 600ms (außer Bubble)
— Rote Farben für Fehler — stattdessen gedämpftes Orange
— Badges mit Zahlen — keine Notification-Counter
— Klassische Tab-Bar oder Navigation
— Menüs mit mehr als 4 Optionen sichtbar gleichzeitig

---

## Der goldene Satz für Cursor

*"Weniger ist mehr. Dunkel, tief, lebendig.
Jedes Element das nicht unbedingt da sein muss — ist nicht da.
Die Bubble ist immer sichtbar. Der Voice Button immer erreichbar.
Der Rest ist Stille."*

---

*ORIENT — Design System v0.1*
*Subtil stark. Immer.*
