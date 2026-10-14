@echo off
title PawPal - Pet Care Manager
echo ===================================================
echo     PawPal - Pet Care & Wellness Manager
echo ===================================================
echo Starting PawPal local server on http://localhost:3000 ...
start "" "http://localhost:3000"
python -m http.server 3000
pause
