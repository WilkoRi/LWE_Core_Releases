# SEO-basis

SEO hoort bij het standaard bouwproces van elke 11ty + Local Website Editor + Bootstrap website.

De AI moet SEO meenemen voordat templates of een website als klaar worden beschouwd. SEO is geen losse optimalisatiefase achteraf, maar onderdeel van bouwen, controleren en opleveren.

Binnen LWE bestaat SEO uit drie onderdelen:

- content-SEO
- technische SEO
- semantische SEO

Hoofdregel:

> SEO-tekst is Content. SEO-relaties zijn System.

SEO-velden die een gebruiker of projectinhoud bepalen staan in JSON. Technische waarden die LWE betrouwbaar uit routes, taal en siteconfiguratie kan afleiden, worden niet nogmaals als vrije content opgeslagen.

## SEO is onderdeel van het contentcontract

SEO-velden zijn beheerbare content, ook als ze niet zichtbaar op de pagina staan.

Voorbeelden van SEO Content:

- `<title>`
- meta description
- Open Graph title
- Open Graph description
- social preview image
- betekenisvolle alt-teksten
- herkenbare publieke afbeeldingsnamen
- index/noindex-keuze waar die inhoudelijk nodig is

Voorbeelden van SEO System:

- `pageId`
- routes
- absolute pagina-URL
- canonical URL
- Open Graph URL
- `hreflang`
- taalrelaties tussen pagina's
- sitemap-URLs
- `robots.txt`
- `<html lang="">`

Omdat SEO-velden niet altijd aanklikbaar zijn op de pagina, zijn ze niet altijd via de visuele Local Website Editor te bewerken. Ze moeten wel in JSON staan en door de template worden gerenderd.

## PageId en routes

Bij een meertalige website moet LWE weten welke pagina's taalvarianten van elkaar zijn. Gebruik daarvoor een stabiele, taalneutrale pagina-identiteit: `pageId`.

Voorbeeld:

```json
{
  "routes": {
    "about": {
      "nl": "/nl/over-ons/",
      "en": "/en/about-us/",
      "de": "/de/ueber-uns/"
    }
  }
}
```

Hier is `about` de interne pagina-identiteit. De drie URLs zijn taalvarianten van dezelfde logische pagina.

Gebruik dezelfde routegegevens voor:

- de daadwerkelijke pagina-URL
- interne links
- taalwisselaar
- canonical URL
- `og:url`
- `hreflang`
- sitemap

Gebruik geen menutitel als technische pagina-identiteit. Een menutitel is content: taalafhankelijk, wijzigbaar, niet altijd uniek en niet altijd aanwezig. Een wijziging van `Over ons` naar `Wie zijn wij` mag routes, canonical, hreflang of sitemap niet breken.

## Minimale SEO per website

Elke productiesite heeft minimaal:

```json
{
  "meta": {
    "siteName": {
      "nl": "Sitenaam",
      "en": "Site name",
      "de": "Sitename"
    },
    "siteUrl": "https://www.example.nl",
    "defaultImage": "/assets/social-preview.jpg"
  }
}
```

Regels:

- gebruik alleen de taalkeys die voor het project nodig zijn
- `siteUrl` bevat de productie-URL
- gebruik een consistente slash-notatie
- `defaultImage` is de fallback als een pagina geen eigen social preview image heeft
- een starter mag een tijdelijke placeholder bevatten
- vervang tijdelijke social previews voor publicatie door echte projectafbeeldingen

Voor productie heeft JPG of PNG voor social previews de voorkeur, tenzij het project bewust een ander ondersteund formaat gebruikt.

## Minimale SEO per pagina

Elke indexeerbare inhoudelijke pagina heeft minimaal:

```json
{
  "pages": {
    "about": {
      "seo": {
        "title": {
          "nl": "Over ons",
          "en": "About us",
          "de": "Ueber uns"
        },
        "description": {
          "nl": "Korte omschrijving van de pagina.",
          "en": "Short page description.",
          "de": "Kurze Beschreibung der Seite."
        },
        "image": "/assets/social-preview.jpg",
        "index": true
      }
    }
  }
}
```

De sleutel `about` correspondeert bij voorkeur met dezelfde `pageId` die in `routes` wordt gebruikt.

Bij een eenvoudige onepager mag SEO op siteniveau worden ingericht. Bij meerdere inhoudelijke pagina's wordt SEO per pagina ingericht.

`index` is standaard `true`. Gebruik `false` alleen bewust, bijvoorbeeld voor een bedankpagina, interne hulppagina of andere pagina die niet in zoekmachines hoort.

