# LWE Core Release & Backlog

Doel van dit document: een compact overzicht open non released ontwikkelpunten en long term planning overige op GitHub.



## Werkwijze log

Per item bepalen we:

- Status: open / in onderzoek / besloten / in uitvoering / klaar / geparkeerd
- Complexiteit: laag / middel / hoog
- Risico: laag / middel / hoog
- Impact: laag / middel / hoog
- Type: bugfix / security / workflow / documentatie / feature / migratie

Een item is pas klaar als de acceptatiecriteria zijn gehaald en er een korte testnotitie bij staat. Klaar-items blijven niet als lange detailsecties in deze backlog staan; ze gaan naar het release-archief onderaan.

## Open Overzicht

| Item | Status | Complexiteit | Risico | Impact | Type |
| --- | --- | --- | --- | --- | --- |
| Clean old code | in onderzoek | middel | middel | laag | onderhoud |
| Import oude website | in onderzoek | hoog | middel | hoog | migratie |
| Prototype-tekst vervangen | in onderzoek | laag | laag | laag | documentatie |
| SEO-bestanden | in onderzoek | middel | laag | middel | feature |
| `.htaccess` / redirects | in onderzoek | middel | middel | middel | migratie |
| LCB/LWE editorlabels vertalen | open | laag | laag | middel | editor |
| Image replacement functie | open | middel | middel | middel | feature |
| Lokale publicatie via `__publish` | open | middel | hoog | hoog | feature |
| VSIX cleanup | open | laag | laag | laag | onderhoud |
| Node.js uitleg/link in desktop app | open | laag | laag | middel | UX |
| `_site` processed images automatisch schoonhouden | open | laag | laag | middel | workflow |

-------------------------------- TO DO ----------------------------------

## Clean Old Code

Status: in onderzoek
Complexiteit: middel
Risico: middel
Impact: laag
Type: onderhoud

### Vraag

Er staan ontwikkel- en feedbackbestanden in de Core. Bepalen wat daarvan nodig blijft en wat naar archief kan.

### Te bekijken

- oude of dubbele editorbestanden
- oude termen zoals LCB waar LWE bedoeld wordt
- ongebruikte scripts of documentatie
- release-assets en build-output die niet in Git hoort
- overbodige `.vsix` versies

### Voorzichtigheid

Niet zomaar runtimebestanden verwijderen. Sommige bestanden zijn bronmateriaal voor ontwerpbeslissingen of veiligheidskeuzes.

### Acceptatiecriteria

- Lijst met bestanden: behouden / archiveren / verwijderen.
- Geen bestand verwijderen zonder expliciet akkoord.
- Geen runtimebestand verwijderen dat installer, updater of manual nog gebruikt.

---

## Import Oude Website

Status: in onderzoek
Complexiteit: hoog
Risico: middel
Impact: hoog
Type: migratie

### Huidige situatie

De basisworkflow bestaat al via:

```txt
project-input/oude-website/
```

De AI kan met SAG/LWE-context bestaande HTML, afbeeldingen en bronmateriaal inventariseren. Er is nog geen geautomatiseerde importscanner.

### Mogelijke toekomstige functie

```bash
npm run lwe:import-site
```

Die schrijft bijvoorbeeld:

```txt
project-input/site-inventory.json
```

Met daarin:

- gevonden HTML-pagina's
- titels en meta descriptions
- interne links
- afbeeldingen
- documenten/downloads
- formulieren
- redirects of oude URLs
- mogelijke contentblokken
- verdachte of verouderde tekst

### Acceptatiecriteria Voor Later

- Importscanner wijzigt geen websitebestanden.
- Scanner schrijft alleen inventarisatie naar `project-input/`.
- Scanner benoemt onzekerheden in plaats van aannames te maken.
- AI moet daarna alsnog voorstel + akkoord vragen.

---

## Prototype-Tekst Vervangen

Status: in onderzoek
Complexiteit: laag
Risico: laag
Impact: laag
Type: documentatie

### Probleem

In teksten staat nog regelmatig `prototype`, terwijl LWE al meer is dan alleen een experiment.

### Acceptatiecriteria

- Geen onbedoelde `prototype`-taal in gebruikersdocumentatie.
- Demo-content blijft herkenbaar als demo waar dat nodig is.

