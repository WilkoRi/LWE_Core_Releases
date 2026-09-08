# LWE Core AI-instructies

Deze instructie is bedoeld voor een AI die pagina's, templates of content maakt voor de Local Website Editor.

De Local Website Editor is een lokale editorlaag om websitecontent te beheren, geen extern CMS en geen volledige inline design-editor.

`LWE_Core_02` is de Core-map met de overdraagbare bronbestanden. `lcb` blijft voorlopig de technische afkorting in bestandsnamen, scripts en routes.

## AI process engine

Begin een AI-taak in een LWE-project met:

```bash
npm run lwe:next
```

De output van dit commando is leidend voor de huidige fase. Gebruik hem als AI/Copilot-handshake: LWE toont dat de process engine meekijkt, allowed/blocked actions doorgeeft en de AI niet vrij laat bouwen zonder fasecontrole. Respecteer `Allowed actions` en `Blocked actions`. Als de fase `intake` of `proposal` is, pas je nog geen websitebestanden aan en vraag je eerst akkoord via het verplichte overlegmoment.

De vaste volgorde is: intakeformulier invullen, `lwe:next` controleren, voorstel geven, akkoord vragen, gebruiker draait zelf `npm run lwe:approve`, daarna pas bouwen. `lwe:next` is geen interactieve terminalwizard; de output vertelt welke ene intakevraag de AI nu moet stellen. Vraag bij ontbrekende intake maximaal 1 vraag per AI-reactie, zodat de gebruiker niet de hele vragenlijst in een keer krijgt.

Een AI mag `npm run lwe:approve` nooit namens de gebruiker uitvoeren. Dat commando is de menselijke akkoordknop. De AI mag de gebruiker erop wijzen dat dit de volgende stap is, maar de gebruiker moet het zelf draaien.

Als de gebruiker terug wil naar voorstel of intake, gebruik je de LWE-commando's `npm run lwe:unapprove` of `npm run lwe:reset`. Bewerk `lwe-process/state.json` nooit rechtstreeks.

Lees ook `lcb-context/09-mag-niet.md`. Die lijst is bindend voor proces, publiceren en risicovolle codepatronen. Als een patroon zoals `| safe`, `innerHTML`, `dangerouslySetInnerHTML`, `eval()` of `new Function()` toch nodig lijkt, stop dan eerst en leg uit waarom het veilig is.

In geinstalleerde projecten blokkeert de build guard `npm run build` zolang de intake niet compleet is, de fase niet `build` is of `userApprovedBuild` niet `true` is. Probeer die guard niet te omzeilen door direct `eleventy` te draaien.

`lwe:next` voert ook een execution audit uit. Als beschermde websitebestanden veranderen terwijl `edit_files` geblokkeerd is, moet de AI stoppen, de overtreding melden en geen verdere edits doen totdat de gebruiker beslist of de wijzigingen worden teruggedraaid of alsnog via `npm run lwe:approve` worden toegestaan.

`lwe:next` voert ook een Content/System-audit uit. Verdachte publieke tekst zoals migratienotities, placeholdertekst, TODO's of interne AI/redactietekst moet je omzetten naar gewone bezoekerstekst, verplaatsen naar notities of expliciet met de gebruiker bespreken. Harde publieke tekst zonder `data-edit-path` moet je beoordelen: is het System of hoort het in JSON? Bewuste systemtekst in templates mag je markeren met `data-lwe-system`.

Bij `LWE GUARD BLOCKED` behandel je de melding niet als codefout. Het is een processtop. Je probeert de guard niet te repareren of te omzeilen. Je informeert de gebruiker kort, toont de reden, en vraagt welke de-escalatie gewenst is: intake aanvullen, voorstel maken, akkoord geven met `npm run lwe:approve`, of ongeautoriseerde wijzigingen herstellen.

In de buildfase lever je pas op nadat je `npm run build` hebt gedraaid, `npm run lcb` hebt gestart, de Website URL en Editor URL hebt getoond, een VS Code preview hebt geopend of aangeboden als dat kan, en de gebruiker om review hebt gevraagd. Voor publicatie wijs je op `npm run lwe:publish-check`.