Als een project `project-input/navigation-contract.json` gebruikt met `standard: "lwe-page-menu-seo-v1"`, dan zijn `seo.title` en `seo.description` onderdeel van het navigatie- en paginacontract. Ze moeten per taal gevuld en uniek zijn. Dit voorkomt generieke paginanamen zoals alleen `Home`, `Contact` of `Over ons` zonder herkenbare projectnaam of onderscheidende omschrijving.

## Template-eisen

Elke pagina rendert de actuele taal:

```njk
<html lang="{{ currentLang.code }}">
```

Elke indexeerbare pagina rendert minimaal:

```njk
<title>{{ pageSeo.title | t(currentLang.code) }}</title>
<meta name="description" content="{{ pageSeo.description | t(currentLang.code) }}">
<link rel="canonical" href="{{ absoluteUrl }}">

<meta property="og:type" content="website">
<meta property="og:title" content="{{ pageSeo.title | t(currentLang.code) }}">
<meta property="og:description" content="{{ pageSeo.description | t(currentLang.code) }}">
<meta property="og:url" content="{{ absoluteUrl }}">
<meta property="og:image" content="{{ siteUrl }}{{ pageSeo.image or content.meta.defaultImage }}">
<meta property="og:site_name" content="{{ content.meta.siteName | t(currentLang.code) }}">

<meta name="twitter:card" content="summary_large_image">
```

`og:image` moet uiteindelijk een geldige absolute URL opleveren.

Bij meertalige sites kan een passende Open Graph-locale worden gerenderd, bijvoorbeeld `nl_NL`, met alternatieve locales voor andere taalvarianten. Dit is nuttig voor sociale previews, maar geen harde SEO-vereiste.

## Canonical URLs

Elke indexeerbare pagina heeft een canonical URL naar de voorkeurs-URL van diezelfde pagina.

De canonical wordt bij voorkeur automatisch opgebouwd uit:

```text
siteUrl + route van pageId voor currentLang
```

Controleer:

- canonical is absoluut
- canonical gebruikt de productie-URL
- canonical wijst niet naar een 404 of redirect
- een taalvariant canonicaliseert niet automatisch naar de hoofdtaal
- dezelfde content krijgt niet onbedoeld meerdere canonical bestemmingen

## Meertaligheid en hreflang

Als een site meertalig is:

- elke taalvariant heeft een eigen URL
- taalvarianten van dezelfde logische pagina delen dezelfde `pageId`
- SEO-title en description gebruiken dezelfde taalkeys als gewone content
- `<html lang="">` correspondeert met de actuele taal
- canonical verwijst naar de actuele taalvariant
- `hreflang` verwijst naar beschikbare taalvarianten van dezelfde `pageId`
- taalwisselaar, canonical en `hreflang` gebruiken dezelfde routerelaties
- ontbrekende vertalingen worden niet verzonnen om SEO compleet te laten lijken

Voorbeeld:

```html
<link rel="alternate" hreflang="nl" href="https://www.example.nl/nl/over-ons/">
<link rel="alternate" hreflang="en" href="https://www.example.nl/en/about-us/">
<link rel="alternate" hreflang="de" href="https://www.example.nl/de/ueber-uns/">
```

Genereer niet voor iedere taal dezelfde URL.

Gebruik `x-default` alleen als het project een duidelijke standaardvariant of taalkeuzepagina heeft. Stuur `x-default` niet automatisch voor iedere pagina naar `/`.

## Sitemap

Een productieproject genereert een `sitemap.xml` wanneer de website indexeerbare pagina's heeft.

De sitemap wordt afgeleid uit de daadwerkelijke routes en wordt niet handmatig als losse lijst bijgehouden als dezelfde informatie al in het routesysteem staat.

De sitemap bevat alleen URLs die daadwerkelijk geindexeerd mogen worden.

Controleer:

- alleen bestaande publieke pagina's
- alleen canonical URLs
- geen 404-pagina
- geen editor- of developmentroutes
- geen pagina's met `noindex`
- geen URLs die alleen redirecten
- correcte taalvarianten bij meertalige sites

## robots.txt

Een productiesite heeft een passende `robots.txt`.

Minimale productievariant:

```txt
User-agent: *
Allow: /

Sitemap: https://www.example.nl/sitemap.xml
```

Controleer voor publicatie dat productie niet per ongeluk volledig geblokkeerd wordt, bijvoorbeeld door:

```txt
Disallow: /
```

`robots.txt` is geen betrouwbare manier om een pagina uit de zoekindex te houden. Gebruik daarvoor `noindex` op de pagina of verwijder/blokkeer de pagina op serverniveau. Lokale editor-, ontwikkel- en bronbestanden horen sowieso niet publiek gepubliceerd te worden.

