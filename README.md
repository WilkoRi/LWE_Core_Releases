# LWE_Core_02

`LWE_Core_02` is de Core-map met het prototype- en installerpakket voor de Local Website Editor.

Voor een rustige beginnersuitleg en naslag: lees eerst [`MANUAL.md`](MANUAL.md).
De manual is ook beschikbaar in [`MANUAL.en.md`](MANUAL.en.md) en [`MANUAL.de.md`](MANUAL.de.md).

## Eerst Dit

Ben je in `LWE_Core_02`? Bouw hier dan geen echte website.
Dit is de Core: de basis waarmee je steeds opnieuw nieuwe LWE-websites kunt maken.

Kies eerst wat je wilt doen: een nieuwe website maken, of werken in een bestaande websiteprojectmap.
Een websiteproject heet dus niet `LWE_Core_XX`.

## Nieuwe Website Maken

Maak eerst een aparte projectmap:

```bash
node install-lcb.js ../Mijn_Website_Project --mode new
```

Open daarna die nieuwe projectmap in VS Code. Vanaf daar werk je verder als in een websiteproject.

## Werken In Een Websiteproject

Zet eerst je teksten, afbeeldingen en documenten in `project-input/`.

Ben je in een websiteproject, bijvoorbeeld `Mijn_Website_Project`? Start dan alleen met:

```bash
npm install
npm run lwe:next
```

`npm run lwe:next` start geen interactieve wizard in de terminal. Het toont de volgende processtap voor jou en Copilot.

Geef de volgende tekst aan je ai:


----------------------------------------

Gebruik deze LWE:next output als process engine status.

De huidige status is:
- Phase: intake
- intakeComplete: false
- nextIntakeQuestion: projectnaam of werknaam
- edit_files, build_site, rewrite_content en create_pages zijn geblokkeerd

Lees eerst de LWE-context en project-input.
Stel mij daarna alleen deze ene intakevraag:
projectnaam of werknaam

Pas geen websitebestanden aan.

------------------------------------






```txt
Gebruik de output van npm run lwe:next als LWE process engine status.
Stel maximaal 1 intakevraag.
Pas geen websitebestanden aan.
```

Copilot stelt daarna steeds 1 intakevraag. Na een complete intake maakt de AI een voorstel en vraagt expliciet: `Zal ik beginnen?`

Pas na jouw akkoord draai jij zelf:

```bash
npm run lwe:approve
npm run build
npm run lcb
```

Laat een AI-assistent `npm run lwe:approve` niet namens jou uitvoeren. Dat commando is de menselijke akkoordknop.

Wil je na akkoord toch terug naar het voorstel of de intake, gebruik dan:

```bash
npm run lwe:unapprove
npm run lwe:reset
```

De website en editor staan dan op:

```txt
Start hier: http://127.0.0.1:8082/manual/
Demo:       http://127.0.0.1:8082/
Editor:     http://127.0.0.1:8082/__lcb/
```

## AI-proces starten

Voor AI-gestuurd bouwen start je altijd met:

```bash
npm run lwe:next
```

Dit commando geeft de actuele fase, allowed/blocked actions en de verplichte volgende AI-reactie. De terminaloutput is de expliciete AI/Copilot-handshake: LWE laat zien dat de process engine meekijkt, acties blokkeert waar nodig en de AI eerst om akkoord laat vragen voordat er gebouwd wordt.

De vaste volgorde voor een nieuwe website is:

1. Intake invullen in `project-input/website-intake.json`.
2. `npm run lwe:next` draaien.
3. AI laat een voorstel zien en vraagt: `Zal ik beginnen?`
4. Pas na akkoord zet je de buildfase open met `npm run lwe:approve`.
5. Daarna pas mogen `npm run build` en `npm run lcb`.

De intake hoeft geen roman te zijn. Korte antwoorden zoals `nee`, `niet nodig`, `onbekend` of `ik weet het niet, verras me` zijn geldig zolang ze bewust zijn ingevuld. Een AI hoort de intake rustig op te bouwen en maximaal 1 ontbrekende intakevraag per reactie te stellen.

