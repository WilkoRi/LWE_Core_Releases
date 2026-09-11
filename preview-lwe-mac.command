#!/bin/bash
cd "$(dirname "$0")" || exit 1

echo "Preview-only: bestaande _site tonen zonder build of opslaan."
echo "Website: http://127.0.0.1:8082/"
echo "Editor:  http://127.0.0.1:8082/__lcb/"
echo "Stoppen: Ctrl+C"
echo ""
npm run lcb:preview-only
read -r -p "Druk op Enter om te sluiten..."
