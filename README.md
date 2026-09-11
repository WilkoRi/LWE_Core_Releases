# LWE Core 03

LWE Core 03 is de terminal-first opvolger van LWE Core 02.

De desktop-app, Windows .exe, macOS .app, Rust en Tauri zijn bewust verwijderd. LWE start via Node.js, npm, Terminal/CMD of VS Code.

## Snel Starten

Installeer Node.js LTS:

https://nodejs.org/

Open daarna de projectmap en draai:

```bash
npm install
npm run lwe:next
npm run lwe:approve
npm run lcb
```

Editor:

```txt
http://127.0.0.1:8082/__lcb/
```

Alleen kijken zonder build:

```bash
npm run lcb:preview-only
```

Publiceren:

```bash
npm run build
npm run lwe:publish-check
```

Upload alleen de inhoud van `_site/`.

## Wat Zit Erin

- lokale LCB editor
- 11ty build
- LWE guard/process checks
- image tooling
- navigatie/SEO checks
- publish check
- update check/install
- VS Code extensie
- Windows/Mac startbestanden

## Wat Zit Er Niet Meer In

- geen Tauri desktop app
- geen Rust buildketen
- geen Windows installer
- geen macOS app bundel
- geen signing/notarization workflow

Zie `MANUAL.md` voor de compacte gebruikershandleiding.
