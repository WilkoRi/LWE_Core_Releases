# Bouwkader voor 11ty + Local Website Editor + Bootstrap

Dit kader beschrijft de algemene werkwijze voor het bouwen en beheren van een website met 11ty, Local Website Editor en Bootstrap. Het is niet projectspecifiek.

## Uitgangspunt

We bouwen een gewone statische website met 11ty. De site wordt beheerd via Local Website Editor, maar de publieke output blijft schoon.

De basis is:

- 11ty voor templates, data en statische output.
- JSON als bron voor beheerbare websitecontent.
- Local Website Editor als lokale beheerlaag.
- Bootstrap voor snelle, herkenbare en responsive styling.
- SEO als standaard onderdeel van elke pagina.
- Eigen CSS alleen voor projectidentiteit en kleine verfijning.
- AI als bouwpartner, maar alleen binnen duidelijke project- en datastructuurregels.

## Bronmateriaal

Gebruik voor elk project een vaste map:

```txt
project-input/
```

Daarin verzamelt de gebruiker alles wat de AI mag gebruiken:

- teksten
- afbeeldingen
- documenten
- oude websitebestanden
- online bronnen
- projectnotities

Een AI inventariseert deze map voordat hij een informatiestructuur of pagina's maakt. Demo- of placeholder-content uit de starter wordt bij een echt project actief vervangen of verwijderd.

## Scheiding tussen website en beheer

Er zijn twee werelden:

- De normale website: `/`
- De lokale editor: `/__lcb/`

De normale website mag geen editor-toolbar, editorpaneel of editor-JavaScript bevatten.

De Local Website Editor mag lokaal extra interface injecteren, maar die hoort niet in de 11ty-output als websitecontent.

## Voorwaarde om de Local Website Editor te laten werken

De Local Website Editor werkt niet door alleen de server te installeren.

Een pagina wordt pas bewerkbaar als de content aan het Local Website Editor-contract voldoet:

- beheerbare Content-teksten staan in JSON
- templates renderen die JSON
- elk bewerkbaar element heeft `data-edit-file`
- elk bewerkbaar element heeft een exact `data-edit-path`
- het JSON-bestand staat in `lcb.config.json` bij `contentFiles`

Bij bestaande sites is installatie dus stap 1. Het omzetten van bestaande pagina's naar JSON + edit-paden is stap 2.

## Eerst structuur, dan vormgeving

Begin niet met losse pagina's maken. Begin met inventariseren.

1. Welke bestaande informatie staat in `project-input/`?
2. Welke onderwerpen zijn er?
3. Welke onderwerpen horen bij elkaar?
4. Welke informatie is dubbel, verouderd of onduidelijk verdeeld?
5. Welke pagina's zijn echt nodig?
6. Welke content moet automatisch uit data komen?
7. Welke onderdelen komen op de homepage terug als samenvatting?
8. Welke SEO-informatie is per pagina nodig?
9. Welke online bronnen mogen gebruikt worden?

Pas daarna worden menu, pagina's en templates gemaakt. Bij een nieuw echt project controleert de AI ook welke starter/demo-data nog aanwezig is en maakt hij een voorstel om die op te ruimen.

## Informatie-architectuur

Maak per website eerst een hoofdmenu. Elk menu-item moet een duidelijke verantwoordelijkheid hebben.

Voorbeelden van paginatypes:

- Home: samenvatting, eerstvolgende item, belangrijkste routes.
- Kalender: volledig data-overzicht.
- Overzichtspagina: korte introductie plus links naar detailpagina's of ankers.
- Detailpagina: uitgebreide uitleg over een specifiek onderwerp.
- Reglementen/documentatie: formele afspraken en downloads.
- Nieuws/blog: items onder elkaar, nieuwste bovenaan.
- Contact/locatie: praktische informatie en externe links.

Vermijd dat dezelfde uitleg verspreid staat over meerdere pagina's zonder duidelijke reden.

## Data-gedreven onderdelen

Gebruik JSON voor onderdelen die herhaald, gefilterd of automatisch getoond moeten worden.

Voorbeelden:

- kalenderitems
- nieuwsitems
- evenementen
- tarieven
- klassen/producten/diensten
- partners/sponsors
- downloads
- SEO metadata

Voor platte lijsten zonder eigen links, knoppen of losse velden mag je een multiline tekstveld gebruiken:

```njk
<ul>
  {% for item in block.itemsText | t(lang) | lines %}
    <li>{{ item }}</li>
  {% endfor %}
</ul>
```

