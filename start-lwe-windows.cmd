@echo off
cd /d "%~dp0"

echo.
echo LWE starten vanuit: %cd%
echo.

if not exist package.json (
  echo FOUT: package.json niet gevonden.
  echo Zet dit bestand in de hoofdmap van het LWE project.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo FOUT: Node.js is niet gevonden.
  echo Installeer Node.js LTS via https://nodejs.org/
  echo Sluit daarna dit venster en open het opnieuw.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo FOUT: npm is niet gevonden.
  echo Installeer Node.js LTS via https://nodejs.org/
  pause
  exit /b 1
)

if not exist node_modules (
  echo Dependencies installeren...
  call npm install
  if errorlevel 1 (
    echo FOUT: npm install is mislukt.
    pause
    exit /b 1
  )
)

echo LWE procescontrole...
call npm run lwe:next
if errorlevel 1 (
  echo.
  echo LWE vraagt aandacht. Lees de melding hierboven.
  echo Als de projectstatus klopt, voer daarna handmatig uit:
  echo npm run lwe:approve
  echo En start dit bestand opnieuw.
  pause
  exit /b 1
)

echo.
echo Start LWE server.
echo Website: http://127.0.0.1:8082/
echo Editor:  http://127.0.0.1:8082/__lcb/
echo Stoppen: Ctrl+C

echo.
call npm run lcb
pause
