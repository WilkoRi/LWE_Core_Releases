# LWE Control

LWE Control is een lokale VS Code extensie voor Local Website Editor projecten.

De extensie voegt een middenpaneel toe met knoppen voor de meest gebruikte LWE-acties. De knoppen voeren dezelfde commando's uit als normaal, maar sturen ze zichtbaar naar de geïntegreerde VS Code terminal.

## Commando

Open in VS Code:

```txt
Command Palette -> LWE: Open Control Panel
```

## Installeren als gewone extensie

Gebruik het `.vsix` bestand uit de Core-map:

```txt
vscode-extension/dist/lwe-control-0.1.6.vsix
```

Installeren kan in VS Code via:

```txt
Extensions -> ... -> Install from VSIX...
```

Of via de terminal:

```bash
code --install-extension vscode-extension/dist/lwe-control-0.1.6.vsix --force
```

Daarna werkt LWE Control zonder `F5` of debugvenster.

## Gebruiken

1. Open een LWE-projectmap in VS Code.
2. Klik links op het LWE-icoon, of klik onderin de statusbalk op `LWE`.
3. Gebruik de knoppen in het paneel.

## Lokaal testen tijdens ontwikkeling

1. Open de map `vscode-extension/lwe-control` in VS Code.
2. Druk op `F5` om een Extension Development Host te starten.
3. Open in dat nieuwe VS Code venster een LWE-projectmap.
4. Open de Command Palette en kies `LWE: Open Control Panel`.

## Wat de knoppen doen

- `Start AI Conversatie hier!` -> opent `AI_START_HERE.md`, kopieert de startprompt en draait `npm run lwe:next`
- `Controleer status` -> `npm run lwe:next`
- `Maak nieuw project` -> vraagt een projectnaam en draait `node install-lcb.js ../Projectnaam --mode new`
- `Open intake` -> opent `project-input/website-intake.json`
- `Ik geef akkoord` -> vraagt bevestiging en draait daarna `npm run lwe:approve`
- `Build website` -> `npm run build`
- `Start editor` -> `npm run lcb`
- `Stop applicatie` -> stuurt Ctrl-C naar de LWE terminal die door het paneel is gestart
- `Preview-only` -> `npm run lcb:preview-only`
- `Check afbeeldingen` -> toont met `npm run lwe:images` een veilig dry-run plan
- `Publicatiecheck` -> `npm run lwe:publish-check`
- `Update controleren` -> `npm run lwe:update-check`
- `Update installeren` -> vraagt bevestiging en draait daarna `npm run lwe:update-install -- --apply`; als de runtime al up-to-date is, wordt niets overschreven

## Veiligheidsregel

De akkoordknop is bewust een human action. Een AI-assistent mag deze knop niet namens de gebruiker bedienen.

De extensie hoort lokaal in VS Code. Voor publicatie blijft de hoofdregel:

```txt
Upload alleen _site/
```

De extensie, LWE-scripts, intake, procesdata en projectbron horen niet in `public_html`.
