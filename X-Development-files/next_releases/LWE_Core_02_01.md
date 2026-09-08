# LWE Core 02.01 Release & Backlog

Doel van dit document: vastleggen wat in de officiele LWE Core release zit en welke punten daarna nog klein genoeg zijn om gericht te bespreken, bouwen en testen.

## Officiele Release

Status: release-klaar  
Versie: `0.2.19`  
Gebruik: basisversie voor nieuwe projecten en updates van bestaande LWE-projecten

Deze release bevat:

- LWE-versiebestand in `lwe-process/version.json`.
- Manual in NL, EN en DE.
- Demo-intake ingevuld zodat de Core-demo via het normale proces kan draaien.
- Strengere LWE procesguard: intake, voorstel, akkoord, build en review.
- Hardere blokkade bij ongeautoriseerde wijzigingen in beschermde bestanden.
- `lwe:approve`, `lwe:unapprove`, `lwe:reset`, `lwe:publish-check` en `lwe:update`.
- Veiligere `/api/save` en `/api/read` met lokale hostcheck, edit-token, allowlist en path-validatie.
- Machine-owned `lwe-process/state.json` met signaturecontrole.
- `execFile`/allowlist-aanpak voor buildcommando's.
- `lines` en `paragraphs` filters voor simpele beheerbare tekstblokken en lijsten.
- Client-side kalender-helper voor verlopen events, zodat events zonder rebuild verborgen kunnen worden.
- Preview-only modus voor inspectie zonder buildguard.
- `__lcb` root/demo routes: `__lcb/_root/` en `__lcb/_demo/`.
- Updateflow voor bestaande 11ty/LWE-projecten zonder `src/`, `src/_data/`, `project-input/`, `_site/` of `state.json` te overschrijven.
- LWE Control VS Code extensie als project-support: `.vscode/extensions.json` en lokaal `.vsix` installatiebestand.
- LWE Control heeft een stopknop die Ctrl-C naar de door LWE gestarte terminal stuurt.
- LWE Control heeft als eerste actie `Start AI Conversatie hier!`, zodat nieuwe AI-chats eerst de LWE-handshake krijgen.
- Manual-afbeeldingen in `manual_images/` worden mee gepubliceerd in de Core/starter en mee gekopieerd bij installatie/update.
- Publish-check benoemt `manual_images/` als lokale bronmap; de gebouwde kopie in `_site/manual_images/` mag wel online.

## Werkwijze

Per item bepalen we:

- Status: open / in onderzoek / besloten / in uitvoering / klaar / geparkeerd
- Complexiteit: laag / middel / hoog
- Risico: laag / middel / hoog
- Impact: laag / middel / hoog
- Type: bugfix / security / workflow / documentatie / feature / migratie

Een item is pas klaar als de acceptatiecriteria zijn gehaald en er een korte testnotitie bij staat.

## Overzicht

| Item | Status | Complexiteit | Risico | Impact | Type |
| --- | --- | --- | --- | --- | --- |
| LCB menu bar visual bug | klaar | laag | laag | middel | bugfix |
| Clean old code | in onderzoek | middel | middel | laag | onderhoud |
| Import oude website | in onderzoek | hoog | middel | hoog | migratie |
| Prototype-tekst vervangen | in onderzoek | laag | laag | laag | documentatie |
| Improved lcb-context | klaar basisversie | middel | laag | middel | workflow |
| SEO-bestanden | open | middel | laag | middel | feature |
| `.htaccess` / redirects | in onderzoek | middel | middel | middel | migratie |
| `lwe:update` voor bestaande projecten | klaar release 0.2.15 | hoog | middel | hoog | workflow |
| Tekstblokken en lijsten als 1 editveld | klaar | middel | laag | hoog | editor |
| Kalender verlopen events client-side | klaar | middel | laag | hoog | feature |
| `__lcb` demo/root routes | klaar | laag | laag | middel | bugfix |
| LCB/LWE editorlabels vertalen | open | laag | laag | middel | editor |
| Image replacement functie | open | middel | middel | middel | feature |