De `lines` filter splitst op `Enter`, trimt regels en slaat lege regels over. Gebruik arrays van objecten zodra elk lijstitem eigen metadata heeft.

Voor meerdere opeenvolgende alinea's die samen één artikel vormen, gebruik je een multiline tekstveld met de `paragraphs` filter:

```njk
{% for paragraph in block.articleText | t(lang) | paragraphs %}
  <p>{{ paragraph }}</p>
{% endfor %}
```

De gebruiker bewerkt dan één artikeltekst. Een nieuwe regel of witregel wordt een nieuwe alinea; HTML blijft gewone tekst.

Als een item een startdatum en einddatum heeft, zet beide in JSON. Als de einddatum leeg is, geldt de startdatum als einddatum.

Voor kalenders geldt meestal:

- Toon op de homepage automatisch het eerstvolgende item.
- Toon op de kalenderpagina alle toekomstige items.
- Verberg items waarvan de einddatum voorbij is alleen als de intake dit vraagt.
- Geef categorieen of klassen een herkenbare visuele stijl.

Gebruik voor gewone statische hosting bij voorkeur de publieke kalender-helper:

```html
<script src="/assets/system-calendar.js" defer></script>
```

Render events dan met datum-attributen:

```njk
<article
  data-calendar-event
  data-event-start="{{ event.startDate }}"
  data-event-end="{{ event.endDate }}"
>
  ...
</article>
```

Dan verdwijnen verlopen events automatisch in de browser, zonder dat de beheerder opnieuw hoeft te builden of uploaden. De data blijft gewoon in JSON staan.

De server-side filter `upcomingEvents` blijft beschikbaar als build-time helper, bijvoorbeeld voor projecten met dagelijkse automatische rebuilds:

```njk
{% set visibleEvents = events | upcomingEvents %}
```

Een event blijft zichtbaar tot en met de laatste eventdatum. Bij een event met `endDate: "2027-01-10"` verdwijnt het dus pas vanaf `2027-01-11`. De filter en browser-helper verwijderen niets uit JSON; ze bepalen alleen wat de publieke website toont.

Let op bij LCB editpaden in gefilterde arrays: gebruik `event._lweIndex` als die beschikbaar is, niet `loop.index0`. Dan blijft het editpad naar de oorspronkelijke arraypositie wijzen.

Standaard eventvelden:

```json
{
  "title": "Clubrace 1",
  "startDate": "2027-01-09",
  "endDate": "2027-01-10",
  "showUntil": "",
  "hidden": false
}
```

`showUntil` is optioneel en gaat voor `endDate`, bijvoorbeeld als een evenement nog een extra dag zichtbaar moet blijven.

## Content in JSON

Alle beheerbare Content-teksten staan in JSON en worden door templates gerenderd.

Niet alle zichtbare tekst is automatisch Content. Gebruik het label `System` voor vaste interface-, structuur- of technische tekst die niet via de Local Website Editor beheerd hoeft te worden.

Hoofdregel:

> Alles wat niet expliciet `System` is, is `Content`.

Voorbeelden van Content:

- SEO-title en meta description
- pagina-koppen
- alinea's
- knopteksten
- menu-labels
- footer-tekst
- kalenderitems
- nieuwsitems
- tarieven

Voorbeelden van System:

- Local Website Editor-toolbar teksten
- vaste taalbuttons zoals `NL`, `EN`, `DE`
- automatische nummers
- aria-labels
- technische voorbeeldlabels zoals `data-edit-path`
- vaste merk/logo-tekst als de gebruiker die niet wil beheren

Een tekstveld is standaard:

```json
{
  "title": {
    "nl": "Nederlandse tekst",
    "en": "English text",
    "de": "Deutscher Text"
  }
}
```

Meertaligheid is optioneel per project. De AI mag dit niet stil aannemen: hij vraagt of bevestigt vooraf single-language of multi-language. Als een project niet meertalig is, mag dezelfde structuur simpeler zijn. Als meertaligheid later waarschijnlijk is, kies vanaf het begin voor taalvelden per element. Bij een meertalige site hoort altijd een zichtbare taalkeuze in het navigatiecomponent.

Belangrijk:

- Zet dezelfde content in principe maar een keer in JSON.
- Homepage-blokken mogen samenvattingen tonen van detailcontent.
- Lange uitleg hoort op detailpagina's.
- Knoppen en korte labels zijn Content, tenzij ze expliciet System zijn.