Gebruik `npm run lcb:preview-only` alleen voor een read-only visuele inspectie van een bestaande `_site/`. Deze modus bouwt niet en mag niet worden gepresenteerd als productie-build of als vervanging voor de LWE guard.

Voor updates van bestaande projecten gebruik je vanuit de Core eerst `npm run lwe:update -- ../Projectnaam` als dry-run. De AI mag het plan uitleggen, maar mag `--apply` niet stil uitvoeren op een productieproject. De gebruiker moet expliciet akkoord geven. Een update mag `src/`, `src/_data/`, `project-input/`, `_site/` en `lwe-process/state.json` niet overschrijven.

## Doel

De website blijft een normale 11ty-site. De Local Website Editor is alleen een lokale editlaag op `/__lcb/`.

De AI moet daarom altijd deze scheiding bewaren:

- `_site` is de schone website-output.
- `src/_data/*.json` is de bron voor beheerbare websitecontent.
- `src/**/*.njk` toont de content en voegt edit-paden toe.
- De Local Website Editor-interface zelf staat niet in de content-JSON.
- SEO is onderdeel van het standaard bouwproces.
- Bronmateriaal staat in `project-input/`.

Nieuwe projecten gebruiken JSON als contentbron. Bij bestaande 11ty-sites mag LWE tijdelijk ook simpele `_data/*.js` of `_data/*.cjs` object-exports beheren als migratiebrug. Zet geen functies, berekeningen of comments in zo'n bewerkbaar JS-datafile; na opslaan schrijft LWE het terug als gewone `module.exports = {...}` data.

## Demo versus installerpakket

De map `LWE_Core_02` bevat twee dingen:

- een demo-site in `src/`
- een installerpakket voor andere 11ty-projecten

De overdraagbare Local Website Editor-laag bestaat uit:

- `install-lcb.js`
- `server.js`
- `lcb/`
- `lcb.config.json`
- `LCB-AI-INSTRUCTIES.md`
- `lcb-context/`

De demo-site bewijst de werking. Bij een echt project moet demo- of placeholder-content bewust worden vervangen of verwijderd. Bij installatie in een ander project is de bestaande site pas bewerkbaar nadat de content aan het Local Website Editor-contract voldoet.

## Bronmateriaal

Gebruik `project-input/` als vaste verzamelmap voor materiaal dat de AI mag gebruiken.

Voorbeelden:

- `project-input/teksten/`
- `project-input/afbeeldingen/`
- `project-input/documenten/`
- `project-input/oude-website/`
- `project-input/website-intake.json`
- `project-input/online-bronnen.md`
- `project-input/notities.md`

Een AI moet deze map inventariseren voordat hij een websitevoorstel, contentmodel of template maakt. De AI controleert ook `project-input/website-intake.json`; ontbrekende voorkeuren voor doel, bezoekersactie, taal, kleur, stijl, doelgroep, pagina's, functionaliteit, kalender/events, social media en verantwoordelijkheid moeten eerst worden uitgevraagd. Als de gebruiker geen voorkeur heeft, noteert de AI bewust `ik weet het niet, verras me`; dat telt als geldig antwoord. Niet-relevante juridische of organisatorische punten worden bewust als `niet nodig` of `niet relevant` genoteerd. De AI moet ook afbeeldingen inspecteren voordat hij ze inhoudelijk gebruikt. Bij logo's controleert de AI expliciet of de merknaam al in het beeld staat, zodat die niet dubbel naast het logo wordt geplaatst.

Tijdens de intake bewaart de AI ook extra nuance uit het gesprek. Relevante details gaan in een passend veld van `project-input/website-intake.json`. Als er geen passend veld is, schrijft de AI de nuance onder `## Intake gesprek` in `project-input/notities.md`. De AI mag niet alleen het gevraagde veld vullen als het antwoord extra bruikbare context bevat.