Na het bouwen gebruikt `lwe:next` dezelfde intake ook als reviewcheck. De AI moet kunnen aanwijzen waar kleuren, logo, social media, pagina's en CTA uit de intake zichtbaar zijn verwerkt, of expliciet melden waarom iets bewust niet is toegepast.

Nieuwe geinstalleerde projecten krijgen een harde build guard: `npm run build` stopt zolang intake incompleet is, de fase niet `build` is of `userApprovedBuild` nog niet op `true` staat.

`npm run lwe:next` bewaart ook een baseline van beschermde websitebestanden. Als `src/`, templates, styles, scripts of configuratie wijzigen terwijl de fase nog geen edits toestaat, meldt LWE dat als execution audit violation.

`npm run lwe:next` controleert ook het navigatiecontract. Als `content.nav` bijvoorbeeld `slug` gebruikt maar `src/_includes/nav.njk` nog `item.href` rendert, moet de AI eerst de navigatie herstellen voordat build/review klaar is.

Bij meertalige meerpagina-sites controleert `npm run lwe:next` ook of er taalroute-relaties zijn, bijvoorbeeld in `src/_data/routes.json`. Daardoor moet een taalselector naar dezelfde pagina in een andere taal linken, niet standaard terug naar de homepage.

`npm run lwe:next` controleert ook beeldselectie. Als `project-input` eigen afbeeldingen bevat, moet de AI die bewust gebruiken of uitleggen waarom niet. Personenfoto's, screenshots, placeholders en afbeeldingen zonder alt-tekst leveren een warning of build-stop op.

`npm run lwe:next` controleert ook Content versus System. Verdachte publieke tekst zoals migratienotities, placeholdertekst, TODO's of interne AI/redactietekst moet eerst worden opgelost of expliciet besproken. Bezoekerstekst hoort zoveel mogelijk in JSON met een `data-edit-path`; technische wrappertekst blijft System.

Als je `LWE GUARD BLOCKED` ziet, is dat meestal geen codefout. Het is een bewuste processtop. Stop dan met bouwen, lees de reden in de terminal en kies de-escalatie: intake aanvullen, voorstel laten maken, `npm run lwe:approve` draaien na akkoord, of ongeautoriseerde wijzigingen herstellen.

In de buildfase is het resultaat pas aangeleverd als de AI:

- `npm run build` heeft gedraaid
- `npm run lcb` heeft gestart
- voor publicatie `npm run lwe:publish-check` noemt als controle
- de URL's toont:
  - Website: `http://127.0.0.1:8082/`
  - Editor: `http://127.0.0.1:8082/__lcb/`
- de preview in VS Code opent of aanbiedt als dat beschikbaar is
- de gebruiker om review vraagt

Voor visuele tests van een bestaande `_site/` zonder build is er een read-only modus:

```bash
npm run lcb:preview-only
```

Deze modus omzeilt geen buildproces voor productie: hij bouwt niet en opslaan in de editor is uitgeschakeld.

## Starten

Start de Local Website Editor met:

```bash
npm install
npm run lcb
```

De normale website draait dan op `http://127.0.0.1:8082/`.
De Local Website Editor draait op `http://127.0.0.1:8082/__lcb/`.

`npm run dev` doet in dit demo-project hetzelfde als `npm run lcb`.

`lcb` blijft de technische afkorting in bestandsnamen, scripts en routes. De productnaam in documentatie en interface is **Local Website Editor**.

Let op: als je zelf `npx @11ty/eleventy --serve` draait, start je alleen de gewone 11ty-preview. Eleventy gebruikt dan standaard `http://localhost:8080/`. Dat is niet de Local Website Editor-server en heeft dus geen `/__lcb/` editorroute.

Voor alleen een gewone 11ty-preview op poort 8082 kun je gebruiken:

```bash
npm run serve:11ty
```

Als de Local Website Editor niet start, controleer dan eerst:

- gebruik je `npm run lcb` en niet `npx @11ty/eleventy --serve`?
- is poort `8082` al bezet?

Tijdelijk een andere poort gebruiken kan zo:

```bash
PORT=8083 npm run lcb
```

## Wat zit in deze map?

Deze map is tegelijk:

- een demo-site in `src/`
- een installerpakket voor andere 11ty-projecten

De overdraagbare Local Website Editor-laag bestaat uit:

- `install-lcb.js`
- `server.js`
- `lcb/`
- `lcb.config.json`
- `LCB-AI-INSTRUCTIES.md`
- `MANUAL.md`
- `lcb-context/`
- `project-input/`
- `lwe-process/version.json`

De LWE-versie staat bewust op een vaste plek:

```txt
lwe-process/version.json
```

Daarin zie je welke Core-versie en runtime-versie in dit project staan. Dat wordt straks belangrijk voor veilige updates van bestaande projecten.

De demo-site is alleen bedoeld om de werking te testen. Bij een echt project moet demo- of placeholder-content worden vervangen of verwijderd.

## Bronmateriaal verzamelen

Gebruik `project-input/` als vaste map voor alles wat je voor een website wilt gebruiken:

- `project-input/teksten/`
- `project-input/afbeeldingen/`
- `project-input/documenten/`
- `project-input/oude-website/`
- `project-input/website-intake.json`
- `project-input/online-bronnen.md`
- `project-input/notities.md`

Een AI moet deze map eerst inventariseren voordat hij een websitevoorstel of contentmodel maakt. `project-input/website-intake.json` is de vaste plek voor de intake. `npm run lwe:next` controleert of die intake is ingevuld. `ik weet het niet, verras me` is daarbij een geldige voorkeur; leeg laten niet.

## Opzet

- Alle beheerbare websitecontent staat in `src/_data/content.json`.
- De pagina wordt gegenereerd vanuit `src/index.njk`.
- Elk bewerkbaar element krijgt `data-edit-file` en `data-edit-path`.
- De taalvarianten staan per element bij elkaar: `nl`, `en` en `de`.
- `server.js` serveert de normale site schoon op `/`.
- Alleen op `/__lcb/` injecteert `server.js` de editor-toolbar, editor-CSS en editor-JS.
- Wijzigingen worden teruggeschreven naar JSON via `POST /api/save`.

## Wat we in deze versie niet doen

- afbeeldingen vervangen of uploaden via de editor
- rich text bewerken
- links beheren
- blokken toevoegen, verwijderen of herordenen
- automatische refresh na opslaan

## AI-context

Voor AI-ondersteund bouwen staan de afspraken in:

- `LCB-AI-INSTRUCTIES.md`
- `lcb-context/00-sag-gebruik.md`
- `lcb-context/01-content-structuur.md`
- `lcb-context/02-template-regels.md`
- `lcb-context/03-project-afspraken.md`
- `lcb-context/04-bouwkader-11ty-lcb-bootstrap.md`
- `lcb-context/05-installatieproces.md`
- `lcb-context/06-seo-basis.md`
- `lcb-context/07-bronmateriaal.md`
- `lcb-context/08-project-start-checklist.md`

Dit is de SAG-laag: Static Augmented Generation. Geen extra RAG-techniek in de editor, maar een vaste, gecontroleerde context die een AI moet lezen voordat hij pagina's of content toevoegt. Dat is sneller en eenvoudiger dan echte retrieval, terwijl de AI nog steeds relevante informatie uit aangeleverde projectbestanden kan gebruiken. De AI moet expliciet teruggeven welke context hij gelezen heeft en eerst akkoord vragen voordat hij grote structuurwijzigingen doet.

## Installeren in andere projecten

Zie `INSTALLER.md`.

Kort:

```bash
node install-lcb.js ../nieuwe-site --mode new
node install-lcb.js ../bestaande-11ty-site --mode existing
```