---

## 1. LCB Menu Bar Visual Bug

Status: klaar  
Complexiteit: laag  
Risico: laag  
Impact: middel  
Type: bugfix

### Probleem

De LWE/LCB editor-menubalk schuift over het echte websitemenu. Daardoor kunnen onderdelen van de website-navigatie onbereikbaar of slecht zichtbaar worden.

### Voorgestelde oplossing

Toon de LWE-menubalk boven het gewone menu, zodat beide zichtbaar en bereikbaar blijven.

Mogelijke aanpak:

- LWE toolbar `position: sticky` of vaste hoogte geven.
- Body/top-padding aanpassen als editor actief is.
- Z-index van editor-toolbar en site-header bewust ordenen.
- Op mobiel controleren dat toolbar, hamburger-menu en offcanvas elkaar niet blokkeren.

### Acceptatiecriteria

- Website-menu blijft klikbaar in normale preview.
- Website-menu blijft bereikbaar in `/__lcb/`.
- LWE-toolbar overlapt geen belangrijke navigatie.
- Werkt op desktop en mobiel.

### Testnotitie

Uitgevoerd in `lcb/lcb-editor.css` en `src/assets/lcb-editor.css`: toolbar is van `position: fixed` naar `position: sticky` gegaan en neemt nu ruimte in de layout. Daarnaast is `npm run lcb:preview-only` toegevoegd voor read-only visuele inspectie van een bestaande `_site/` zonder buildguard.

---

## 2. Clean Old Code

Status: in onderzoek  
Complexiteit: middel  
Risico: middel  
Impact: laag  
Type: onderhoud

### Vraag

Er staan ontwikkel- en feedbackbestanden in de Core. Bepalen wat daarvan nodig blijft en wat naar archief kan.

### Te bekijken

- `feedback_2_improve/`
- `analyse_response/`
- oude of dubbele editorbestanden
- oude termen zoals LCB waar LWE bedoeld wordt
- ongebruikte scripts of documentatie

### Voorzichtigheid

Niet zomaar verwijderen. Sommige bestanden zijn bronmateriaal voor ontwerpbeslissingen of veiligheidskeuzes.

### Acceptatiecriteria

- Lijst met bestanden: behouden / archiveren / verwijderen.
- Geen bestand verwijderen zonder expliciet akkoord.
- Geen runtimebestand verwijderen dat installer of manual nog gebruikt.

### Testnotitie

Nog te testen.

---

## 3. Import Oude Website

Status: in onderzoek  
Complexiteit: hoog  
Risico: middel  
Impact: hoog  
Type: migratie

### Huidige situatie

In de LWE Core is het fundamentele mechanisme voor import en rebuild van een website al aanwezig:

```txt
project-input/oude-website/
```

Deze map is bedoeld om bestaande HTML, afbeeldingen en bronmateriaal aan te bieden. Daarna zorgen de SAG-instructies ervoor dat de AI weet hoe hij dat bronmateriaal moet interpreteren, terwijl intake -> proposal -> approval -> build bepaalt wanneer hij daadwerkelijk een nieuw LWE-project mag bouwen.

### Wat nog ontbreekt

Er is nog geen geautomatiseerde importscanner.

Mogelijke toekomstige functie:

```bash
npm run lwe:import-site
```

Die zou bijvoorbeeld maken:

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
- redirects of oude URL's
- mogelijke contentblokken
- verdachte of verouderde tekst

### Eerste test

Stop een echte bestaande `_site/` of HTML-export in:

```txt
project-input/oude-website/
```

Laat een AI daarna met alleen de huidige LWE/SAG-regels inventariseren wat hij vindt. Dat is een interessante test van het SAG-principe voordat we automatisering bouwen.

### Acceptatiecriteria Voor Later

