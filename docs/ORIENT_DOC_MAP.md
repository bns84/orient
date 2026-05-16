# ORIENT — Dokumenten-Karte

*Navigation durch alle Docs — mit kanonischer Rolle jeder Datei*

**Start hier:** [`ORIENT_KONZEPT.md`](./ORIENT_KONZEPT.md) (verbindliche Synthese)

---

## Ebene 0 — Kanonisch

| Dokument | Rolle |
|----------|--------|
| **ORIENT_KONZEPT.md** | Gesamtkonzept: Produkt + Verhalten + Phase 1 + Roadmap |
| **ORIENT_DNA.md** | Unveränderliche Grundhaltung (Constraint für alles) |
| **ORIENT_Gesetze.md** | 13 Gesetze — rechtlich/ethisch bindend für Verhalten |

---

## Ebene 1 — Identität & Erlebnis

| Dokument | Inhalt | Beziehung zum Konzept |
|----------|--------|------------------------|
| ORIENT_Manifest.md | Kern, drei Sphären, ein Tag | Kap. 3, 4 |
| ORIENT_Vision.md | 7 Dimensionen, Horizont | Kap. 9 |
| ORIENT_Komplett.md | Kurzüberblick für Mitstreiter | Executive Summary; bei Konflikt → KONZEPT |
| ORIENT_Stimme.md | Ton, Situationen, Modi | Kap. 4.4 |
| ORIENT_SystemPrompt.md | API System-Prompt + Platzhalter | Implementierung Stimme |
| ORIENT_ErsterSatz.md | Wortwörtliches Onboarding-Copy | Kap. 4.5 |
| ORIENT_Onboarding.md | 4 Wege, Wake Word, Lebenszeichen-Konzept | Kap. 4.5 |
| ORIENT_DesignSystem.md | Farben, Typo, Animation, Verbote | Kap. 6.4 |
| ORIENT_DELTA07_BEHAVIOR_PRESENCE.md | Präsenz, Kugel, 3 Ebenen — **Code-Referenz** | Kap. 4.1–4.2 |

---

## Ebene 2 — System & Logik

| Dokument | Inhalt | Beziehung zum Konzept |
|----------|--------|------------------------|
| ORIENT_SYSTEMLOGIC.md | Impulse, Graph, Eskalation, Themenkompass | Kap. 5 |
| ORIENT_DATA_MODEL_STORAGE.md | Domain Objects, Storage | Kap. 5.1 |
| ORIENT_DATABASE_SCHEMA.md | SQL-Schema | Implementierung A1 |
| ORIENT_USER_FLOWS.md | Day 1 / 30 / Year 3 | Test & QA Narrative |
| ORIENT_VERHALTEN.md | Verhalten, Bubble, Pipeline, Seismograph | Kap. 5.4, 9 (Vision) |
| ORIENT_EXPORT_FORMATS.md | Export-Modi | Task D10 |

---

## Ebene 3 — Technik Phase 1 (bauen)

| Dokument | Inhalt | Status |
|----------|--------|--------|
| **ORIENT_ARCHITECTURE.md** | PWA, SQLite, Schichten — **bindend Phase 1** | Kanonisch Tech |
| ORIENT_TODO_PHASE1.md | 11 Prioritäten | Kanonisch Scope |
| ORIENT_DEVELOPMENT_TASKS.md | Tasks A1–D11 detailliert | Umsetzung |
| ORIENT_REPO_STRUCTURE.md | Ordnerstruktur | Implementierung |
| ORIENT_COMPONENT_OVERVIEW.md | Komponenten | Implementierung |
| ORIENT_STATUS_PHASE1.md | Fortschritt | Living doc |
| ORIENT_VISUAL_INTERACTION.md | Visual-Spezifikation | C8 |
| ORIENT_VISUAL_PROTOTYPE_NOTES.md | Prototyp-Notizen | Referenz |

---

## Ebene 4 — Vision-Stack & Cursor (Ziel / Hilfen)

| Dokument | Inhalt | Hinweis |
|----------|--------|---------|
| ORIENT_Architektur.md | Node, Supabase, Queue, Anthropic | **Ab v2** — nicht Phase-1-Pflicht |
| ORIENT_Cursor_v1.md | 12 Schritte PWA/SQLite/local-first (v1.1) | **Umsetzungs-Prompts Phase 1** |
| ORIENT_Versionsplan.md | v1–v10 Features | Kap. 8 KONZEPT |
| ORIENT_Tiefenschicht.md | Muster, Geschichte, Ethik vs. Verschwörung | v4+ |
| ORIENT_Wirtschaft.md | Investment-Philosophie | v8, rechtlich klären |

---

## Welches Doc bei welcher Frage?

| Frage | Lesen |
|-------|--------|
| Was ist ORIENT? Warum? | KONZEPT → DNA → Manifest |
| Darf ORIENT X tun? | Gesetze → KONZEPT Kap. 2 |
| Wie fühlt es sich an? | DELTA07, Stimme, DesignSystem, ErsterSatz |
| Was bauen wir diese Woche? | TODO_PHASE1, DEVELOPMENT_TASKS, ARCHITECTURE |
| Wie speichern wir Gedanken? | DATA_MODEL, DATABASE_SCHEMA, SYSTEMLOGIC |
| Wie testen wir das Erlebnis? | USER_FLOWS |
| Was kommt in 2 Jahren? | Versionsplan, Vision, Tiefenschicht |
| Prompt für KI-Companion? | SystemPrompt |
| Cursor-Prompts kopieren? | Cursor_v1 (aligned mit KONZEPT) |

---

## Bekannte Dubletten (bewusst)

| Thema | Docs | Kanonisch |
|-------|------|-----------|
| Architektur | ARCHITECTURE vs. Architektur | Phase 1: **ARCHITECTURE** |
| Gesamtbild | Komplett vs. KONZEPT | **KONZEPT** |
| Verhalten | Verhalten vs. DELTA07 vs. SYSTEMLOGIC | Verhalten = Vision; DELTA07 = messbar; SYSTEMLOGIC = Daten |
| Onboarding „3 Wege“ | Onboarding, Komplett | **4 Wege** (inkl. natürlich sprechen) |

---

## Pflege-Regel

Neue Docs oder große Änderungen:

1. Widerspruch zu DNA/Gesetzen? → anpassen oder verwerfen  
2. Widerspruch zu KONZEPT? → KONZEPT aktualisieren oder Detail-Doc korrigieren  
3. Eintrag in dieser Karte ergänzen  

---

*ORIENT — Dokumenten-Karte v1.0*