Het installatieproces voor AI staat ook beschreven in `lcb-context/05-installatieproces.md`.

Bij bestaande projecten geldt: installatie maakt de Local Website Editor beschikbaar, maar bestaande pagina's zijn pas bewerkbaar nadat hun content is omgezet naar JSON en de templates correcte `data-edit-path` attributen hebben.

## Bestaande Projecten Updaten

Gebruik voor bestaande LWE-projecten liever de update-tool dan `install-lcb.js --force`.

### Update Via GitHub Releases

De gewenste standaard is: LWE Core wordt als stabiele GitHub Release gepubliceerd. Een project controleert dan zelf of er een nieuwere release is:

```bash
npm run lwe:update-check
```

Installeren gebeurt alleen na akkoord:

```bash
npm run lwe:update-install -- --apply
```

Dit gebruikt alleen gepubliceerde releases, nooit rechtstreeks `main`. De release moet een `lwe-release-manifest.json` bevatten met de bestanden die LWE mag beheren. Projectcontent, `project-input/`, projectspecifieke CSS, templates, `.htaccess`, `_site/`, `node_modules/` en `lwe-process/state.json` mogen niet automatisch worden overschreven.

`_site/` mag in Core bestaan als demo/manual-output, maar is nooit onderdeel van een automatische update naar een bestaand project.

Zolang er nog geen GitHub-repository in `lwe-update.config.json` of `package.json` staat, meldt `lwe:update-check` hoe je die koppeling instelt.

### Lokale Update Vanuit Core

De lokale update blijft beschikbaar als fallback tijdens ontwikkeling.

Eerst alleen kijken wat er zou gebeuren:

```bash
npm run lwe:update -- ../Mijn_Website_Project
```

Pas na akkoord uitvoeren:

```bash
npm run lwe:update -- ../Mijn_Website_Project --apply
```

Deze update:

- werkt LWE-runtime, scripts, manuals en `lcb-context/` bij;
- maakt eerst een backup van bestanden die vervangen worden;
- behoudt `src/`, `src/_data/`, `project-input/`, `_site/` en `lwe-process/state.json`;
- toont de huidige en nieuwe runtimeversie uit `lwe-process/version.json`;
- migreert websitecontent niet automatisch naar JSON.

Voor een oud 11ty-project dat nog niet JSON-ready is, voegt `lwe:update` dus wel de LWE-proceslaag toe, maar de inhoud moet daarna apart worden gemigreerd met intake, voorstel en akkoord.

Na een update kan `npm run lcb` bewust blokkeren door de nieuwe guard. Dat betekent meestal dat intake, akkoord, taalroutes of andere proceschecks nog niet klaar zijn. Wil je alleen kijken naar de bestaande `_site`, gebruik dan:

```bash
npm run lcb:preview-only
```

Snelle controlevraag voor een AI:

```txt
Lees LCB-AI-INSTRUCTIES.md en de bestanden in lcb-context/.
Maak een nieuwe meertalige 11ty-pagina met drie kaarten in een array.
Lever de JSON en de volledige template op.
Controleer expliciet dat currentLang bestaat, dat arrays met loops worden gerenderd, dat elk data-edit-path exact in JSON bestaat en dat de pagina SEO-title, meta description, canonical, Open Graph en hreflang bevat.
```

Voorbeeld:

```json
{
  "title": {
    "nl": "Bewerk content direct op de pagina.",
    "en": "Edit content directly on the page.",
    "de": "Inhalte direkt auf der Seite bearbeiten."
  }
}
```

De edit-modus werkt nu als eerste proef:

1. Start `npm run lcb`.
2. Open `http://127.0.0.1:8082/__lcb/`.
3. Zet bovenin de `Local Website Editor` aan.
4. Klik op een tekst.
5. Pas de tekst aan en klik `Opslaan`.

De wijziging wordt opgeslagen in `src/_data/content.json` en 11ty bouwt daarna opnieuw.