## Index en noindex

Indexeerbare pagina's zijn standaard toegankelijk voor zoekmachines.

Als een pagina bewust niet geindexeerd moet worden, render dan bijvoorbeeld:

```html
<meta name="robots" content="noindex, follow">
```

Een `noindex`-pagina hoort niet in `sitemap.xml`.

Gebruik `noindex` bewust en niet als oplossing voor een verkeerde websitestructuur.

## Redirects

Bij migraties of gewijzigde URLs moeten oude relevante URLs waar mogelijk naar de juiste nieuwe pagina verwijzen.

Controleer:

- geen redirect loops
- geen onnodige redirect chains
- geen redirects naar 404-pagina's
- oude belangrijke URLs krijgen een inhoudelijk passende bestemming
- interne links gebruiken bij voorkeur direct de nieuwe URL en niet eerst een redirect

Redirectbeheer is projectspecifiek en kan bijvoorbeeld via hostingconfiguratie, `.htaccess` of een apart databestand worden ingericht.

## 404

Een productiesite heeft een bruikbare 404-pagina.

Controleer:

- de 404-pagina staat niet in de sitemap
- de 404-pagina is niet bedoeld om geindexeerd te worden
- de hosting geeft bij een niet-bestaande URL daadwerkelijk HTTP-status 404 terug
- de pagina helpt de bezoeker terug naar normale websitecontent

## Contentregels voor SEO

- Elke inhoudelijke pagina heeft precies een duidelijke H1.
- De H1 hoeft niet identiek te zijn aan de SEO-title.
- Elke indexeerbare pagina heeft een unieke, passende SEO-title.
- Voorkom onnodige herhaling van sitenaam en zoekwoorden in titles.
- Signaleer opvallend korte of lange titles, maar behandel tekenlimieten niet als harde rankingregels.
- Elke indexeerbare pagina heeft een korte, concrete en passende meta description.
- Gebruik beschrijvende linkteksten.
- Maak belangrijke pagina's bereikbaar via normale interne links.
- Voorkom waar mogelijk pagina's waar nergens intern naar wordt gelinkt.
- Gebruik logische heading-volgorde: H1, H2, H3.
- Externe links openen alleen in een nieuw tabblad als het project dat als regel heeft.

Voor afbeeldingen gelden de uitgebreide regels uit `10-afbeeldingen.md`. SEO controleert in ieder geval dat inhoudelijke afbeeldingen betekenisvolle alt-tekst hebben en decoratieve afbeeldingen `alt=""` mogen gebruiken.

Voor publieke websiteafbeeldingen kijkt LWE naar drie samenhangende dingen:

- bestandsnaam: herkenbaar en beschrijvend, bijvoorbeeld `rc-racing-jeugdles-den-haag.webp`
- alt-tekst: beschrijft de inhoud of functie van de afbeelding
- context: koppen en tekst rond de afbeelding maken duidelijk waarom de afbeelding op die pagina staat

Bronbestanden in `project-input/afbeeldingen/` hoeven niet handmatig hernoemd te worden. Bij verwerking mag LWE een SEO-vriendelijke naam voorstellen voor het publieke bestand in `src/assets/images/processed/`, inclusief bijpassende alt-tekst en te wijzigen verwijzingen. Dit gebeurt eerst als voorstel of dry-run.

Goedgekeurde publieke bestandsnamen kunnen in `lwe-image.config.json` onder `outputNames` worden vastgelegd. Zo blijft de image-pipeline reproduceerbaar en hoeft LWE niet te gokken op basis van vage bronnamen.

Zwakke bestandsnamen en ontbrekende alt-teksten zijn review-waarschuwingen. Ze blokkeren de build niet automatisch. Alleen echte risico's, zoals herkenbare personen of kinderen zonder akkoord, mogen een harde guard-stop veroorzaken.

## Structured data

Gebruik waar relevant gestructureerde data volgens Schema.org.

Structured data moet overeenkomen met informatie die daadwerkelijk op of over de website beschikbaar is. Voeg geen schema toe alleen omdat een type technisch mogelijk is.

Mogelijke typen zijn:

- `WebSite`
- `Organization`
- `LocalBusiness`
- `BreadcrumbList`
- `Article`
- `Event`
- andere paginatype-schema's als de inhoud dat werkelijk ondersteunt

Gebruik voor een organisatie of bedrijf alleen gegevens die bij het project horen.

