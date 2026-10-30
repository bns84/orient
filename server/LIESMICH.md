# Der Pförtner

Ein kleines Programm zwischen App und KI. Er verwahrt die Schlüssel, die Regel-Kartei und rechnet die Kosten mit.

Starten: Doppelklick auf `start-orient.bat` (Pförtner + App, Adresse localhost:3000).
Schlüssel: in `server\.env` eintragen (Vorlage: `server\.env.example`).
Sprache: Das Ohr ist der Dolmetscher (`dolmetscher\dolmetscher.py`, Whisper). `start-orient.bat` richtet ihn beim ersten Mal ein, wenn Python auf dem Rechner ist. Der erste Start lädt das Sprachmodell einmal herunter.
Testlauf Claude gegen ChatGPT: `server\testlauf\eingaben.txt` und `regeln.txt` füllen, dann `testlauf.bat`.

Nur für Boris, für andere noch prüfen (Datenschutz, Verträge der KI-Anbieter).