Na het bouwen moet de AI aantonen waar belangrijke intakepunten zichtbaar zijn verwerkt. Minimaal: kleurvoorkeur, logo, social media, gewenste pagina's en CTA/bezoekersactie. Als iets bewust niet is toegepast, zegt de AI waarom en vraagt hij akkoord.

Bronmateriaal is nog geen websitecontent. De AI bepaalt eerst wat bruikbaar, dubbel, verouderd, Content, System of buiten scope is.

## Beeldselectie

Als `project-input` afbeeldingen bevat, inventariseert de AI eerst de bestanden en kiest daarna bewust welke beelden geschikt zijn. De AI noemt per gekozen afbeelding het bestandsnaam, de plek op de website en de reden.

- Gebruik geen placeholder-, demo- of stockbeelden als de gebruiker eigen beelden heeft aangeleverd, tenzij de gebruiker dat expliciet goedkeurt.
- Gebruik personenfoto's alleen met expliciet akkoord. Noteer dat akkoord in `assets.peoplePhotoApproval`.
- Gebruik screenshots alleen met expliciet akkoord. Noteer dat akkoord in `assets.screenshotApproval`.
- Als er wel afbeeldingen zijn maar geen enkele geschikt is, noteer de reden in `assets.imageSelectionNotes`.
- Elke informatieve afbeelding krijgt een betekenisvolle alt-tekst.
- Een logo blijft een logo: behoud aspect ratio en forceer het niet naar een vierkant formaat.

Als `npm run lwe:next` een asset selection warning geeft, repareer je eerst de beeldkeuze, alt-tekst of approval-notitie voordat je de site als klaar oplevert.

## Navigatiecontract

`content.nav` en het navigatie-template moeten hetzelfde data-contract gebruiken.

- Als `content.nav` items `href` bevatten, gebruikt `nav.njk` `item.href`.
- Als `content.nav` items `slug` bevatten, berekent `nav.njk` de URL uit `item.slug` en de huidige taal.
- Zet geen Nunjucks-templatecode zoals `{% if ... %}` of `{{ ... }}` in `content.json`.
- Desktopmenu, mobiel menu en taalselector gebruiken dezelfde URL-logica.

Als `npm run lwe:next` een navigation contract warning geeft, repareer je eerst `content.nav` of `nav.njk` voordat je de site als klaar oplevert.

## Meertalige route-relaties

Een meertalige website met meerdere pagina's heeft een route-relatiebestand nodig, bij voorkeur `src/_data/routes.json`.

```json
{
  "defaultLanguage": "nl",
  "pages": {
    "home": {
      "nl": "/",
      "en": "/en/"
    },
    "concept": {
      "nl": "/het-concept/",
      "en": "/en/concept/"
    }
  }
}
```

Elke pagina-template krijgt een vaste `pageKey` in de front matter. De taalselector, canonical URL en `hreflang` links gebruiken daarna `routes.pages[pageKey]`. Daardoor blijft een bezoeker bij taalwissel op dezelfde pagina-identiteit en schiet de site niet terug naar de homepage.

Als je pagina's toevoegt, verwijdert of hernoemt, werk je ook `routes.json` bij.

## Taalkeuze

Meertaligheid is een projectkeuze, geen automatische aanname. De AI vraagt of bevestigt vooraf of het project single-language of multi-language wordt.

Als het project meertalig is, moet de site ook een zichtbare taalkeuze hebben. Alleen meerdere taalpagina's bouwen is niet genoeg. Bij meertaligheid horen ook taalroutes, canonical URL's, hreflang links en SEO-content per taal.

## Contentstructuur

Beheerbare websitecontent wordt per element opgeslagen. Een tekstveld is meertalig wanneer het project meertalig is en heeft dan altijd dezelfde taalkeys.

```json
{
  "title": {
    "nl": "Nederlandse tekst",
    "en": "English text",
    "de": "Deutscher Text"
  }
}
```

Gebruik bij meertalige projecten deze taalkeys, tenzij de gebruiker expliciet anders kiest:

- `nl`
- `en`
- `de`

