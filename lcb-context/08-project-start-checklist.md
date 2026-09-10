# Projectstart-checklist

Deze checklist is bedoeld voor een AI die met LWE Core een echte website bouwt of een bestaande 11ty-site omzet.

## Eerst lezen, dan bouwen

De AI leest eerst:

- `LCB-AI-INSTRUCTIES.md`
- alle bestanden in `lcb-context/`
- vooral ook `lcb-context/09-mag-niet.md`
- `project-input/README.md`
- `project-input/website-intake.json`
- alle relevante bestanden in `project-input/`
- bestaande templates, data en assets als het project al een site bevat

Daarna geeft de AI expliciet terug welke context hij gelezen heeft.

`npm run lwe:next` controleert of `project-input/website-intake.json` compleet genoeg is voor een nieuwe website. Dit bestand is de vaste intakeplek in het LWE-proces. Ontbrekende antwoorden worden uitgevraagd voordat de AI ontwerpt. `ik weet het niet, verras me` is een geldig antwoord; lege velden zijn dat niet.

De intake mag kort worden ingevuld met bewuste antwoorden zoals `nee`, `niet nodig`, `niet relevant`, `onbekend` of `ik weet het niet, verras me`. De AI stelt maximaal 1 ontbrekende intakevraag per reactie.

De AI bewaart extra nuance uit intake-antwoorden. Past de nuance in `website-intake.json`, dan wordt die daar opgeslagen. Past die nergens goed, dan komt die onder `## Intake gesprek` in `project-input/notities.md`.

Na akkoord draait de gebruiker zelf `npm run lwe:approve`. De AI voert dit commando niet namens de gebruiker uit. Pas daarna staat de build guard `npm run build` en `npm run lcb` toe. Een AI mag deze guard niet omzeilen door direct buildtools te starten.

Als de gebruiker terug wil, gebruik dan `npm run lwe:unapprove` voor terug naar voorstel of `npm run lwe:reset` voor terug naar intake. Bewerk `lwe-process/state.json` niet met de hand.

`npm run lwe:next` bewaart en controleert een baseline van beschermde websitebestanden. Als `src/`, templates, styles, scripts of configuratie wijzigen terwijl edits geblokkeerd zijn, is dat een execution audit violation.

Bij `LWE GUARD BLOCKED` stopt de AI. Dit is geen codefout maar een processtop. De AI informeert de gebruiker en vraagt om de-escalatie: intake aanvullen, voorstel maken, akkoord geven via `npm run lwe:approve`, of ongeautoriseerde wijzigingen herstellen.

## Build opleveren

In de buildfase is de AI pas klaar wanneer dit is gedaan:

- `npm run build`
- `npm run lcb`
- Website URL getoond: `http://127.0.0.1:8082/`
- Editor URL getoond: `http://127.0.0.1:8082/__lcb/`
- VS Code preview geopend of aangeboden als dat beschikbaar is
- gebruiker om review gevraagd

## Demo-data opruimen

De starter bevat voorbeeldcontent. Die is alleen bedoeld om te laten zien hoe de Local Website Editor werkt.

Bij een echt project moet de AI controleren:

- welke teksten nog demo of placeholder zijn
- welke demo-afbeeldingen nog aanwezig zijn
- welke SEO-velden nog voorbeeldwaarden bevatten
- welke links nog naar voorbeeld-URL's wijzen

Demo- of placeholder-content mag niet ongemerkt in de echte website blijven staan.

## Taalkeuze

De AI vraagt of bevestigt vooraf:

- wordt dit project single-language?
- wordt dit project multi-language?
- welke talen zijn nodig?

Als het project meertalig is, moet de website een zichtbare taalselector hebben. Alleen meerdere taalpagina's bouwen is niet genoeg.

Bij een meertalige website met meerdere pagina's moet `src/_data/routes.json` of een gelijkwaardige `content.routes.pages` bestaan. De taalselector gebruikt de route-relatie van de huidige `pageKey`, zodat taalwissel naar dezelfde pagina in de andere taal gaat en niet automatisch naar de homepage.

## Navigatie en footer

Gebruik vaste gedeelde onderdelen:

- `src/_includes/nav.njk` of een vergelijkbaar centraal navigatiecomponent
- `src/_includes/footer.njk` of een vergelijkbare centrale footer

Maak geen losse menu's per pagina. Kopieer geen footer per pagina.

Controleer dat `content.nav` en het navigatiecomponent hetzelfde data-contract gebruiken:

- `href` in JSON betekent `item.href` in het template.
- `slug` in JSON betekent dat het template URL's uit `item.slug` en `currentLang` berekent.
- Nunjucks-templatecode hoort niet in `content.json`.
- Desktopmenu en mobiel menu gebruiken dezelfde linklogica.

Gebruik bij productie- of migratiesites een navigatiecontract:

- bestand: `project-input/navigation-contract.json`
- menu-zones zoals `primary`, `topbar`, `footer` en `quickLinks` mogen apart worden vastgelegd
- quick links zijn ook een menu-zone: een beheerbare verzameling links naar pagina's of externe hrefs
- het contract mag alleen na expliciet akkoord worden aangepast
- controleer met `npm run lwe:nav-check`
- `npm run lwe:publish-check` voert de navigatiecheck automatisch uit als het contract bestaat

