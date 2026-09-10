# LWE - Local Website Editor

Versie 0.2.52

LWE helpt om een snelle, gewone website lokaal te bekijken, aan te passen en daarna als statische website te publiceren.

Je zit niet vast aan een online websitebouwer. De website staat in een projectmap op je eigen computer. Vanuit die map wordt de echte website gebouwd naar `_site/`.

Deze handleiding is voor twee soorten gebruikers:

1. **Beheerder**
   Je past teksten en afbeeldingen aan in een bestaande LWE-website.

2. **Bouwer**
   Je maakt of verbouwt websites met LWE Core, VS Code en AI.

## Gebruik Op Eigen Risico

LWE is een open source hulpmiddel. Je mag het gebruiken, aanpassen en verbeteren, maar je blijft zelf verantwoordelijk voor wat je ermee bouwt, wijzigt en publiceert.

Controleer altijd zelf de inhoud, werking, rechten op teksten en afbeeldingen, privacy, cookies, toegankelijkheid en andere regels die voor jouw website gelden. AI kan helpen, maar AI is geen eindcontrole.

Maak bij bestaande websites eerst een kopie en test daarin. Publiceer pas als je zelf hebt gecontroleerd dat de website klopt.

## De Drie Belangrijkste Begrippen

| Begrip | Betekenis |
| --- | --- |
| LWE Control app | De startknop voor gewone gebruikers. Hiermee start je de lokale website en editor. |
| Projectmap | De map van jouw website. Hierin staan bronbestanden, afbeeldingen, instellingen en `_site/`. |
| `_site/` | De gebouwde website. Alleen deze inhoud publiceer je naar je hosting. |

## LWE Project Voor Beheer

Gebruik deze route als je een bestaande website beheert en vooral teksten of afbeeldingen wilt aanpassen.

### Wat Heb Je Nodig?

- de LWE Control app voor macOS of Windows
- Node.js, zolang LWE Control nog geen eigen Node-runtime meelevert
- de projectmap van de website

Download LWE Control via de GitHub Releases:

```txt
https://github.com/WilkoRi/LWE_Core_Releases/releases
```

Download Node.js via:

```txt
https://nodejs.org/
```

Kies normaal de LTS-versie. Na installatie kan LWE lokaal een website starten.

### Website Starten

1. Open **LWE Control**.
2. Kies de juiste projectmap.
3. Klik **Start**.
4. Klik **Open web editor**.

De gewone website opent meestal op:

```txt
http://127.0.0.1:8082/
```

De editor opent meestal op:

```txt
http://127.0.0.1:8082/__lcb/
```

Je hoeft deze adressen normaal niet te onthouden. De knoppen in LWE Control openen ze voor je.

### Tekst Aanpassen

1. Open de web editor.
2. Klik op **Zet aan**.
3. Klik op een bewerkbare tekst.
4. Pas de tekst aan.
5. Klik **Opslaan**.

Gebruik `Enter` voor een nieuwe regel. Laat je een lege regel tussen twee stukken tekst, dan wordt dat meestal een nieuwe alinea.

LWE slaat tekst op als gewone tekst, niet als losse HTML-code.

### Afbeeldingen Aanpassen

Afbeeldingen die door de website beheerbaar zijn, krijgen in de editor een bewerkknop.

Nieuwe bronafbeeldingen zet je in:

```txt
project-input/afbeeldingen/
```

LWE maakt daar veilige webversies van in:

```txt
src/assets/images/processed/
```

Na het bouwen komen de gebruikte beelden in:

```txt
_site/assets/images/processed/
```

Gebruik bij voorkeur foto's die groot genoeg zijn en waar je rechten voor hebt. Foto's met personen gebruik je alleen als daar toestemming voor is.

### Publiceren

De website die bezoekers uiteindelijk zien, staat in:

```txt
_site/
```

Publiceer normaal alleen de inhoud van `_site/` naar de webroot van je hostingprovider, bijvoorbeeld `public_html`.

Upload niet de hele projectmap. Mappen zoals `project-input/`, `src/`, `lcb/`, `lwe-process/` en `node_modules/` horen normaal niet publiek op de webserver.

Controleer na upload altijd of pagina's, afbeeldingen, menu's, taalwissels, formulieren en links werken.

## LWE Core Voor Bouwers

Gebruik deze route als je websites maakt, bestaande websites omzet of LWE zelf ontwikkelt.

Core is de gereedschapskist. Een project is de echte website.

```txt
LWE Core    -> bouwen en installeren
Projectmap  -> beheren en aanpassen
_site/      -> publiceren
```

### Wat Heb Je Nodig?

- Visual Studio Code
- Node.js LTS
- LWE Core
- een AI-assistent die de LWE-instructies kan lezen