Bij meertalige projecten is de hoofdtaal leidend, tenzij de gebruiker expliciet anders afspreekt. In Nederlandstalige projecten is dat meestal `nl`. Vertalingen mogen dus niet stil extra onderwerpen toevoegen of onderwerpen weglaten ten opzichte van de hoofdtaal. Als bestaande vertalingen al afwijken, benoem je dat eerst en vraag je akkoord voordat je die afwijking behoudt.

Voor bestaande meertalige websites mag de datastructuur per taal verschillen als dat nodig is voor migratie, maar de inhoudelijke structuur volgt standaard de hoofdtaal. Gebruik taal-eigen contentstructuur, bijvoorbeeld `pages.home.nl.sections` en `pages.home.en.sections`, alleen om migratie praktisch te houden of expliciet goedgekeurde taalverschillen te ondersteunen. Navigatie, footer, contactgegevens en vaste CTA's kunnen meestal gedeelde velden met taalkeys gebruiken.

De taalroute-relatie blijft altijd apart geregeld. `routes.pages` of bij bestaande root-level sites `site.pages` bepaalt welke NL-, EN- en DE-route bij dezelfde pagina-identiteit hoort. Daardoor blijft taalwissel op dezelfde pagina, ook als de inhoud per taal niet exact gelijk is.

## Content versus System

Niet alle zichtbare tekst is automatisch beheerbare content.

Gebruik deze regel:

> Alles wat niet expliciet `System` is, behandel je als content.

`Content` betekent:

- tekst die een beheerder inhoudelijk wil kunnen aanpassen
- SEO-velden zoals title, description en social preview tekst
- pagina-inhoud
- koppen
- alinea's
- knopteksten
- menu-labels
- footer-tekst
- nieuws, kalenderitems, tarieven, diensten, events en herhalende blokken

## Platte Lijsten

Voor eenvoudige `<ul>` of `<ol>` lijsten zonder eigen links, knoppen, datums, bedragen of andere metadata mag je een multiline tekstveld gebruiken.

Voorbeeld:

```njk
<ul>
  {% for item in block.itemsText | t(lang) | lines %}
    <li>{{ item }}</li>
  {% endfor %}
</ul>
```

De gebruiker bewerkt dan een tekstblok waarbij elke `Enter` een nieuw list-item wordt. Lege regels worden overgeslagen. Gebruik dit niet voor complexe lijsten; houd die als array/objecten in JSON.

## Artikelblokken

Voor meerdere opeenvolgende alinea's die samen één logisch artikel vormen, gebruik je één multiline tekstveld en de `paragraphs` filter:

```njk
{% for paragraph in block.articleText | t(lang) | paragraphs %}
  <p>{{ paragraph }}</p>
{% endfor %}
```

De gebruiker bewerkt dan één tekstblok. Een nieuwe regel of witregel wordt als nieuwe alinea gerenderd. Gebruik geen HTML-invoer en geen `safe` voor normale content.

## Kalender En Events

Vraag bij intake expliciet of er een evenementenkalender nodig is en of verlopen events automatisch verborgen moeten worden.

Als verlopen events op gewone statische hosting automatisch verborgen moeten worden, gebruik dan de publieke kalender-helper:

```html
<script src="/assets/system-calendar.js" defer></script>
```

Render kalenderitems met datum-attributen:

```njk
<article
  data-calendar-event
  data-event-start="{{ event.startDate }}"
  data-event-end="{{ event.endDate }}"
>
  ...
</article>
```

De browser verbergt verlopen items dan automatisch zonder rebuild/upload. De data blijft in JSON staan.

De standaard 11ty-filter `upcomingEvents` is ook beschikbaar, maar is build-time filtering. Gebruik die alleen als het project bewust dagelijks of regelmatig opnieuw bouwt:

```njk
{% set visibleEvents = events | upcomingEvents %}
```

Gebruik bij voorkeur simpele datumvelden in JSON:

```json
{
  "title": "Clubrace 1",
  "startDate": "2027-01-09",
  "endDate": "2027-01-10",
  "showUntil": "",
  "hidden": false
}
```

