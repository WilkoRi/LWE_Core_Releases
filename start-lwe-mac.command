#!/bin/bash
cd "$(dirname "$0")" || exit 1

echo ""
echo "LWE starten vanuit: $(pwd)"
echo ""

if [ ! -f package.json ]; then
  echo "FOUT: package.json niet gevonden."
  echo "Zet dit bestand in de hoofdmap van het LWE project."
  read -r -p "Druk op Enter om te sluiten..."
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "FOUT: Node.js/npm is niet gevonden."
  echo "Installeer Node.js LTS via https://nodejs.org/"
  read -r -p "Druk op Enter om te sluiten..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Dependencies installeren..."
  npm install || { read -r -p "npm install mislukt. Druk op Enter..."; exit 1; }
fi

echo "LWE procescontrole..."
npm run lwe:next || {
  echo ""
  echo "LWE vraagt aandacht. Lees de melding hierboven."
  echo "Als de projectstatus klopt, voer daarna handmatig uit: npm run lwe:approve"
  read -r -p "Druk op Enter om te sluiten..."
  exit 1
}

echo ""
echo "Start LWE server."
echo "Website: http://127.0.0.1:8082/"
echo "Editor:  http://127.0.0.1:8082/__lcb/"
echo "Stoppen: Ctrl+C"
echo ""
npm run lcb
read -r -p "Druk op Enter om te sluiten..."
