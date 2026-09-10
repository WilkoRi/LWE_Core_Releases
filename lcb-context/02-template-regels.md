# Template-regels

Elke beheerbare Content-tekst in de HTML komt uit JSON.

Dit is een werkingsvoorwaarde. De Local Website Editor kan geen hardcoded HTML-tekst opslaan, omdat er dan geen JSON-bron is om naar terug te schrijven.

Een Content-tekst is pas bewerkbaar als:

- de tekst uit een toegestaan JSON-bestand komt
- het element `data-edit-file` heeft
- het element `data-edit-path` heeft
- dat pad exact bestaat in JSON

System-teksten hoeven niet uit JSON te komen en krijgen geen edit-pad. Alles wat niet expliciet System is, behandel je als Content.

Als bewuste System-tekst publiek zichtbaar in een template staat, markeer die dan met:

```html
data-lwe-system
```

Dat voorkomt ruis in de Content/System-audit. Gebruik dit niet om gewone bezoekerstekst te verstoppen; bezoekerstekst hoort in JSON met `data-edit-path`.

Elke meertalige pagina heeft deze front matter nodig:

```njk
---
pagination:
  data: content.languages
  size: 1
  alias: currentLang
pageKey: pagina
permalink: "{% if currentLang.code == 'nl' %}/pagina/{% else %}/{{ currentLang.code }}/pagina/{% endif %}"
---
{% set pageRoutes = routes.pages[pageKey] %}
{% set currentPath = pageRoutes[currentLang.code] %}
```

Vervang `pagina` door de slug van de pagina.

Zonder deze front matter bestaat `currentLang.code` niet.

Bij een meertalige site met meerdere pagina's staat de relatie tussen pagina's en taalroutes in `src/_data/routes.json`. De taalselector, canonical URL en `hreflang` gebruiken `routes.pages[pageKey]`, zodat taalwissel op dezelfde pagina blijft.

Voor bestaande root-level 11ty-sites mag dezelfde relatie ook in `_data/site.js` staan, bijvoorbeeld als `site.pages`. Dat is de migratiestandaard voor bestaande projecten die nog niet volledig naar `src/_data/content.json` zijn omgezet.

## Content En System

Bezoekerstekst krijgt een editpad. Systeemtekst krijgt geen editpad.

Gebruik `data-lwe-system` alleen voor zichtbare tekst die echt een vaste interface- of structuurfunctie heeft, zoals:

- tabelkoppen zoals `Prijs`, `Opmerking` als die bewust vaste kolomlabels zijn
- korte vaste labels zoals `Lesdag:` of `Niveau:`
- taalkeuze-labels zoals `NL`, `EN`, `DE`
- icon-only of technische bedieningslabels

Gebruik `data-lwe-system` niet voor gewone webteksten, uitleg, marketingtekst, tarieven, events, nieuws, page titles, menu-labels of footercontent. Die horen uit een contentbestand te komen met `data-edit-file` en `data-edit-path`.

## Taalstructuren

Gebruik standaard vertaalde velden als de structuur per taal gelijk is:

```njk
<h2
  data-edit-file="content.json"
  data-edit-path="pages.home.hero.title.{{ currentLang.code }}"
>
  {{ content.pages.home.hero.title[currentLang.code] }}
</h2>
```

Gebruik taal-eigen pagina-inhoud als migratievorm bij bestaande sites, maar laat de inhoudelijke structuur standaard de hoofdtaal volgen. Als een andere taal extra secties heeft of secties mist, benoem dat eerst en vraag akkoord voordat je die afwijking behoudt:

```njk
{% set pageCopy = content.pages[pageKey][currentLang.code] %}

{% for section in pageCopy.sections %}
  <h2
    data-edit-file="content.json"
    data-edit-path="pages.{{ pageKey }}.{{ currentLang.code }}.sections.{{ loop.index0 }}.title"
  >
    {{ section.title }}
  </h2>
{% endfor %}
```

De taalroute-relatie blijft los van deze keuze. Route-relaties bepalen waar de taalversie staat; contentdata bepaalt wat erop staat.

Elk bewerkbaar element heeft:

```html
data-edit-file="content.json"
data-edit-path="..."
```

Voorbeeld:

```njk
<h2
  data-edit-file="content.json"
  data-edit-path="pages.home.intro.title.{{ currentLang.code }}"
>
  {{ content.pages.home.intro.title | t(currentLang.code) }}
</h2>
```

## Links

Een link heeft twee mogelijke contentdelen:

- zichtbare tekst
- bestemming (`href`)