Nieuwe LWE-projecten gebruiken bij voorkeur standaard `lwe-page-menu-seo-v1`.

Per intern menu-item is dan minimaal vastgelegd:

- `key`: stabiele interne identiteit, verandert niet door tekst of URL
- `slug`: URL-deel per taal
- `label`: zichtbare menutekst per taal
- `seo.title`: unieke SEO-titel per taal
- `seo.description`: unieke SEO-omschrijving per taal

Gebruik `pageKey` alleen als het menu-item bewust verwijst naar een centrale pagina-definitie elders in de data, bijvoorbeeld `pages.contact`. Voor bestaande projecten blijven `slug`, `key` en `pageKey` ondersteund.

De footer moet onderaan blijven staan bij pagina's met weinig content.

## Afbeeldingen en logo's

De AI inspecteert afbeeldingen voordat hij ze gebruikt.

Controleer bij elke afbeelding:

- wat staat erop?
- bij welk onderwerp past deze afbeelding?
- is het een logo, sfeerbeeld, inhoudelijke foto of social preview?
- welke alt-tekst is nodig?

Selectieregels:

- noem per gekozen afbeelding bestandsnaam, plek en reden
- gebruik geen placeholder/demo/stockbeeld als er eigen beelden zijn aangeleverd zonder expliciet akkoord
- gebruik personenfoto's alleen met expliciet akkoord in `assets.peoplePhotoApproval`
- gebruik screenshots alleen met expliciet akkoord in `assets.screenshotApproval`
- noteer in `assets.imageSelectionNotes` als aangeleverde beelden bewust niet worden gebruikt
- behoud bij logo's de aspect ratio
- gebruik `npm run lwe:images` om veilige webversies te plannen voordat grote foto's worden gebruikt
- schrijf verwerkte afbeeldingen alleen met `npm run lwe:images -- --apply` als het plan klopt
- overschrijf nooit originele afbeeldingen in `project-input/afbeeldingen/`
- crop niet automatisch; overleg eerst als een uitsnede echt nodig is

Controleer bij logo's extra:

- staat de merknaam al in het beeld?
- zo ja, plaats de merknaam niet nogmaals naast het logo, tenzij de gebruiker dat vraagt
- is het logo daarna ook echt zichtbaar gebruikt in navigatie, footer of hero?
- vraag na build expliciet of het logo goed wordt getoond op desktop en mobiel
- vraag bij logo-problemen of vooral hoogte, breedte, witruimte of plaatsing aangepast moet worden

## Intake zichtbaar verwerken

Na het bouwen controleert de AI expliciet of belangrijke intakekeuzes zichtbaar zijn toegepast:

- kleurvoorkeuren uit `website-intake.json`
- logo of bewuste reden waarom het logo niet gebruikt is
- social media links of bewuste reden waarom ze niet gebruikt zijn
- gewenste pagina's en CTA

Als een intakepunt niet zichtbaar is verwerkt, meldt de AI dat als open punt en lost het op voordat review wordt gevraagd.

## SEO

Controleer per pagina minimaal:

- unieke title
- unieke meta description
- canonical URL
- Open Graph title, description en image
- Twitter card
- een duidelijke H1
- logische heading-volgorde
- alt-tekst voor inhoudelijke afbeeldingen
- hreflang bij meertalige sites

## Verplicht voorstel vooraf

Voordat de AI bouwt of grote structuur wijzigt, geeft hij dit terug:

```txt
Ik heb deze LWE-context gelezen:
- ...

Ik heb dit bronmateriaal gevonden:
- ...

Ik heb deze intake gecontroleerd:
- ingevuld: ...
- ontbreekt nog: ...
- bewuste open keuzes: ...
- extra nuance opgeslagen in intake of notities: ...

Ik heb deze functionaliteit gecontroleerd:
- contactformulier / zoeken / agenda / evenementenkalender / verlopen events automatisch verbergen / nieuws / inschrijven / meertaligheid / downloads

Ik heb deze social media gecontroleerd:
- accounts aanwezig / niet aanwezig / onbekend
- footerlinks, volg-CTA's of deelknoppen nodig

Ik heb deze juridische en organisatorische punten gecontroleerd:
- privacy / cookies / voorwaarden / toegankelijkheid / verantwoordelijkheid voor teksten en foto's

Ik stel deze taalopzet voor:
- ...

Ik ruim deze demo/placeholder-content op:
- ...

Ik gebruik deze vaste onderdelen:
- nav-component
- footercomponent
- sticky-footer layout

Ik behandel dit als Content:
- ...

Ik behandel dit als System:
- ...

Ik neem deze SEO-onderdelen mee:
- ...

Ik heb deze afbeeldingen gecontroleerd:
- ...

Ik heb deze intakepunten zichtbaar verwerkt:
- kleuren: ...
- logo: ...
- social media: ...
- CTA/bezoekersactie: ...

Zal ik beginnen?
```

Pas na akkoord van de gebruiker begint de AI met bouwen.