VS Code kun je downloaden via:

```txt
https://code.visualstudio.com/
```

Open altijd de juiste map. Open `LWE_Core_02` als je een nieuw project wilt maken. Open de websiteprojectmap als je aan een bestaande website werkt.

## Nieuwe Website Maken

Open de Core-map in VS Code en maak een nieuwe projectmap:

```bash
node install-lcb.js ../Mijn_Website_Project --mode new
```

Open daarna de nieuwe projectmap in VS Code.

```bash
npm install
npm run lwe:next
```

Geef de output van `npm run lwe:next` aan de AI. Die output vertelt wat de volgende veilige stap is.

## Bestaande Website Naar LWE Brengen

Maak eerst een kopie van de bestaande website of projectmap. Werk niet direct in de enige live versie.

Installeer LWE vanuit de Core-map:

```bash
node install-lcb.js ../Mijn_Bestaande_Website --mode existing
```

Open daarna de projectmap in VS Code en volg:

```bash
npm install
npm run lwe:next
```

Een bestaande website is niet automatisch volledig JSON-ready. Soms moet content eerst worden omgezet naar beheerbare data.

## Werken Met De AI

De AI moet eerst de LWE-context lezen voordat er gebouwd wordt.

Een goede opdracht is:

```txt
Gebruik de output van npm run lwe:next als LWE process engine status.
Lees eerst LCB-AI-INSTRUCTIES.md, lcb-context/ en project-input/.
Stel maximaal 1 ontbrekende intakevraag per reactie.
Pas geen websitebestanden aan zolang LWE edit_files blokkeert.
```

De vaste intake staat in:

```txt
project-input/website-intake.json
```

Korte antwoorden zijn prima. Laat velden liever niet leeg. Als je geen voorkeur hebt, schrijf dan bijvoorbeeld:

```txt
ik weet het niet, verras me
```

## Voorstel En Akkoord

Als de intake compleet is, moet de AI eerst een voorstel maken.

Daarin hoort minimaal te staan:

- wat de AI uit de intake heeft begrepen
- welke pagina's gebouwd worden
- welke taal of talen gebruikt worden
- welke stijl, kleuren, logo's en afbeeldingen worden gebruikt
- welke functionaliteit wel en niet wordt gebouwd
- wat bewust nog niet wordt gedaan

Pas na menselijk akkoord mag de buildfase open:

```bash
npm run lwe:approve
npm run build
```

Laat een AI-assistent `npm run lwe:approve` niet namens jou uitvoeren. Dat commando is de menselijke akkoordknop.

Wil je terug naar de voorstelfase of intakefase:

```bash
npm run lwe:unapprove
npm run lwe:reset
```

## Mappen In Een LWE-Project

| Map of bestand | Waarvoor is het? | Zelf aanpassen? |
| --- | --- | --- |
| `project-input/` | Aanlevermap voor intake, documenten, foto's, oude website en notities. | Ja. |
| `project-input/afbeeldingen/` | Bronmap voor foto's en andere beelden waaruit je kiest. | Ja. |
| `project-input/website-intake.json` | Vaste intake voor nieuwe of omgebouwde websites. | Ja, liefst samen met AI. |
| `src/` | Websitebron: templates, data, styles en assets. | Alleen bewust, via editor of AI. |
| `src/_data/` | Beheerbare websitecontent in JSON. | Ja, voorzichtig. |
| `src/assets/images/processed/` | Geoptimaliseerde webbeelden. | Normaal via LWE laten maken. |
| `_site/` | Gebouwde website-output voor publicatie. | Niet handmatig aanpassen. |
| `lcb/` | Local Website Editor systeem. | Nee. |
| `lcb-context/` | AI-afspraken en bouwregels. | Alleen voor LWE-proceswijzigingen. |
| `lwe-process/` | Processtatus en runtime-versie. | Nee. |
| `node_modules/` | Geinstalleerde technische pakketten. | Nee. |
| `package.json` | Projectcommando's en technische instellingen. | Meestal niet. |

De belangrijkste scheiding:

```txt
project-input/ = bronmateriaal en intake
src/           = websitebron
_site/         = publiceerbare website
```

## Afbeeldingen Voorbereiden

Controleer eerst wat LWE zou maken:

```bash
npm run lwe:images
```

Verwerk de beelden daarna echt:

```bash
npm run lwe:images -- --apply
```

Voor algemene websitebeelden:

```bash
npm run lwe:images -- --preset=general --prune --apply
```

Met `--prune` ruimt LWE ongebruikte processed beelden op in de processed map. Originele beelden in `project-input/afbeeldingen/` blijven staan.

Handige presets:

```bash
npm run lwe:images -- --preset=general
npm run lwe:images -- --preset=hero
npm run lwe:images -- --preset=person
npm run lwe:images -- --preset=logo
```

## Projecten Updaten

Controleer eerst of er een update is:

```bash
npm run lwe:update-check
```

Installeer daarna alleen bewust:

```bash
npm run lwe:update-install -- --apply
```

Ben je al up-to-date, dan meldt LWE dat. Bewust opnieuw installeren kan alleen bij herstel of noodzaak:

```bash
npm run lwe:update-install -- --apply --force
```

Een projectupdate overschrijft geen websitecontent. `src/`, `project-input/`, `_site/`, `node_modules/` en `lwe-process/state.json` blijven van het project.

Backups worden buiten de projectmap naast het project geplaatst, zodat de projectmap niet onnodig groot wordt.

## Publicatiecheck

Controleer voor publicatie:

```bash
npm run lwe:publish-check
```

Publiceer daarna alleen:

```txt
_site/
```

Niet publiceren:

```txt
project-input/
src/
lcb/
lcb-context/
lwe-process/
node_modules/
.git/
.vscode/
```

## Veelvoorkomende Situaties

### LWE Control Zegt Inactief

Dat betekent dat de lokale server niet draait. Klik **Start**.

### De Projectmap Wordt Niet Herkend

Kies de map waarin bestanden zoals `package.json`, `lcb-server.js` of `server.js` staan. Kies niet per ongeluk `Downloads`, `_site/` of een losse submap.

### Node Of Npm Wordt Niet Gevonden

Installeer Node.js LTS via:

```txt
https://nodejs.org/
```

Herstart daarna LWE Control, VS Code of de terminal. Op Windows kan een nieuw geinstalleerde Node.js pas zichtbaar zijn na het opnieuw openen van de app of terminal.

### Poort 8082 Is Bezet

Dan draait er waarschijnlijk al een andere LWE-server. Stop die via LWE Control, of gebruik tijdens ontwikkeling tijdelijk een andere poort.

```bash
PORT=8083 npm run lcb
```

### De Editor Slaat Niet Op

Controleer of je in de editor zit:

```txt
http://127.0.0.1:8082/__lcb/
```

In preview-only modus kun je niet opslaan.

### Een Afbeelding Is Niet Bewerkbaar

Niet elke afbeelding is automatisch beheerbaar. De website moet die afbeelding koppelen aan beheerbare data. Vraag de bouwer om die afbeelding LWE-bewerkbaar te maken.

## Korte Routes

Voor beheer:

```txt
Open LWE Control
Kies projectmap
Start
Open web editor
Zet aan
Pas tekst of afbeelding aan
Opslaan
Controleer website
Publiceer _site/
```

Voor bouw:

```bash
npm install
npm run lwe:next
npm run lwe:approve
npm run build
npm run lcb
```

Voor updates:

```bash
npm run lwe:update-check
npm run lwe:update-install -- --apply
```

## Lijst Met Commando's

Deze lijst is vooral voor bouwers en probleemoplossing.

| Commando | Doel |
| --- | --- |
| `npm install` | Installeert technische pakketten. |
| `npm run lwe:next` | Toont de actuele LWE-processtatus. |
| `npm run lwe:approve` | Geeft menselijk akkoord voor buildfase. |
| `npm run lwe:unapprove` | Zet terug naar de voorstelfase. |
| `npm run lwe:reset` | Zet terug naar de intakefase. |
| `npm run build` | Bouwt de website naar `_site/`. |
| `npm run lcb` | Start lokale website en editor. |
| `npm run lcb:preview-only` | Start read-only preview van bestaande `_site/`. |
| `npm run lwe:publish-check` | Controleert publiceerbare output. |
| `npm run lwe:nav-check` | Controleert menu's en quick links tegen `project-input/navigation-contract.json`. |
| `npm run lwe:images` | Controleert beeldverwerking zonder schrijven. |
| `npm run lwe:images -- --apply` | Verwerkt beelden echt. |
| `npm run lwe:images -- --preset=general --prune --apply` | Verwerkt en ruimt ongebruikte processed beelden op. |
| `npm run lwe:update-check` | Controleert op stabiele update. |
| `npm run lwe:update-install -- --apply` | Installeert een stabiele update. |
| `npm run lwe:update-install -- --apply --force` | Installeert dezelfde release opnieuw bij herstel. |
| `npm run lwe:control-desktop:install` | Installeert Desktop Control onderdelen voor ontwikkeling. |
| `npm run lwe:control-desktop:dev` | Start Desktop Control in ontwikkelmodus. |
| `npm run lwe:control-desktop:build` | Bouwt Desktop Control als app/installer. |
