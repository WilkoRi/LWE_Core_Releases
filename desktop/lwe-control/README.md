# LWE Control Desktop

MVP voor een zelfstandige Local Website Editor starter.

Deze app is bedoeld voor websitebeheerders die een bestaande LWE-projectmap willen openen zonder VS Code of terminal.

## MVP

- Start lokale LWE-server
- Stop lokale LWE-server
- Herstart lokale LWE-server
- Kies LWE-projectmap
- Open website
- Open web editor
- Open manual

De MVP start de lokale Node/LWE-server in de gekozen projectmap. De latere productversie bundelt Node als Tauri sidecar.

## Projectmap

LWE Control kan een LWE-projectmap kiezen via de knop `Kies projectmap`. Die keuze wordt lokaal onthouden.

Daardoor mag de macOS `.app` bijvoorbeeld in Downloads of Programma's staan. De app hoeft niet naast `package.json` in de projectmap te staan.

## Ontwikkelen

Vanuit de Core-map:

```bash
npm run lwe:control-desktop:install
npm run lwe:control-desktop:dev
npm run lwe:control-desktop:build
npm run lwe:control-desktop:release-macos
```

Of direct vanuit deze map:

```bash
cd desktop/lwe-control
npm install
npm run tauri:dev
```

## Belangrijk

Deze desktop-app is een aparte beheerlaag. De bestaande LWE editor op `__lcb` blijft de plek waar teksten, links en afbeeldingen worden aangepast.

Deze MVP bouwt nog geen eindgebruikers-installer. De app start nu nog de lokale Node/LWE-server uit een gekozen projectmap; de volgende stap is een Node-sidecar en daarna macOS/Windows packaging.

## macOS App Maken

Vanuit de Core-map:

```bash
npm run lwe:control-desktop:release-macos
```

De gebouwde app komt lokaal klaar te staan in:

```txt
release-assets/macos/LWE Control.app
```

Deze map is een lokaal distributie-artifact en wordt niet in Git opgenomen.
