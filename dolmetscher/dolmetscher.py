"""
ORIENT-Dolmetscher: das Ohr von ORIENT.

Ein kleines Programm, das Sprache in Text verwandelt (Whisper, läuft auf diesem Rechner).
Der Pförtner schickt ihm die Aufnahme, er schickt den Text zurück. Nichts geht ins Internet.
Nur beim allerersten Start wird das Sprachmodell einmal heruntergeladen (Hugging Face).

Einstellungen (Umgebung oder Datei server/.env):
  ORIENT_WHISPER_MODEL    tiny | base | small | medium | large-v3   (Standard: small)
  ORIENT_WHISPER_DEVICE   cpu | cuda | auto                          (Standard: cpu)
  ORIENT_WHISPER_COMPUTE  int8 | float16 | ...                       (Standard: int8)
  ORIENT_EAR_URL          Adresse, Standard http://127.0.0.1:8788 (Host und Port werden daraus gelesen)
"""

import json
import os
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

MAX_BYTES = 25_000_000


def read_env_file() -> dict:
    path = Path(__file__).resolve().parent.parent / "server" / ".env"
    out = {}
    if not path.exists():
        return out
    for raw in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        out[key.strip()] = value.strip().strip('"').strip("'")
    return out


def setting(env_file: dict, name: str, default: str) -> str:
    value = os.environ.get(name) or env_file.get(name) or default
    return value.strip() or default


def host_and_port(url: str) -> tuple:
    parsed = urlparse(url)
    return parsed.hostname or "127.0.0.1", parsed.port or 8788


class Ear:
    """Lädt Whisper einmal und hört dann zu."""

    def __init__(self, model_name: str, device: str, compute: str):
        from faster_whisper import WhisperModel  # erst hier, damit Fehler verständlich bleiben

        self.model_name = model_name
        self.model = WhisperModel(model_name, device=device, compute_type=compute)

    def transcribe(self, audio_path: str, language: str) -> dict:
        segments, info = self.model.transcribe(
            audio_path,
            language=None if language in ("", "auto") else language,
            vad_filter=True,
            beam_size=5,
        )
        text = " ".join(s.text.strip() for s in segments).strip()
        return {"text": text, "language": info.language}


def make_handler(ear: Ear):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):  # ruhig bleiben
            pass

        def _send(self, status: int, body: dict):
            data = json.dumps(body, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if urlparse(self.path).path == "/health":
                self._send(200, {"ok": True, "model": ear.model_name})
            else:
                self._send(404, {"error": "Das kenne ich nicht."})

        def do_POST(self):
            parsed = urlparse(self.path)
            if parsed.path != "/transcribe":
                self._send(404, {"error": "Das kenne ich nicht."})
                return
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0:
                self._send(400, {"error": "Die Aufnahme war leer."})
                return
            if length > MAX_BYTES:
                self._send(413, {"error": "Die Aufnahme ist zu groß."})
                return
            audio = self.rfile.read(length)
            language = (parse_qs(parsed.query).get("lang") or ["de"])[0]
            suffix = ".ogg" if "ogg" in (self.headers.get("Content-Type") or "") else ".webm"
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            try:
                tmp.write(audio)
                tmp.close()
                self._send(200, ear.transcribe(tmp.name, language))
            except Exception as err:  # noqa: BLE001 - Meldung soll beim Nutzer ankommen
                self._send(500, {"error": str(err)})
            finally:
                try:
                    os.unlink(tmp.name)
                except OSError:
                    pass

    return Handler


def main() -> int:
    env_file = read_env_file()
    model_name = setting(env_file, "ORIENT_WHISPER_MODEL", "small")
    device = setting(env_file, "ORIENT_WHISPER_DEVICE", "cpu")
    compute = setting(env_file, "ORIENT_WHISPER_COMPUTE", "int8")
    host, port = host_and_port(setting(env_file, "ORIENT_EAR_URL", "http://127.0.0.1:8788"))

    print("")
    print("ORIENT-Dolmetscher (Ohr)")
    print(f"  Modell: {model_name} ({device}, {compute})")
    print("  Beim allerersten Start wird das Modell einmal heruntergeladen. Das kann dauern.")
    try:
        ear = Ear(model_name, device, compute)
    except ImportError:
        print("\nFEHLT: faster-whisper ist nicht installiert. start-orient.bat richtet es normalerweise ein.")
        return 1
    except Exception as err:  # noqa: BLE001
        print(f"\nDas Modell konnte nicht geladen werden: {err}")
        return 1

    server = ThreadingHTTPServer((host, port), make_handler(ear))
    print(f"  Bereit auf http://{host}:{port}")
    print("Dieses Fenster offen lassen, solange du sprechen willst.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