Maak linktekst bewerkbaar met `data-edit-path`. Maak de linkbestemming alleen bewerkbaar als de URL ook in een contentbestand staat. Gebruik daarvoor `data-edit-href-path`.

```njk
<a
  href="{{ content.links.signup.href }}"
  data-edit-file="content.json"
  data-edit-path="links.signup.label.{{ currentLang.code }}"
  data-edit-href-path="links.signup.href"
>
  {{ content.links.signup.label[currentLang.code] }}
</a>
```

Als de linkbestemming in een ander contentbestand staat, gebruik je ook `data-edit-href-file`.

```njk
<a
  href="{{ site.links.facebook.href }}"
  data-edit-file="site.json"
  data-edit-path="footer.facebook.label.{{ currentLang.code }}"
  data-edit-href-file="site.json"
  data-edit-href-path="links.facebook.href"
>
  {{ site.footer.facebook.label[currentLang.code] }}
</a>
```

In editmodus opent klikken op een bewerkbare link de Local Website Editor-drawer. De link navigeert dan niet. Zet editmodus uit om links normaal te openen.

## Klikbare Afbeeldingen En Cards

Als een afbeelding, card of contentblok klikbaar is, behandel de link dan als onderdeel van datzelfde contentblok.

Gebruik dus niet alleen een afgeleide route zoals:

```njk
href="{{ routes.pages.detail[currentLang.code] }}"
```

als de gebruiker die link logisch bij de afbeelding of card verwacht te kunnen beheren. Zet de bestemming dan ook in het content-object.

Voorbeeld:

```json
{
  "promoCard": {
    "href": {
      "nl": "/nl/beginnen/",
      "en": "/en/start/"
    },
    "image": {
      "src": "/assets/images/processed/start-card.webp",
      "alt": {
        "nl": "Starten met de hobby",
        "en": "Getting started with the hobby"
      }
    },
    "title": {
      "nl": "Begin hier",
      "en": "Start here"
    }
  }
}
```

Render de link en afbeelding samen met editpaden:

```njk
<a
  href="{{ content.promoCard.href[currentLang.code] }}"
  data-edit-file="content.json"
  data-edit-href-path="promoCard.href.{{ currentLang.code }}"
>
  <img
    src="{{ content.promoCard.image.src }}"
    alt="{{ content.promoCard.image.alt[currentLang.code] }}"
    data-edit-src-path="promoCard.image.src"
    data-edit-path="promoCard.image.alt.{{ currentLang.code }}"
    data-edit-attribute="alt"
  >
</a>
```

Bij externe links mag `href` een enkel veld zijn. Bij interne meertalige links gebruik je meestal `href.nl`, `href.en` en eventueel `href.de`, omdat routes per taal kunnen verschillen.

Uitzondering: echte system-links zoals logo naar home, hoofdnavigatie, taalwissel of vaste technische routes mogen centraal uit routes worden afgeleid. Contentkaarten, promotieblokken en klikbare afbeeldingen horen hun beheerbare link bij de contentdata te hebben.

## Attributen

Sommige content staat niet als zichtbare tekst in een element, maar in een attribuut. Gebruik dan `data-edit-attribute`.

Voorbeeld voor een afbeelding:

```njk
<img
  src="{{ content.hero.image.src }}"
  alt="{{ content.hero.image.alt[currentLang.code] }}"
  data-edit-file="content.json"
  data-edit-path="hero.image.alt.{{ currentLang.code }}"
  data-edit-attribute="alt"
>
```

Gebruik dit alleen voor veilige, tekstuele attributen zoals `alt`. Gebruik voor linkbestemmingen liever `data-edit-href-path`, zodat LWE het klikgedrag in editmodus goed kan afhandelen.

De normale website mag geen Local Website Editor-toolbar, editorpaneel of editor-JavaScript bevatten.

De Local Website Editor-server injecteert die alleen op:

```txt
/__lcb/
```

## Arrays

Herhalende onderdelen worden met een loop gerenderd.

Gebruik:

```njk
{% for item in content.pages.home.sections %}
  <h2 data-edit-file="content.json" data-edit-path="pages.home.sections.{{ loop.index0 }}.title.{{ currentLang.code }}">
    {{ item.title | t(currentLang.code) }}
  </h2>
{% endfor %}
```

Gebruik niet standaard vaste indexen zoals:

```njk
{{ content.pages.home.sections[0].title | t(currentLang.code) }}
```

Vaste indexen maken de pagina kwetsbaar zodra er items bijkomen of verdwijnen.
