# Project input

Zet hier alles wat als bronmateriaal voor een website gebruikt mag worden.

Deze map is bedoeld voor de gebruiker en voor AI. Een AI moet deze map inventariseren voordat hij een websitevoorstel of contentstructuur maakt.


## Website en editor starten

Vanuit de projectroot begin je met:

```bash
npm install
npm run lwe:next
```

Volg daarna de LWE-output: intake controleren, voorstel laten maken, akkoord geven en pas daarna bouwen/starten.

Na akkoord en build gebruik je:

```bash
npm run lcb
```

Wil je alleen snel kijken naar een bestaande `_site/` zonder te bouwen, dan kan:

```bash
npm run lcb:preview-only
```

Deze modus is read-only. Opslaan in de editor is uitgeschakeld.

Daarna zie je:

```txt
Normale website: http://127.0.0.1:8082/
Website editor:  http://127.0.0.1:8082/__lcb/
```

Let op: `npx @11ty/eleventy --serve` start alleen de gewone 11ty-preview en meestal op `http://localhost:8080/`. Dat is niet de Local Website Editor.

## Aanbevolen indeling

```txt
project-input/
  website-intake.json
  teksten/
  afbeeldingen/
  documenten/
  oude-website/
  online-bronnen.md
  notities.md
```

## Website-intake

Vul `website-intake.json` voordat een AI een nieuwe website ontwerpt of bouwt. Dit bestand is de vaste intakeplek in het LWE-proces.

Dit bestand legt de basisvoorkeuren vast:

- projectnaam, type website en doel
- wat een bezoeker uiteindelijk moet doen
- doelgroep
- taalkeuze
- kleurvoorkeur
- lettertypen en bestaande huisstijlrichtlijnen
- gewenste uitstraling
- voorbeeldsites en dingen die je juist niet wilt
- gewenste pagina's
- gewenste functionaliteit zoals contactformulier, zoeken, agenda, nieuws, inschrijven, meertaligheid en downloads
- logo- en beeldstatus
- social media accounts en voorkeur voor volgen/delen
- privacy, cookies, voorwaarden, toegankelijkheid en verantwoordelijkheid voor aangeleverde teksten/foto's
- hoeveel creatieve vrijheid de AI krijgt

Als je iets niet weet, schrijf dan bewust `ik weet het niet, verras me`. Dat telt als antwoord. Leeg laten betekent dat `npm run lwe:next` het als ontbrekende intake ziet.

Niet elk juridisch of organisatorisch punt is voor elk project nodig. Vul dan bewust `niet nodig` of `niet relevant` in, zodat de AI weet dat het bekeken is.

De intake mag kort. Het doel is niet om de gebruiker moe te maken, maar om te voorkomen dat de AI ongemerkt taal, stijl, functionaliteit of juridische keuzes verzint. Een AI hoort maximaal 1 ontbrekende intakevraag per reactie te stellen.

Een AI bewaart ook extra nuance uit het intakegesprek. Past die nuance in een veld van `website-intake.json`, dan komt hij daar. Past hij nergens goed, zet hem dan onder `## Intake gesprek` in `notities.md`.

## Wat zet je hierin?

Voorbeelden:

- losse teksten
- Word/PDF documenten
- afbeeldingen en logo's
- screenshots
- exports van oude websites
- HTML-bestanden van oude pagina's
- lijst met online bronnen
- notities over doelgroep, stijl, menu of gewenste pagina's
- extra nuance uit gesprekken met de AI

## Online bronnen

Zet URL's die gebruikt mogen worden in `online-bronnen.md`.

Voorbeeld:

```md
# Online bronnen

- https://www.voorbeeld.nl/
- https://www.voorbeeld.nl/over-ons/
- https://www.voorbeeld.nl/contact/
```

Een AI mag online bronnen alleen gebruiken als de gebruiker dat expliciet vraagt of als de taak duidelijk gaat over het herbouwen/inventariseren van een bestaande online website.

## Belangrijk

Bronmateriaal is niet automatisch websitecontent. Demo- of placeholder-content uit de starter is ook geen echte websitecontent en moet bij een echt project worden vervangen of verwijderd.

Bij afbeeldingen hoort de AI eerst te inventariseren en daarna bewust te kiezen. Personenfoto's en screenshots mogen pas worden gebruikt na expliciet akkoord. Noteer beeldkeuzes of redenen om beelden niet te gebruiken in `website-intake.json` onder `assets.imageSelectionNotes`, `assets.peoplePhotoApproval` en `assets.screenshotApproval`.

De AI moet eerst inventariseren:

- welke informatie bruikbaar is
- welke informatie dubbel is
- welke informatie verouderd lijkt
- welke afbeeldingen bij welke onderwerpen horen
- wat er zichtbaar op logo's en afbeeldingen staat
- of een logo de merknaam al bevat
- welke informatie naar JSON moet
- welke informatie System is of buiten scope valt

Daarna doet de AI eerst een voorstel en vraagt akkoord voordat hij gaat bouwen.

## Publiceren

Upload normaal alleen de inhoud van `_site/` naar je hostingprovider, niet de hele projectmap. Controleer dit eerst met:

```bash
npm run lwe:publish-check
```
