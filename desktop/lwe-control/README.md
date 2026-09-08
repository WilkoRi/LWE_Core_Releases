# LWE Control Desktop

MVP voor een zelfstandige Local Website Editor starter.

Deze app is bedoeld voor websitebeheerders die een bestaande LWE-projectmap willen openen zonder VS Code of terminal.

## MVP

- Start lokale LWE-server
- Stop lokale LWE-server
- Herstart lokale LWE-server
- Open website
- Open web editor
- Open manual

De eerste MVP start nog `npm run lcb` in de projectmap. De latere productversie bundelt Node als Tauri sidecar.

## Projectmap

Voor deze MVP gebruikt LWE Control de projectmap waarin de app wordt gestart:

- macOS `.app`: zet `LWE Control.app` naast `package.json` in de LWE-projectmap.
- losse binary tijdens ontwikkeling: start vanuit de LWE-projectmap of zet de binary naast `package.json`.

## Ontwikkelen

Vanuit de Core-map:

```bash
npm run lwe:control-desktop:install
npm run lwe:control-desktop:dev
npm run lwe:control-desktop:build
```

Of direct vanuit deze map:

```bash
cd desktop/lwe-control
npm install
npm run tauri:dev
```

## Belangrijk

Deze desktop-app is een aparte beheerlaag. De bestaande LWE editor op `__lcb` blijft de plek waar teksten, links en afbeeldingen worden aangepast.

Deze MVP bouwt nog geen eindgebruikers-installer. De app start nu nog `npm run lcb`; de volgende stap is een Node-sidecar en daarna macOS/Windows packaging.
