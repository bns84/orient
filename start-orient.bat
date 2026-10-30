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

echo Pfoertner wird gestartet ...
start "ORIENT-Pfoertner" cmd /k "npm run server"
timeout /t 4 /nobreak >nul
start "" http://localhost:3000
echo App wird gestartet. Dieses Fenster offen lassen.
call npm run dev