- Importscanner wijzigt geen websitebestanden.
- Scanner schrijft alleen inventarisatie naar `project-input/`.
- Scanner benoemt onzekerheden in plaats van aannames te maken.
- AI moet daarna alsnog voorstel + akkoord vragen.

### Testnotitie

Nog te testen met een echte oude site.

---

## 4. Prototype-Tekst Vervangen

Status: in onderzoek  
Complexiteit: laag  
Risico: laag  
Impact: laag  
Type: documentatie

### Probleem

In teksten staat nog regelmatig `prototype`, terwijl LWE al meer is dan alleen een experiment.

### Voorgestelde aanpak

Zoeken naar:

```txt
prototype
proof of concept
demo
```

Daarna per geval bepalen:

- klopt `prototype` nog inhoudelijk?
- moet dit `Core`, `starter`, `hulpmiddel`, `lokale editor` of `workflow guard` worden?
- gaat het bewust over een demo?

### Acceptatiecriteria

- Geen onbedoelde `prototype`-taal in gebruikersdocumentatie.
- Demo-content blijft wel herkenbaar als demo waar dat nodig is.

### Testnotitie

Nog te testen met `rg -n -i "prototype|proof of concept"`.

---

## 5. Improved `lcb-context`

Status: klaar basisversie  
Complexiteit: middel  
Risico: laag  
Impact: middel  
Type: workflow

### Doel

De SAG-context effectiever en scherper maken, zodat AI's minder hoeven te raden en consistenter reageren.

### Voorstel

Verbeter liever bestaande contextbestanden dan dubbele versies zoals `06-seo-basis02.md` te maken.

### Te verbeteren onderwerpen

- SEO en metadata
- Content/System onderscheid
- meertalige route-relaties
- beeldselectie
- publicatiecheck
- bestaande-site migratie
- AI de-escalatie bij guard-blocks

### Acceptatiecriteria

- Geen dubbele of tegenstrijdige contextbestanden.
- AI-instructies blijven kort genoeg om gelezen te worden.
- Nieuwe regels zijn concreet en testbaar.

### Testnotitie

Basisregels verwerkt in `LCB-AI-INSTRUCTIES.md` en `lcb-context/`. Getest via migraties van bestaande 11ty-sites en nieuwe demo/Core-runs. Verdere aanscherping blijft mogelijk per echte migratiecase.

---

## 6. SEO-Bestanden

Status: open  
Complexiteit: middel  
Risico: laag  
Impact: middel  
Type: feature

### Probleem

Op dit moment worden de volgende bestanden niet standaard aangemaakt of meegenomen:

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
- Meertalige routes uit `src/_data/routes.json` moeten in sitemap komen.
- `robots.txt` moet niet per ongeluk belangrijke pagina's blokkeren.
- Bij ontbrekende echte domeinnaam liever `https://www.example.nl` laten staan en als waarschuwing melden.

### Acceptatiecriteria

- Build maakt `/sitemap.xml`.
- Build maakt `/robots.txt`.
- Meertalige pagina's staan correct in sitemap.
- `lwe:next` waarschuwt als `siteUrl` nog demo/example is.

### Testnotitie

Nog te testen.

---

## 7. `.htaccess` / Redirects

Status: in onderzoek  
Complexiteit: middel  
Risico: middel  
Impact: middel  
Type: migratie

### Vraag

Bij bestaande websites kunnen oude URL's moeten doorverwijzen naar nieuwe URL's.

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
- handmatige lijst met oude belangrijke URL's

### Voorzichtigheid

Redirects zijn hosting-afhankelijk. Apache `.htaccess` is niet overal bruikbaar.

### Acceptatiecriteria

- LWE maakt geen automatische redirects zonder review.
- AI geeft een redirectvoorstel.
- Gebruiker bevestigt hostingtype.
- Output is geschikt voor Apache, Netlify, Vercel of handmatige hostingmethode.

### Testnotitie

Nog te testen.

---