Controle:

```bash
rg -n -i "prototype|proof of concept"
```

---

## SEO-Bestanden

Status: in onderzoek
Complexiteit: middel
Risico: laag
Impact: middel
Type: feature

### Probleem

De SEO-context is aangescherpt in release `0.2.52`, maar de volgende productie-outputs worden nog niet standaard door LWE aangemaakt:

```txt
sitemap.xml
robots.txt
```

### Voorgestelde oplossing

Nieuwe starterprojecten krijgen standaard:

```txt
src/sitemap.njk
src/robots.njk
```

Of gelijkwaardige Eleventy-output.

### Aandachtspunten

- `content.meta.siteUrl` moet correct zijn.
- Meertalige routes moeten in sitemap komen.
- `robots.txt` mag productie niet per ongeluk blokkeren.
- Bij ontbrekende echte domeinnaam liever `https://www.example.nl` laten staan en als waarschuwing melden.

### Acceptatiecriteria

- Build maakt `/sitemap.xml`.
- Build maakt `/robots.txt`.
- Meertalige pagina's staan correct in sitemap.
- `lwe:next` waarschuwt als `siteUrl` nog demo/example is.

---

## `.htaccess` / Redirects

Status: in onderzoek
Complexiteit: middel
Risico: middel
Impact: middel
Type: migratie

### Vraag

Bij bestaande websites kunnen oude URLs moeten doorverwijzen naar nieuwe URLs.

Voorbeelden:

```apache
RewriteRule ^over-ons\.html$ /nl/over-ons/ [R=301,L]
Redirect 301 /over-ons.html /nl/over-ons/
```

### Mogelijke aanpak

Een bestaande-site scan kan oude HTML-paden vergelijken met nieuwe routes en een redirectvoorstel maken.

Bronnen:

- oude HTML-bestanden in `project-input/oude-website/`
- bestaande sitemap
- Google Search Console export
- analytics export
- handmatige lijst met oude belangrijke URLs

### Voorzichtigheid

Redirects zijn hosting-afhankelijk. Apache `.htaccess` is niet overal bruikbaar.

### Acceptatiecriteria

- LWE maakt geen automatische redirects zonder review.
- AI geeft een redirectvoorstel.
- Gebruiker bevestigt hostingtype.
- Output is geschikt voor Apache, Netlify, Vercel of handmatige hostingmethode.

---

## LCB/LWE Editorlabels Vertalen

Status: open
Complexiteit: laag
Risico: laag
Impact: middel
Type: editor

### Probleem

De editor zelf heeft nog vaste Nederlandse teksten zoals:

- Zet aan
- Zet uit
- Bewerk tekst
- Opslaan
- Annuleren
- Klik op tekst of een bewerkbare link

Bij meertalige projecten voelt dat niet netjes.

### Voorstel

Maak een klein editor-i18n object in de runtime en kies de taal op basis van `<html lang="">`, met fallback naar Nederlands.

### Acceptatiecriteria

- Editorlabels zijn beschikbaar in NL, EN en DE.
- Projectcontent blijft gescheiden van editor-systemteksten.
- Geen extra JSON-contentcontract nodig voor gebruikers.

---

## Image Replacement Functie

Status: open
Complexiteit: middel
Risico: middel
Impact: middel
Type: feature

### Idee

Een eenvoudige functie waarmee een beheerder een afbeelding kan vervangen zonder handmatig paden in JSON of templates aan te passen.

### Voorzichtigheid

Afbeeldingen raken snel aan publicatie, auteursrecht, privacy en bestandspaden. Deze functie moet daarom beperkt blijven tot toegestane project-assets en mag nooit willekeurig bestanden buiten het project schrijven.

### Mogelijke flow

1. Klik op een bewerkbare afbeelding.
2. Toon huidig pad, alt-tekst, ratio en eventueel caption.
3. Kies een bestaande afbeelding uit `project-input/afbeeldingen/` of upload naar die veilige projectmap.
4. Verwerk naar `src/assets/images/processed/`.
5. Update alleen het toegestane JSON-veld.
6. Bouw opnieuw en toon preview.

### Acceptatiecriteria