Een event blijft zichtbaar tot en met de laatste eventdatum en verdwijnt pas de dag erna. Verwijder oude events niet automatisch uit JSON; filter alleen de publieke weergave. Wil de gebruiker een archief, toon dezelfde data zonder kalender-hide.

`System` betekent:

- Local Website Editor-interface-tekst
- technische meldingen
- vaste taalbuttons zoals `NL`, `EN`, `DE`
- puur technische labels of voorbeelden zoals `data-edit-path`
- automatische nummering zoals `1`, `2`, `3`
- aria-labels die alleen voor toegankelijkheid of structuur dienen
- vaste merk/logo-tekst als de gebruiker die niet via de Local Website Editor wil beheren

Als iets `System` is:

- zet er geen `data-edit-path` op
- behandel het niet als verplicht contentveld
- documenteer of benoem waarom het System is als dat onduidelijk kan zijn

Als iets geen `System` is, moet het uit JSON komen en bewerkbaar zijn.

Voor bestaande sites geldt dezelfde regel, maar de migratie mag gefaseerd gebeuren. Begin met gedeelde en veelgebruikte onderdelen zoals navigatie, footer, events, tarieven, openingstijden, lessen en CTA's. Daarna migreer je pagina-body's per pagina of per sectie. Laat `npm run lwe:next` de resterende harde teksten tonen en behandel die lijst als migratie-backlog, niet als excuus om bezoekerstekst permanent hardcoded te laten.

Links behandel je als gecombineerde content: de zichtbare linktekst en, als de URL beheerbaar moet zijn, ook de linkbestemming. Gebruik `data-edit-path` voor de tekst en `data-edit-href-path` voor de `href`. Gebruik `data-edit-href-file` als de URL in een ander contentbestand staat. In `/__lcb/` opent een klik op een bewerkbare link de editor-drawer; zet editmodus uit om de link echt te openen.

Voor veilige tekst-attributen, zoals `alt` op afbeeldingen, gebruik je `data-edit-attribute="alt"` naast `data-edit-path`. Zet geen gewoon tekst-editpad op een afbeelding zonder attribuutmarkering; dan kan de editor niet weten dat hij het `alt`-attribuut moet aanpassen.

## Paginamodel

Zet pagina-content onder `pages`.

```json
{
  "pages": {
    "home": {
      "hero": {
        "title": {
          "nl": "Bewerk content direct op de pagina.",
          "en": "Edit content directly on the page.",
          "de": "Inhalte direkt auf der Seite bearbeiten."
        }
      }
    }
  }
}
```

Gebruik duidelijke bloknamen:

- `seo`
- `hero`
- `intro`
- `sections`
- `cards`
- `cta`
- `footer`

## Herhalende onderdelen

Voor kaarten, stappen, menu-items of nieuwsblokken mag een array gebruikt worden.

```json
{
  "blocks": [
    {
      "title": {
        "nl": "Tekst per element",
        "en": "Text per element",
        "de": "Text pro Element"
      },
      "body": {
        "nl": "Elke tekst heeft een eigen pad.",
        "en": "Every text has its own path.",
        "de": "Jeder Text hat einen eigenen Pfad."
      }
    }
  ]
}
```

Belangrijk: verander de volgorde van arrays alleen bewust, want het edit-pad gebruikt de index.

## Navigatie, layout en footer

Gebruik altijd gedeelde layout-onderdelen:

- een centraal navigatiecomponent, bij voorkeur `src/_includes/nav.njk`
- een centrale footer, bij voorkeur `src/_includes/footer.njk`
- geen losse menu's per pagina
- geen footer per pagina kopieren

Bij meertalige sites bevat het navigatiecomponent ook de taalkeuze.

De layout moet een sticky footer ondersteunen: bij weinig pagina-content blijft de footer onderaan het viewport staan. Gebruik daarvoor in CSS minimaal `body { min-height: 100vh; display: flex; flex-direction: column; }` en `main { flex: 1 0 auto; }`.

## Template-regel

Elk bewerkbaar HTML-element krijgt:

```html
data-edit-file="content.json"
data-edit-path="pages.home.hero.title.nl"
```

Het pad moet exact wijzen naar het JSON-veld dat de tekst levert.

Voor een meertalige template gebruik je de actuele taal:

```njk
<h1
  data-edit-file="content.json"
  data-edit-path="pages.home.hero.title.{{ currentLang.code }}"
>
  {{ content.pages.home.hero.title | t(currentLang.code) }}
</h1>
```

## Verplichte meertalige pagina-opzet

Elke pagina die `currentLang.code` gebruikt moet zelf de Eleventy pagination bevatten. Neem deze structuur over voor elke nieuwe pagina.

Voor `src/over-ons.njk`:

```njk
---
pagination:
  data: content.languages
  size: 1
  alias: currentLang
pageKey: about
permalink: "{% if currentLang.code == 'nl' %}/over-ons/{% else %}/{{ currentLang.code }}/over-ons/{% endif %}"
---
{% set pageRoutes = routes.pages[pageKey] %}
{% set currentPath = pageRoutes[currentLang.code] %}
```

Zonder deze front matter bestaat `currentLang` niet en werkt de template niet.

De URL-structuur is:

- Nederlands: `/pagina/`
- Engels: `/en/pagina/`
- Duits: `/de/pagina/`

## Arrays renderen

Gebruik bij herhalende onderdelen in de template standaard een loop. Hardcode geen losse array-indexen zoals `[0]` en `[1]`, tenzij daar een expliciete reden voor is.

Goed:

```njk
{% for card in content.pages.home.cards %}
  <article>
    <h2
      data-edit-file="content.json"
      data-edit-path="pages.home.cards.{{ loop.index0 }}.title.{{ currentLang.code }}"
    >
      {{ card.title | t(currentLang.code) }}
    </h2>
    <p
      data-edit-file="content.json"
      data-edit-path="pages.home.cards.{{ loop.index0 }}.body.{{ currentLang.code }}"
    >
      {{ card.body | t(currentLang.code) }}
    </p>
  </article>
{% endfor %}
```

Niet goed:

```njk
{{ content.pages.home.cards[0].title | t(currentLang.code) }}
{{ content.pages.home.cards[1].title | t(currentLang.code) }}
```

Een loop zorgt dat nieuwe items uit JSON vanzelf zichtbaar worden.

## Wat niet in JSON hoeft

Zet dit niet in de content-JSON:

- Local Website Editor-toolbar teksten
- editor-knoppen
- technische foutmeldingen
- puur structurele HTML
- CSS-klassen
- template-logica

Die horen bij de tool of de template, niet bij de website-content.

Dit zijn `System` teksten.

## AI werkwijze

Als een AI een nieuwe pagina toevoegt:

1. Lees en benoem eerst welke LWE-contextbestanden gebruikt zijn.
2. Bepaal of het project single-language of multi-language is.
3. Controleer of demo- of placeholder-content vervangen moet worden.
4. Bepaal eerst de paginastructuur.
5. Bepaal welke zichtbare teksten `Content` zijn en welke expliciet `System` zijn.
6. Bepaal welke SEO-velden nodig zijn.
7. Voeg alle Content en SEO-content toe aan `src/_data/content.json`.
8. Voeg voor elke Content-tekst taalkeys toe als het project meertalig is.
9. Maak daarna pas de 11ty-template.
10. Voeg de verplichte meertalige front matter toe als het project meertalig is.
11. Render elke Content-tekst uit JSON.
12. Render SEO-tags uit JSON.
13. Gebruik loops voor arrays.
14. Voeg op elk bewerkbaar Content-element `data-edit-file` en `data-edit-path` toe.
15. Controleer dat elk `data-edit-path` exact bestaat in JSON.
16. Controleer dat de normale URL schoon blijft en de Local Website Editor URL bewerkbaar is.

## Verplicht overlegmoment

Een AI mag niet meteen grote structuurwijzigingen uitvoeren.

Na het lezen van de Local Website Editor-regels, projectcontext en bestaande bestanden geeft de AI eerst een kort voorstel:

```txt
Ik heb deze LWE-context gelezen:
- ...

Ik begrijp dat dit project wordt gebouwd met:
- 11ty
- Bootstrap
- JSON-content
- Local Website Editor

Taalkeuze:
- single-language / multi-language
- bij multi-language voeg ik een zichtbare taalkeuze toe

Demo/placeholder-content:
- ik vervang of verwijder demo-content voordat dit een echte website wordt

Navigatie en footer:
- ik gebruik een centraal nav-component
- ik gebruik een centrale footer
- ik zorg dat de footer onderaan blijft bij weinig content

Ik ga nu deze onderdelen aanpassen:
- ...
- ...

Ik behandel deze zichtbare teksten als Content:
- ...

Ik behandel deze zichtbare teksten als System:
- ...

Ik neem deze SEO-onderdelen mee:
- title
- meta description
- canonical
- Open Graph
- hreflang indien meertalig

Ik heb dit bronmateriaal gevonden:
- ...

Ik heb deze afbeeldingen gecontroleerd:
- ...

Daarna pas maak ik JSON en templates. Zal ik beginnen?
```

Pas na akkoord van de gebruiker begint de AI met bouwen of omzetten.

## Zelfcontrole voor AI-output

Controleer je eigen antwoord voordat je het geeft:

- Is duidelijk welke zichtbare teksten Content zijn en welke System zijn?
- Staat er geen beheerbare Content hardcoded in de template?
- Heeft elke Content-tekst in JSON de keys `nl`, `en` en `de`, tenzij het project niet meertalig is?
- Is vooraf duidelijk of het project single-language of multi-language is?
- Heeft een meertalige site een zichtbare taalkeuze?
- Heeft elke nieuwe meertalige pagina de Eleventy pagination met `currentLang`?
- Kloppen alle permalinks voor NL, EN en DE?
- Worden arrays met een `{% for %}` loop gerenderd?
- Gebruiken array-items `loop.index0` in het `data-edit-path`?
- Bestaat elk `data-edit-path` letterlijk in de JSON?
- Staat er geen Local Website Editor-toolbar, editorpaneel of editor-JavaScript in de normale template?
- Wordt de Local Website Editor-interface alleen lokaal op `/__lcb/` verwacht?
- Heeft de gebruiker akkoord gegeven op het voorstel voordat je echt gaat bouwen?
- Is demo- of placeholder-content vervangen of bewust behouden als demo?
- Gebruikt de site een centraal navigatiecomponent en centrale footer?
- Blijft de footer onderaan staan bij weinig content?
- Zijn logo's en afbeeldingen inhoudelijk gecontroleerd voordat ze geplaatst zijn?
- Heeft elke pagina een SEO-title en meta description uit JSON?
- Heeft elke pagina canonical en Open Graph metadata?
- Heeft een meertalige pagina `hreflang` links?

## SAG

SAG betekent hier: Static Augmented Generation.

Voor dit prototype is geen zware RAG nodig. LWE gebruikt een kleine statische contextmap met projectregels. Bij echte RAG haalt een systeem dynamisch relevante informatie op uit een grotere kennisbron. Bij SAG ligt een bewust gekozen deel van de informatie alvast klaar, zodat de AI snel en controleerbaar dezelfde basis leest.

Een AI mag daarnaast relevante informatie ophalen uit de aangeleverde projectbestanden of bronnen, maar LWE hoeft daarvoor geen aparte vector-database of RAG-model te gebruiken.

Aanbevolen:

```txt
lcb-context/
  00-sag-gebruik.md
  01-content-structuur.md
  02-template-regels.md
  03-project-afspraken.md
  04-bouwkader-11ty-lcb-bootstrap.md
  05-installatieproces.md
  06-seo-basis.md
  07-bronmateriaal.md
  08-project-start-checklist.md
```

Een AI leest deze bestanden voordat hij nieuwe content of templates maakt. Zo blijft de output consistent zonder dat de Local Website Editor zelf ingewikkelder wordt.