## 8. `lwe:update` Voor Bestaande Projecten

Status: klaar release 0.2.15  
Complexiteit: hoog  
Risico: middel  
Impact: hoog  
Type: workflow

### Doel

Bestaande LWE-projecten veilig kunnen bijwerken naar een nieuwe Core-versie, zonder websitecontent, projectinput of lokale processtatus kwijt te raken.

### Huidige noodroute

Nu kan dit al grof via:

```bash
node install-lcb.js ../Mijn_Website_Project --mode existing --force
```

Maar dat is te grof voor normale gebruikers. Een aparte update-flow moet rustiger en veiliger zijn.

### Gewenst commando

Vanuit `LWE_Core_02`:

```bash
npm run lwe:update ../Mijn_Website_Project
```

Of rechtstreeks:

```bash
node scripts/lwe-update.js ../Mijn_Website_Project
```

### Wat `lwe:update` wel mag bijwerken

- `lcb/`
- `lcb-server.js`
- `scripts/lwe-next.js`
- `scripts/lwe-approve-build.js`
- `scripts/lwe-reset.js`
- `scripts/lwe-publish-check.js`
- `scripts/lwe-rules.js`
- `LCB-AI-INSTRUCTIES.md`
- `AI_START_HERE.md`
- `MANUAL.md`
- `MANUAL.en.md`
- `MANUAL.de.md`
- `lcb-context/`
- ontbrekende npm scripts in `package.json`
- veilige aanvullingen in `lcb.config.json`

### Wat `lwe:update` niet mag overschrijven

- `src/`
- `src/_data/`
- `project-input/`
- `lwe-process/state.json`
- `_site/`
- `node_modules/`
- `.env`
- bestaande websitecontent
- bestaande afbeeldingen/documenten van de gebruiker

### Veilige update-flow

1. Controleer of de doelmap bestaat.
2. Controleer of het doel een LWE-project lijkt:
   - `package.json`
   - `lcb.config.json`
   - `lwe-process/`
   - `project-input/`
3. Toon eerst een updateplan:
   - welke bestanden worden vervangen;
   - welke bestanden worden behouden;
   - welke package scripts worden toegevoegd/aangepast.
4. Maak automatisch een backup van te vervangen LWE-runtimebestanden, bijvoorbeeld:

```txt
.lwe-backups/2026-09-02-1430/
```

5. Kopieer alleen LWE-runtime, manuals en context.
6. Migreer `package.json` zonder bestaande projectscripts onnodig te verwijderen.
7. Migreer `lcb.config.json` voorzichtig:
   - bestaande waarden behouden;
   - ontbrekende nieuwe defaults aanvullen.
8. Laat `lwe-process/state.json` bestaan en pas die niet rechtstreeks aan.
9. Draai of adviseer daarna:

```bash
npm install
npm run lwe:next
npm run lwe:publish-check
```

### Dry-run

Standaard zou `lwe:update` eerst een dry-run tonen:

```bash
npm run lwe:update ../Mijn_Website_Project
```

Output:

```txt
LWE UPDATE PLAN
- replace: lcb-server.js
- replace: lcb/editor.js
- replace: scripts/lwe-next.js
- keep: src/
- keep: src/_data/
- keep: project-input/
- keep: lwe-process/state.json
- add script: lwe:publish-check

Voer uit met:
npm run lwe:update ../Mijn_Website_Project -- --apply
```

Daarna pas echt uitvoeren met:

```bash
npm run lwe:update ../Mijn_Website_Project -- --apply
```

### Belangrijke guard-regel

Een AI mag `lwe:update` niet stil uitvoeren op een productieproject. De AI mag het updateplan maken of laten zien, maar de gebruiker moet expliciet akkoord geven voordat `--apply` gebruikt wordt.

### Waarom dit nodig is

LWE krijgt waarschijnlijk vaker Core-updates dan een gewone website. Denk aan:

- strengere guards;
- betere intakecontrole;
- betere editorveiligheid;
- betere manual;
- nieuwe contextregels;
- publish-checks;
- bugfixes in de lokale server.

Die updates moeten naar bestaande projecten kunnen zonder dat een gebruiker bang hoeft te zijn dat zijn websitecontent of intakebestanden verdwijnen.

### Acceptatiecriteria

- Dry-run toont exact wat verandert.
- Zonder `--apply` wordt niets geschreven.
- Met `--apply` wordt eerst een backup gemaakt.
- `src/`, `src/_data/`, `project-input/`, `_site/` en `lwe-process/state.json` blijven behouden.
- Nieuwe scripts en context worden bijgewerkt.
- `package.json` krijgt ontbrekende LWE-scripts.
- Na update werken `npm run lwe:next`, `npm run lwe:publish-check` en `npm run lcb`.

### Testnotitie

Basisversie geimplementeerd als `scripts/lwe-update.js` en gekoppeld aan `npm run lwe:update`.

Getest:

- Dry-run op tijdelijk bestaand LWE-project toont replaces/adds zonder te schrijven.
- `--apply` maakt backup in `.lwe-backups/`.
- `src/_data/content.json` bleef byte-for-byte gelijk.
- `lwe-process/state.json` bleef byte-for-byte gelijk.
- `lwe-process/version.json` werd bijgewerkt naar de actuele Core-runtime.
- Dry-run en apply op oud 11ty-project zonder LWE voegen runtime/proceslaag toe zonder `src/` aan te passen.
- Tool meldt expliciet als project nog niet JSON-ready lijkt.


---

## 9. Tekstblokken En Lijsten Als 1 Editveld

Status: klaar  
Complexiteit: middel  
Risico: laag  
Impact: hoog  
Type: editor

### Probleem

Lange artikelen en simpele lijsten werden te vaak opgeknipt in losse kleine editvelden. Dat maakt beheer onrustig: een gebruiker kan dan wel tekst aanpassen, maar niet prettig alinea's of lijstregels toevoegen/verwijderen.

### Oplossing

LWE ondersteunt nu twee simpele filters:

- `paragraphs`: multiline tekst wordt gerenderd als meerdere alinea's.
- `lines`: multiline tekst wordt gerenderd als meerdere lijstregels.

Geen rich text editor, geen HTML-invoer en geen `safe` nodig voor normale content.

### Acceptatiecriteria

- Een artikel kan als een logisch tekstblok worden bewerkt.
- `Enter` in LWE blijft gewone tekstinvoer.
- Templates bepalen of de regels als alinea's of als `<li>` worden getoond.
- Escaping blijft standaard actief.

### Testnotitie

Toegepast en getest in bestaande sites voor artikelblokken, introblokken en simpele lijsten. Save triggert een reload wanneer `data-edit-render` is gebruikt, zodat de HTML direct opnieuw uit de tekst wordt opgebouwd.

---

## 10. Kalender Verlopen Events Client-Side

Status: klaar  
Complexiteit: middel  
Risico: laag  
Impact: hoog  
Type: feature

### Probleem

Een statische website zou niet opnieuw gebouwd hoeven worden alleen omdat een eventdatum voorbij is. De eventdata moet bovendien in JSON blijven staan.

### Oplossing

LWE levert een publieke kalender-helper mee die verlopen events in de browser kan verbergen op basis van machineleesbare datums:

```html
<div data-calendar-event data-event-start="2026-09-05" data-event-end="2026-09-05">
```

De zichtbare datum mag gewoon Europees/Nederlands blijven, bijvoorbeeld `5 september 2026`; de machine-datum blijft ISO `YYYY-MM-DD`.

### Acceptatiecriteria

- Verlopen events verdwijnen zonder rebuild/upload.
- Eventdata blijft in JSON staan.
- De intake vraagt of een evenementenkalender nodig is en of verlopen events automatisch verborgen moeten worden.

### Testnotitie