- Werkt alleen met toegestane image-mappen.
- Geen path traversal mogelijk.
- Alt-tekst blijft verplicht of wordt actief gevraagd.
- Ratio-keuze ondersteunt minimaal landscape, square en portrait.
- Geen bestanden overschrijven zonder bevestiging.

---

## Lokale Publicatie via `__publish`

Status: open
Complexiteit: middel
Risico: hoog
Impact: hoog
Type: feature / publicatie / security

### Doel

Een veilige lokale webinterface maken waarmee een beheerder de inhoud van `_site/` naar hosting kan publiceren, zonder terminalcommando's en zonder de hele projectmap te uploaden.

Conceptuele route:

```txt
http://127.0.0.1:8082/__publish/
```

Dit hoort functioneel in de projectmap. Core hoeft zelf niet naar hosting te publiceren, maar levert het mechanisme via updates aan projecten.

### Uitgangspunten

- Publiceren gebeurt alleen vanuit een LWE-projectmap.
- Alleen de inhoud van `_site/` mag worden geupload.
- Nooit `project-input/`, `src/`, `lcb/`, `scripts/`, `lwe-process/`, `.git/`, `node_modules/` of de hele projectmap uploaden.
- De route werkt alleen lokaal via `127.0.0.1` / `localhost`.
- Eerst altijd `npm run lwe:publish-check`.
- Standaard eerst dry-run/uploadplan.
- Echte upload alleen na expliciete bevestiging.
- Eerste MVP uploadt en overschrijft, maar verwijdert remote bestanden niet.
- Remote delete komt alleen later met aparte waarschuwing en extra bevestiging.

### Gevoelige gegevens

Deze gegevens zijn gevoelig en worden in de MVP niet opgeslagen:

- host/adres
- protocol
- poort
- remote pad
- gebruikersnaam
- wachtwoord/token

De gebruiker vult deze per publicatiesessie in. LWE gebruikt ze alleen tijdelijk in geheugen tijdens de upload. Na refresh, sluiten of serverstop zijn ze weg.

### Protocol

Voorkeur:

- SFTP als eerste implementatie

Toekomst/fallback:

- FTPS
- FTP

Belangrijke nuance: veel shared hosting noemt alles "FTP", maar ondersteunt soms FTP, FTPS of SFTP. Dat zijn technisch verschillende protocollen.

Mogelijke Node-library voor SFTP:

```txt
ssh2-sftp-client
```

### UI-flow

Knoppen worden stap voor stap vrijgegeven:

1. `Test verbinding`
2. `Bekijk uploadplan`
3. `Publiceer website`

Velden:

- protocol: dropdown, standaard `SFTP`
- host
- poort, standaard `22` bij SFTP
- gebruiker
- wachtwoord/token
- remote map, vaak `/public_html/`

### Uploadplan

Toon minimaal:

- nieuwe bestanden
- gewijzigde bestanden
- ongewijzigde bestanden
- overgeslagen bestanden
- verwijderingen: standaard altijd `0` in MVP

### Bestandsrechten

Na upload moeten rechten waar mogelijk netjes worden gezet:

```txt
mappen:    755
bestanden: 644
```

Niet standaard:

```txt
777
```

Voor SFTP kan dit meestal via `chmod`. Bij FTP/FTPS hangt dit af van server en library.

### Acceptatiecriteria

- `__publish` is alleen lokaal bereikbaar.
- Publiceren kan alleen vanuit een projectmap met `_site/`.
- Voor upload draait altijd `lwe:publish-check`.
- Zonder geldige publish-check wordt publicatie geblokkeerd.
- Host/user/password/protocol/poort/remote pad worden niet opgeslagen.
- Wachtwoord/token verschijnt niet in logs of HTML.
- Uploadplan verschijnt voordat echte upload mogelijk is.
- MVP verwijdert remote bestanden nooit automatisch.
- Alleen bestanden onder `_site/` worden geupload.
- Path traversal naar buiten `_site/` is onmogelijk.
- Remote rechten worden waar mogelijk gezet op mappen `755` en bestanden `644`.
- Fouten zijn begrijpelijk en lekken geen secrets.

---

## VSIX Cleanup

Status: open
Complexiteit: laag
Risico: laag
Impact: laag
Type: onderhoud