## Templates

Templates halen content op uit JSON en voegen editpaden toe. Gebruik gedeelde includes/layouts voor terugkerende onderdelen. Een website heeft in principe een centraal navigatiecomponent en een centrale footer; maak geen losse menu's of gekopieerde footers per pagina.

Elke bewerkbare tekst krijgt:

```html
data-edit-file="content.json"
data-edit-path="pages.home.hero.title.nl"
```

Bij meertalige pagina's moet de template `currentLang.code` beschikbaar maken met Eleventy pagination.

Templates renderen ook SEO uit JSON:

- `<title>`
- meta description
- canonical
- Open Graph
- Twitter card
- hreflang bij meertalige sites

Arrays worden met loops gerenderd. Gebruik `loop.index0` in het edit-pad.

Niet goed:

```njk
{{ content.pages.home.cards[0].title | t(currentLang.code) }}
```

Goed:

```njk
{% for card in content.pages.home.cards %}
  <h2 data-edit-file="content.json" data-edit-path="pages.home.cards.{{ loop.index0 }}.title.{{ currentLang.code }}">
    {{ card.title | t(currentLang.code) }}
  </h2>
{% endfor %}
```

## Bootstrap-aanpak

Gebruik Bootstrap als basis voor:

- grid
- containers
- spacing
- buttons
- cards
- navbar
- offcanvas mobiel menu
- forms
- tables
- badges

Gebruik project-CSS voor:

- kleuren
- typografie-accenten
- hero-beeld
- kleine componentvarianten
- herkenbaarheid van categorieen

Maak styling niet ingewikkelder dan nodig. Bootstrap moet het werk doen waar Bootstrap goed in is.

## Layoutbasis

Gebruik een layout waarbij de footer bij weinig content onderaan het scherm blijft staan. Een simpele basis is:

```css
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1 0 auto;
}
```

## Responsive en mobiel

De site moet vanaf het begin mobiel werken.

Basisregels:

- Gebruik Bootstrap breakpoints.
- Desktopmenu mag niet simpelweg in mobiel gepropt worden.
- Gebruik op mobiel een hamburger/offcanvas menu.
- Taalkeuze of belangrijke acties moeten zichtbaar en stabiel blijven. Bij multi-language is een taalselector verplicht.
- Tekst en knoppen mogen niet overlappen.
- Test minimaal mobiel en desktop.

## Assets en links

Gebruik bestaande afbeeldingen en documenten als die beschikbaar zijn.

Inventariseer eerst:

- welke afbeeldingen er in `project-input/afbeeldingen/` staan
- waar ze oorspronkelijk bij hoorden
- welke downloads/documenten er zijn
- welke externe links nodig zijn

Regels:

- Externe links openen in een nieuw tabblad.
- Afbeeldingen moeten inhoudelijk bij het onderwerp passen.
- Inspecteer logo's en afbeeldingen voordat je ze gebruikt.
- Noem per gekozen afbeelding de bestandsnaam, plek op de website en reden.
- Gebruik geen placeholder-, demo- of stockbeelden als de gebruiker eigen beelden heeft aangeleverd, tenzij dat expliciet is goedgekeurd.
- Gebruik personenfoto's alleen met expliciet akkoord en noteer dat in `assets.peoplePhotoApproval`.
- Gebruik screenshots alleen met expliciet akkoord en noteer dat in `assets.screenshotApproval`.
- Als aangeleverde afbeeldingen niet geschikt zijn, noteer de bewuste keuze in `assets.imageSelectionNotes`.
- Elke informatieve afbeelding krijgt een betekenisvolle alt-tekst.
- Als de merknaam al in een logo-afbeelding staat, plaats die naam niet nogmaals naast het logo tenzij de gebruiker dat vraagt.
- Maak aparte mappen voor specifieke contenttypes als dat overzicht geeft, bijvoorbeeld `blog-fotos`.
- Zorg dat paden werken in root en submap, of spreek een vaste deploy-structuur af.
- Voeg favicon en social preview metadata toe als de site gedeeld wordt.

## SEO

Lees `lcb-context/06-seo-basis.md` voordat je een pagina als klaar beschouwt.

Elke pagina heeft minimaal:

- unieke SEO-title
- unieke meta description
- canonical URL
- Open Graph metadata
- social preview image of fallback
- precies een H1
- logische heading-volgorde
- alt-tekst voor inhoudelijke afbeeldingen

