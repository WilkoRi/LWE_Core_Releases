# Contentstructuur

Alle beheerbare websitecontent staat in JSON.

Bij nieuwe LWE-projecten is JSON de standaard. Bij bestaande 11ty-sites mag LWE tijdelijk ook eenvoudige `_data/*.js` of `_data/*.cjs` datafiles beheren als migratiebrug, zolang zo'n bestand een object exporteert. De editor schrijft zo'n JS-datafile terug als `module.exports = {...}`; gebruik dit daarom niet voor handgeschreven code met functies of berekeningen.

Niet alle zichtbare tekst is automatisch beheerbare content. Gebruik daarom het onderscheid tussen `Content` en `System`.

Hoofdregel:

> Alles wat niet expliciet `System` is, is `Content`.

`Content` gaat naar JSON en krijgt in de template een `data-edit-path`.

`System` is vaste interface-, structuur- of technische tekst en hoeft niet bewerkbaar te zijn.

Voorbeelden van `System`:

- Local Website Editor-toolbar teksten
- vaste taalbuttons zoals `NL`, `EN`, `DE`
- technische voorbeelden zoals `data-edit-path`
- automatische nummers
- aria-labels
- vaste merk/logo-tekst als die niet beheerd hoeft te worden

Elke tekst staat per element en per taal:

```json
{
  "title": {
    "nl": "Nederlandse tekst",
    "en": "English text",
    "de": "Deutscher Text"
  }
}
```

## Meertalige content

LWE gebruikt twee geldige modellen voor taal:

1. **Gedeelde structuur, vertaalde velden**

   Gebruik dit als de pagina in elke taal dezelfde blokken en volgorde heeft.

   ```json
   {
     "title": {
       "nl": "Nederlandse tekst",
       "en": "English text",
       "de": "Deutscher Text"
     }
   }
   ```

2. **Eigen structuur per taal**

   Gebruik dit bij bestaande of grotere sites waar migratie per taal praktischer is, of waar de gebruiker expliciet heeft afgesproken dat taalversies inhoudelijk mogen verschillen.

   ```json
   {
     "pages": {
       "home": {
         "nl": {
           "sections": []
         },
         "en": {
           "sections": []
         },
         "de": {
           "sections": []
         }
       }
     }
   }
   ```

De route-relatie blijft in beide modellen verplicht. De taalselector koppelt pagina-identiteit aan taalroute; de contentstructuur bepaalt alleen waar de tekst staat.

De hoofdtaal is standaard inhoudelijk leidend. Bij een Nederlands project betekent dit meestal: NL bepaalt welke secties en onderwerpen bestaan; EN/DE zijn vertalingen daarvan. Als een bestaande vertaling extra onderwerpen bevat of onderwerpen mist, benoem dat eerst als migratiekeuze.

Voor gedeelde onderdelen zoals navigatie, footer, contactgegevens en vaste CTA's is meestal model 1 het handigst. Voor lange pagina-inhoud bij bestaande sites kan model 2 veiliger zijn, maar alleen als hulpmiddel voor migratie; het is geen vrijbrief om taalversies ongemerkt inhoudelijk uit elkaar te laten lopen.

Gebruik geen losse HTML-fragmenten in tekstvelden, tenzij dat later expliciet ondersteund wordt.

## Lange tekst en enters

Voor gewone artikeltekst gebruikt LWE geen rich text editor en geen HTML-invoer.

Gebruik een normaal tekstveld:

- `Enter` in de LCB textarea is een normale newline (`\n`)
- een lege regel betekent een nieuwe alinea
- de template rendert zo'n tekstveld met de CSS-class `text-block`
- `text-block` staat in project system CSS, bijvoorbeeld `/assets/system.css`
- deze system CSS wordt voor de project-specifieke CSS geladen, zodat het project eventueel bewust kan overrulen
- `text-block` gebruikt alleen standaard CSS: `white-space: pre-line`

Voorbeeld:

```njk
<div
  class="text-block"
  data-edit-file="content.json"
  data-edit-path="pages.home.article.nl"
>{{ content.pages.home.article.nl }}</div>
```

Knip een lopende artikeltekst niet op in losse `before`, `label` en `after` fragmenten alleen omdat er een link in staat. Haal de link liever uit de lopende tekst en maak er een losse CTA, kaart of knop onder het artikel van. Zo blijft het artikel in LCB één logisch bewerkbaar blok.

Huidige scope:

- korte tekst
- lange tekst
- knoptekst
- menu-labels
- footer-tekst

Nog niet doen:

- rich text
- losse afbeeldingen beheren, uploaden of vervangen via de editor
- links beheren
- herordenen via de editor

## Platte lijsten

Gebruik voor eenvoudige bullet- of nummerlijsten zonder eigen links, knoppen, datums of losse velden bij voorkeur een multiline tekstveld.

Voorbeelddata:

```json
{
  "itemsText": {
    "nl": "Eerste punt\nTweede punt\nDerde punt"
  }
}
```

Gebruik in de template de standaardfilter `lines`:

```njk
<ul>
  {% for item in block.itemsText | t(lang) | lines %}
    <li>{{ item }}</li>
  {% endfor %}
</ul>
```

Elke regel wordt dan een `<li>`. Lege regels worden overgeslagen. Gebruik dit alleen voor platte lijsten; complexe lijsten blijven arrays van objecten.

## Artikelblokken

Voor meerdere alinea's die samen één logisch artikel vormen, gebruik je liever één multiline tekstveld dan losse `paragraphs` items.

Voorbeelddata:

```json
{
  "articleText": {
    "nl": "Eerste alinea.\n\nTweede alinea."
  }
}
```

Gebruik in de template de standaardfilter `paragraphs`:

```njk
{% for paragraph in block.articleText | t(lang) | paragraphs %}
  <p>{{ paragraph }}</p>
{% endfor %}
```

De gebruiker bewerkt dan één tekstblok. Een nieuwe regel of witregel wordt een nieuwe `<p>`. HTML wordt niet ingevoerd en niet met `safe` gerenderd.

## Kalenderitems

Kalenderitems blijven als data bewaard, ook als ze niet meer publiek getoond worden.

Vraag in de intake eerst uit:

- is er een evenementenkalender nodig?
- moeten verlopen events automatisch verborgen worden?

Gebruik voor events bij voorkeur deze velden:

```json
{
  "title": "Clubrace 1",
  "startDate": "2027-01-09",
  "endDate": "2027-01-10",
  "showUntil": "",
  "hidden": false
}
```

Gebruik voor gewone statische hosting de publieke kalender-helper. Die gaat mee naar de host en werkt zonder rebuild:

```html
<script src="/assets/system-calendar.js" defer></script>
```

Render events met simpele datum-attributen:

```njk
<article
  data-calendar-event
  data-event-start="{{ event.startDate }}"
  data-event-end="{{ event.endDate }}"
>
  ...
</article>
```

Gebruik de standaardfilter `upcomingEvents` alleen als build-time filtering gewenst is, bijvoorbeeld bij dagelijkse automatische rebuilds:

```njk
{% set visibleEvents = events | upcomingEvents %}
```

De filter en browser-helper rekenen lokaal per kalenderdag. Een event met `endDate: "2027-01-10"` blijft zichtbaar tot en met 10 januari en verdwijnt pas vanaf 11 januari.

Gebruik bij editpaden in een gefilterde lijst de originele index:

```njk
{% set visibleEvents = events | upcomingEvents %}
{% for event in visibleEvents %}
  {% set eventIndex = event._lweIndex if event._lweIndex is defined else loop.index0 %}
{% endfor %}
```