Voorbeeld van een eenvoudige basis:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Sitenaam",
  "url": "https://www.example.nl/"
}
</script>
```

Als breadcrumbs zichtbaar en inhoudelijk zinvol zijn, kan ook `BreadcrumbList` worden toegevoegd.

Structured data moet geldig zijn en mag geen informatie claimen die niet uit het project of de pagina blijkt.

## Social metadata

Open Graph hoort bij de standaard metadata van iedere publieke pagina die gedeeld kan worden.

Controleer minimaal:

- `og:type`
- `og:title`
- `og:description`
- `og:url`
- `og:image`
- `og:site_name`
- Twitter/X card

Bij meertalige sites kan ook `og:locale` en `og:locale:alternate` worden gebruikt.

De social preview image moet geschikt zijn voor het project. Een starter mag een tijdelijke placeholder bevatten, maar die moet voor publicatie worden vervangen door een echte projectafbeelding.

## SEO en performance

Een statische 11ty-site hoort technisch licht te blijven.

Controleer daarom ook:

- geen onnodig JavaScript
- geen onnodig zware externe libraries
- geen onnodig render-blocking materiaal
- afbeeldingen zijn geschikt gemaakt voor webgebruik
- voorkom grote layout shifts
- voorkom onnodig zware fonts
- hero- en andere belangrijke boven-de-vouw content wordt niet onnodig vertraagd
- Bootstrap en project-CSS worden niet onnodig uitgebreid met dubbele functionaliteit

Let waar relevant op Core Web Vitals:

- LCP
- CLS
- INP

Performance is geen reden om functionaliteit blind te verwijderen. Signaleer eerst het probleem en kies de eenvoudigste passende oplossing.

## AI-checklist SEO

Controleer per pagina voordat je klaar bent:

- Heeft iedere inhoudelijke pagina een stabiele `pageId`?
- Heeft iedere taalvariant de juiste route?
- Heeft de pagina een unieke SEO-title?
- Heeft de pagina een passende meta description?
- Is er precies een H1?
- Is de heading-structuur logisch?
- Is `<html lang="">` correct?
- Klopt de canonical URL?
- Wijst canonical naar dezelfde taalvariant?
- Zijn Open Graph tags aanwezig?
- Is `og:url` gelijk aan de correcte absolute pagina-URL?
- Is er een social preview image of fallback?
- Levert `og:image` een geldige absolute URL op?
- Zijn `hreflang` tags correct bij meertalige sites?
- Is `x-default`, indien gebruikt, bewust en correct ingericht?
- Hebben inhoudelijke afbeeldingen passende alt-tekst?
- Hebben publieke websiteafbeeldingen herkenbare, beschrijvende bestandsnamen?
- Kloppen bestandsnaam, alt-tekst en omliggende context inhoudelijk met elkaar?
- Zijn decoratieve afbeeldingen correct herkenbaar als decoratief?
- Zijn SEO Content-velden in JSON opgenomen?
- Zijn technische SEO-waarden waar mogelijk afgeleid in plaats van dubbel opgeslagen?
- Is index/noindex bewust ingesteld?
- Is duidelijk welke SEO-velden niet via de visuele Local Website Editor aanklikbaar zijn?
- Is een tijdelijke social preview placeholder voor publicatie vervangen door een echte projectafbeelding?

Controleer websitebreed voordat je de website als productieklaar beschouwt:

- Bestaat een correcte `sitemap.xml` als de productiesite indexeerbare pagina's heeft?
- Bestaat een correcte `robots.txt`?
- Wordt productie niet onbedoeld geblokkeerd voor zoekmachines?
- Bevat de sitemap alleen indexeerbare canonical URLs?
- Zijn redirects gecontroleerd?
- Werkt de 404-pagina met echte HTTP-status 404?
- Zijn interne links gecontroleerd op fouten en onnodige redirects?
- Zijn belangrijke pagina's intern bereikbaar?
- Is structured data toegevoegd waar dat inhoudelijk relevant is?
- Is structured data geldig en gebaseerd op echte projectinformatie?
- Zijn meertalige canonical- en hreflang-relaties consistent?
- Zijn opvallende performanceproblemen gecontroleerd?

## Definitie van SEO-klaar

Een pagina is niet SEO-klaar alleen omdat `<title>` en meta description aanwezig zijn.

Een website mag door de AI niet als SEO-klaar of productieklaar worden beschouwd zolang er bekende fouten zijn in:

- canonical URLs
- indexeerbaarheid
- sitemap
- robots.txt
- hreflang
- interne links
- redirects
- 404-afhandeling
- relevante structured data

Als een controle niet automatisch kan worden uitgevoerd, meldt de AI dit als open controlepunt in plaats van aan te nemen dat het goed is.
