@echo off
chcp 65001 >nul
title ORIENT
cd /d "%~dp0"

if not exist node_modules (
  echo Erste Einrichtung, das dauert einmal ein paar Minuten ...
  call npm install
)
if not exist server\.env (
  copy server\.env.example server\.env >nul
  echo.
  echo Die Datei server\.env wurde angelegt. Trage dort deine Schluessel ein.
)

rem --- Das Ohr (Dolmetscher mit Whisper) ---
set "ORIENT_PY="
where py >nul 2>nul && set "ORIENT_PY=py -3"
if not defined ORIENT_PY (
  where python >nul 2>nul && set "ORIENT_PY=python"
)
if not defined ORIENT_PY (
  echo.
  echo HINWEIS: Python wurde nicht gefunden. Ohne Python hat ORIENT kein Ohr ^(Sprache zu Text^).
  echo Installiere Python 3 von python.org ^(Haken bei "Add python to PATH"^) und starte diese Datei neu.
  echo Tippen und der Rest funktionieren trotzdem.
) else (
  if not exist dolmetscher\.venv (
    echo Dolmetscher wird einmalig eingerichtet, das dauert ein paar Minuten ...
    %ORIENT_PY% -m venv dolmetscher\.venv
    call dolmetscher\.venv\Scripts\python.exe -m pip install --quiet -r dolmetscher\requirements.txt
    if errorlevel 1 (
      echo Die Einrichtung des Dolmetschers ist fehlgeschlagen. Das Ohr bleibt aus.
      rmdir /s /q dolmetscher\.venv
    )
  )
  if exist dolmetscher\.venv (
    echo Dolmetscher wird gestartet ...
    start "ORIENT-Dolmetscher" cmd /k "dolmetscher\.venv\Scripts\python.exe dolmetscher\dolmetscher.py"
  )
)

echo Pfoertner wird gestartet ...
start "ORIENT-Pfoertner" cmd /k "npm run server"
timeout /t 4 /nobreak >nul
start "" http://localhost:3000
echo App wird gestartet. Dieses Fenster offen lassen.
call npm run dev
