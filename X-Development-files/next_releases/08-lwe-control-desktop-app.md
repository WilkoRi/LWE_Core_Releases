# 08 - LWE Control Desktop App

Status: MVP gebouwd en lokaal getest

Doel: gewone websitebeheerders kunnen een opgeleverde LWE-site beheren zonder VS Code en zonder terminalkennis.

## Principe

VS Code blijft de omgeving voor:

- LWE Core ontwikkeling
- nieuwe websites bouwen
- bestaande websites migreren
- AI-gestuurde bouwcontrole
- technische debugging

De zelfstandige LWE Control app is voor:

- een bestaande projectmap lokaal starten
- de lokale LWE-server stoppen/herstarten
- website/editor/manual in de browser openen
- status en poort begrijpelijk tonen

## Release 0.2.32

De eerste MVP is toegevoegd onder `desktop/lwe-control/`.

Getest:

```bash
node --check desktop/lwe-control/src/main.js
cargo check --manifest-path desktop/lwe-control/src-tauri/Cargo.toml
npm run lwe:control-desktop:build
```

Belangrijk: dit is nog MVP-functionaliteit. De bronbestanden mogen met projecten meekomen via `lwe:update-install`, maar er wordt nog geen kant-en-klare eindgebruikersapp of installer gebouwd.

## Release 0.2.33

Release-fix:

- `lwe:update` voegt nu ook de `lwe:control-desktop:*` scripts toe aan project `package.json`.
- Het Tauri MVP-icoon is opnieuw geschreven als echte RGBA PNG zodat release-builds niet crashen.

## Release 0.2.34

macOS app-build toegevoegd:

- Tauri bundling staat aan voor een macOS `.app`.
- `icon.icns` toegevoegd voor macOS bundling.
- Nieuw commando `npm run lwe:control-desktop:release-macos`.
- Het commando bouwt `LWE Control.app` en kopieert die naar `release-assets/macos/`.
- `release-assets/` blijft lokaal en wordt niet in Git opgenomen.

## Release 0.2.35

Zelfstandige app-start verbeterd:

- LWE Control kan nu een LWE-projectmap kiezen via een native mapkiezer.
- De gekozen projectmap wordt lokaal onthouden.
- De app hoeft daardoor niet meer naast `package.json` in de projectmap te staan.
- Een gedownloade app in Downloads of een app in Programma's kan dezelfde LWE-projectmap bedienen.

## Gewenste UX

De gebruiker krijgt een app:

```txt
LWE Control.app
```

of op Windows:

```txt
LWE Control.exe
```

Gebruik:

```txt
Dubbelklik LWE Control
Klik Start
Klik Open web editor
```

De gebruiker hoeft niet te weten wat Node.js, npm, localhost of een poortnummer is.

## MVP

De eerste versie mag nog lokaal `npm run lcb` starten. Dat bewijst de UX zonder meteen alle packaging-problemen tegelijk op te lossen.

MVP knoppen:

- Start server
- Stop server
- Herstart server
- Open website
- Open web editor
- Open manual

MVP status:

- projectmap
- server gestopt/actief
- poort
- website URL
- editor URL

## Eindrichting

Daarna wordt Node.js als Tauri sidecar gebundeld. Dan heeft de gebruiker geen losse Node-installatie meer nodig.

Tauri is hiervoor passend omdat het sidecars ondersteunt: een desktop-app kan een lokaal hulpprogramma meeleveren, starten en stoppen.

## Veiligheidsregels

- De app start alleen LWE-commando's in de gekozen projectmap.
- Geen willekeurige command input van de gebruiker uitvoeren.
- Geen websitecontent aanpassen buiten de bestaande LWE editor.
- Geen upload naar hosting.
- Geen automatische update zonder expliciete gebruikersactie.
- Als een poort bezet is: duidelijke melding tonen.

## Open Punten

- Per project meegeleverd of een algemene app die een projectmap kiest?
- Eerst `npm run lcb` gebruiken of meteen Node-sidecar?
- macOS code signing/notarization later nodig voor prettige installatie.
- Windows installer later apart testen.