Opgenomen in Core en toegepast in bestaande sites met kalender/evenementenoverzichten.

---

## 11. `__lcb` Demo/Root Routes

Status: klaar  
Complexiteit: laag  
Risico: laag  
Impact: middel  
Type: bugfix

### Probleem

Als `startPath` naar `/manual/` wijst, werd een link naar `/` in edit-modus weer naar de startpagina gestuurd. Daardoor was de demo/homepage niet goed bereikbaar vanuit `__lcb`.

### Oplossing

Er zijn expliciete editor-routes toegevoegd:

```txt
/__lcb/_demo/
/__lcb/_root/
```

Daarnaast zet de editor links naar `/` om naar `rootEditPath`, zodat de homepage/demo bereikbaar blijft in edit-modus.

### Acceptatiecriteria

- `__lcb/` mag de ingestelde startpagina blijven openen.
- De demo is expliciet bereikbaar via `__lcb/_demo/`.
- De site-root is expliciet bereikbaar via `__lcb/_root/`.
- Interne links naar `/` vallen niet terug naar de manual.

### Testnotitie

Getest met preview-only server: `__lcb/_demo/`, `__lcb/manual/` en `__lcb/_root/` gaven `200`.

---

## 12. LCB/LWE Editorlabels Vertalen

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

### Testnotitie

Nog te testen.


---

## 13. Image Replacement Functie

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
2. Toon huidig pad, alt-tekst en eventueel caption.
3. Kies een bestaande afbeelding uit project-assets of upload naar een veilige projectmap.
4. Update alleen het toegestane JSON-veld.
5. Bouw opnieuw en toon preview.

### Acceptatiecriteria

- Werkt alleen met toegestane assetmappen.
- Geen path traversal mogelijk.
- Alt-tekst blijft verplicht of wordt actief gevraagd.
- Geen bestanden overschrijven zonder bevestiging.

### Testnotitie

Nog te testen.


# Update via Github

Development: LWE_Core update via GitHub Releases

LWE_Core wordt centraal gepubliceerd via GitHub Releases. Projectomgevingen worden niet meer vanuit een lokale LWE_Core-map bijgewerkt, maar kunnen zelfstandig controleren of een nieuwe Core-versie beschikbaar is.

Werking:

* Elk project registreert de geïnstalleerde LWE_Core-versie.
* LWE controleert GitHub op de laatste stabiele release.
* Bij een nieuwere versie krijgt de gebruiker een update-optie.
* De release wordt gedownload en lokaal geïnstalleerd.
* Updates komen uitsluitend uit een expliciet Core-manifest met bestanden die door LWE_Core beheerd mogen worden.
* Projectspecifieke bestanden, configuratie en content mogen nooit automatisch worden overschreven.
* Alleen gepubliceerde releases worden gebruikt; nooit rechtstreeks main.
* Versie en changelog worden in de LWE-interface getoond.
* LWE blijft na installatie/update volledig lokaal functioneren.

Doel: LWE_Core behandelen als een zelfstandig, versiebeheerd softwareproduct waarbij iedere projectomgeving veilig en gecontroleerd kan worden bijgewerkt zonder afhankelijkheid van een lokale centrale Core-map.

Status: eerste basis geimplementeerd in releasepad na 0.2.29.

Toegevoegd:

* `lwe-release-manifest.json` als expliciete lijst van LWE-managed bestanden.
* `npm run lwe:update-check` voor controle op de nieuwste stabiele GitHub Release.
* `npm run lwe:update-install -- --apply` voor expliciete installatie met release-manifest en backup.
* VS Code Control knoppen voor update controleren en update installeren.
* Lokale `lwe:update` blijft bestaan als ontwikkel/fallback-route.

Nog nodig voor echte release:

* `lwe-update.config.json` of `package.json.repository` vullen met de officiele GitHub repository.
* GitHub Release maken met `lwe-release-manifest.json` in de release.
* Changelog per release consequent invullen.