Bij meertalige sites:

- eigen SEO-title en description per taal
- canonical naar de huidige taalvariant
- `hreflang` links naar alle taalvarianten

Gebruik bij meerdere pagina's `src/_data/routes.json` als relatiebestand tussen pagina-identiteit en taalroute. Elke pagina-template heeft een `pageKey`; canonical, `hreflang` en taalselector gebruiken `routes.pages[pageKey]`.

## Header en footer

Een echte website heeft een duidelijke header en footer.

Header/navigatiecomponent:

- logo
- hoofdmenu
- taalkeuze als het project meertalig is
- eventueel primaire actie
- mobiel hamburger/offcanvas

Navigatie gebruikt een consistent data-contract. Nieuwe LWE-projecten gebruiken bij voorkeur `key`, `slug`, `label` en `seo` per menu-item. `key` is de stabiele interne identiteit, `slug` is de route per taal, `label` is de zichtbare tekst en `seo.title`/`seo.description` zijn unieke contentvelden per taal. Als `content.nav` `href` bevat, rendert het template `item.href`. Als `content.nav` `slug` bevat, berekent het template de URL uit `item.slug` en de huidige taal. Zet geen Nunjucks-templatecode in `content.json`; routinglogica hoort in `nav.njk` of een gedeelde helper. Desktopmenu en mobiel menu gebruiken dezelfde URL-logica.

Footer:

- korte omschrijving
- contact of locatie
- compacte snel-links
- socials met herkenbare iconen
- partners/sponsors waar relevant

De footer mag niet een tweede lang hoofdmenu worden. De footer is een centraal component en blijft onderaan staan bij pagina's met weinig content.

## AI-werkwijze

Een AI die aan de site werkt leest eerst:

1. Local Website Editor-regels.
2. Dit bouwkader.
3. Projectcontext.
4. Bestaande data en templates.
5. `project-input/`.

Daarna geeft de AI kort terug:

- welke LWE-contextbestanden gelezen zijn
- welke techniek gebruikt wordt
- hoe content beheerd wordt
- welke pagina's of data hij gaat aanpassen
- welke aannames hij maakt
- of het project single-language of multi-language is
- hoe demo- of placeholder-content wordt opgeruimd
- welk centraal nav-component en footercomponent gebruikt worden
- welke zichtbare teksten Content zijn
- welke zichtbare teksten System zijn
- welke SEO-velden hij toevoegt of controleert

Daarna vraagt de AI expliciet akkoord:

```txt
Ik ga nu deze onderdelen aanpassen. Zal ik beginnen?
```

Pas na akkoord gaat de AI bouwen.

Bij bouwen:

1. Inventariseer `project-input/`.
2. Ruim demo- of placeholder-content op als het een echt project is.
3. Maak of update het contentmodel.
4. Maak of update SEO-content.
5. Maak of update templates.
6. Gebruik Bootstrap voor layout en componenten.
7. Voeg alleen noodzakelijke eigen CSS toe.
8. Controleer desktop en mobiel.
9. Controleer SEO-basistags.
10. Controleer normale website en `/__lcb/`.

## Wanneer iets niet in de Local Website Editor hoeft

Niet alles hoeft bewerkbaar te zijn.

Niet in JSON:

- Local Website Editor-interface
- technische foutmeldingen
- template-logica
- CSS-klassen
- puur structurele HTML
- developer-documentatie
- System-teksten

Wel in JSON:

- beheerbare websitetekst
- SEO-velden
- labels
- knopteksten
- nieuws- en kalenderinhoud
- herhalende contentblokken
- eventueel links, downloads en afbeeldingen als het project dat nodig heeft

## Definitie van klaar

Een website-onderdeel is klaar als:

- de content logisch op de juiste pagina staat
- beheerbare Content uit JSON komt
- System-teksten bewust als System zijn behandeld
- edit-paden kloppen
- SEO-basistags aanwezig zijn
- Bootstrap/responsive layout werkt
- er een centraal navigatiecomponent en centrale footer zijn
- de footer onderaan blijft bij weinig content
- bij meertaligheid een taalkeuze zichtbaar is
- demo- of placeholder-content niet per ongeluk live blijft staan
- gebruikte logo's en afbeeldingen inhoudelijk zijn gecontroleerd
- externe links correct werken
- normale output schoon is
- Local Website Editor-editlaag de tekst kan aanpassen
- er geen belangrijke broninformatie vergeten is