### Probleem

Projecten kunnen meerdere oude VS Code extension builds bevatten:

```txt
.vscode/extensions/lwe-control-0.1.3.vsix
.vscode/extensions/lwe-control-0.1.4.vsix
.vscode/extensions/lwe-control-0.1.6.vsix
.vscode/extensions/lwe-control-0.1.7.vsix
```

### Gewenste oplossing

Zorg dat er bij update nooit meer dan de twee nieuwste versies blijven staan van:

```txt
.vscode/extensions/lwe-control-x.x.x.vsix
```

### Acceptatiecriteria

- Updater laat maximaal twee nieuwste `.vsix` bestanden staan.
- Verwijdert alleen bestanden die exact matchen op `lwe-control-*.vsix`.
- Geen andere `.vscode` bestanden verwijderen.

---

## Node.js Uitleg/Link in Desktop App

Status: open
Complexiteit: laag
Risico: laag
Impact: middel
Type: UX

### Probleem

De desktopstarter gebruikt in de MVP nog de lokale Node/npm-installatie. Op een machine zonder Node.js start het project niet goed.

### Gewenste oplossing

Toon in LWE Control een duidelijke melding met link naar:

```txt
https://nodejs.org/
```

Als `node` of `npm` ontbreekt.

### Acceptatiecriteria

- Mac en Windows tonen begrijpelijke foutmelding.
- Link naar Node.js is zichtbaar.
- Geen terminalkennis nodig om het probleem te begrijpen.

---

## `_site` Processed Images Automatisch Schoonhouden

Status: open
Complexiteit: laag
Risico: laag
Impact: middel
Type: workflow

### Probleem

`npm run lwe:images -- --preset=general --prune --apply` ruimt `src/assets/images/processed/` op, maar oude bestanden kunnen in `_site/assets/images/processed/` blijven staan totdat `_site` handmatig wordt opgeschoond.

### Gewenste oplossing

Maak de workflow idiot proof:

- `--prune` ruimt ook de bijbehorende public-output op, of
- `npm run build` maakt `_site/assets/images/processed/` schoon voordat assets worden gekopieerd, of
- documenteer een veilig clean-commando en koppel dat aan een LWE-script.

### Acceptatiecriteria

- Na prune + build staan in `_site/assets/images/processed/` alleen gebruikte processed beelden.
- Bronbeelden in `project-input/afbeeldingen/` blijven altijd behouden.
- Geen handmatige `rm -rf _site` nodig voor normale gebruikers.

---

## Release-Archief
Available on GitHub

Korte lijst van afgeronde mijlpalen. Detail staat in GitHub Releases, commits en de huidige runtimebestanden.

| Release | Kern |
| --- | --- |
| 0.2.15 | Basis `lwe:update` voor bestaande projecten |
| 0.2.19 | Eerste officiele releasebasis |
| 0.2.29-0.2.31 | GitHub Release updateflow en manifestcontroles |
| 0.2.32 | Eerste LWE Control Desktop MVP |
| 0.2.33 | Desktop npm-scripts via updater |
| 0.2.34 | macOS app-build route |
| 0.2.35 | Projectmap kiezen en onthouden in desktop-app |
| 0.2.36 | Tauri dialog capability fix |
| 0.2.37 | Compactere desktop UI |
| 0.2.38 | `Open manual` verwijderd uit desktopstarter |
| 0.2.39 | Windows build via GitHub Actions |
| 0.2.40 | Windows npm/shell en consolevenster fix |
| 0.2.41 | Header image ratio fix en image prune basis |
| 0.2.42 | `lwe-update.config.json` mee in updates |
| 0.2.43 | Update-install slaat gelijke release over zonder `--force` |
| 0.2.44 | VS Code update-popup verduidelijkt |
| 0.2.45-0.2.48 | Editor-only knoppen verborgen/gestript uit publieke output |
| 0.2.49 | Backups naast projectmap |
| 0.2.50 | Standaard image-mappen |
| 0.2.51 | Hero image proxy-knop zichtbaar in edit-modus |
| 0.2.52 | SEO-context aangescherpt |
| 0.2.54 | Desktop console fix
| 0.2.55 | Editable navigatieknoppen en accordions blijven intact in public output |
