# SEO-basis 02

SEO hoort bij het standaard bouwproces van elke 11ty + Local Website
Editor + Bootstrap website.

De AI moet SEO meenemen voordat templates als klaar worden beschouwd.

SEO bestaat binnen LWE uit twee duidelijk gescheiden onderdelen:

-   **SEO Content**: beheerbare inhoud die per project of pagina kan
    verschillen.
-   **SEO System**: technische relaties en waarden die LWE zoveel
    mogelijk zelf afleidt.

Het uitgangspunt is:

> **SEO-tekst is Content. SEO-relaties zijn System.**

Hierdoor worden technische SEO-waarden niet onnodig handmatig beheerd en
ontstaat één bron van waarheid voor routes, taalrelaties en
pagina-identiteit.

------------------------------------------------------------------------

## 1. SEO is onderdeel van het contentcontract

SEO-velden zijn beheerbare Content, ook als ze niet zichtbaar op de
pagina staan.

Voorbeelden van SEO Content:

-   `<title>`
-   meta description
-   Open Graph title
-   Open Graph description
-   social preview image

Omdat deze velden niet altijd aanklikbaar zijn op de pagina, zijn ze in
versie 1 meestal niet via de visuele Local Website Editor te bewerken.
Ze moeten wel in JSON staan en door de template worden gerenderd.

Technische waarden die betrouwbaar uit andere projectdata kunnen worden
afgeleid, horen niet als vrije SEO-content te worden opgeslagen.

Voorbeelden van SEO System:

-   canonical URL
-   Open Graph URL
-   `hreflang`
-   absolute pagina-URL
-   taalrelaties tussen pagina's
-   sitemap-URL's
-   `robots.txt`
-   `<html lang="">`

------------------------------------------------------------------------

## 2. Pagina-identiteit en taalrelaties

Bij een meertalige website moet LWE weten welke pagina's taalvarianten
van elkaar zijn.

Gebruik hiervoor een stabiele, taalneutrale pagina-identiteit.

Bijvoorbeeld:

``` json
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

Hier is `about` de interne pagina-identiteit.

De drie URL's zijn geen drie losstaande pagina's, maar drie
taalvarianten van dezelfde logische pagina.

Deze relatie wordt centraal gebruikt voor:

-   routes
-   taalwisselaar
-   canonical URL
-   `hreflang`
-   Open Graph URL
-   sitemap
-   navigatie waar relevant

### Waarom geen menu title als pagina-identiteit?

Een menutitel mag niet als technische pagina-identiteit worden gebruikt.

Een menutitel is Content:

-   hij is taalafhankelijk;
-   hij kan door een gebruiker worden gewijzigd;
-   hij hoeft niet uniek te zijn;
-   een pagina hoeft niet altijd in het menu te staan.

Een wijziging van `Over ons` naar `Wie zijn wij` mag daarom nooit de
technische relatie tussen pagina's verbreken.

Gebruik dus een stabiele interne sleutel zoals:

``` text
about
contact
youthLessons
events
```

Deze sleutel kan `pageId`, `routeId`, `pageKey` of een vergelijkbare
naam krijgen.

Binnen LWE heeft **`pageId`** de voorkeur omdat direct duidelijk is dat
het om de logische identiteit van de pagina gaat.

De `pageId` is System en wordt niet vertaald.

------------------------------------------------------------------------

## 3. Eén bron van waarheid voor routes

Pagina-URL's worden centraal vastgelegd.

``` json
{
  "routes": {
    "about": {
      "nl": "/nl/over-ons/",
      "en": "/en/about-us/",
      "de": "/de/ueber-uns/"
    },
    "contact": {
      "nl": "/nl/contact/",
      "en": "/en/contact/",
      "de": "/de/kontakt/"
    }
  }
}
```

Gebruik dezelfde routegegevens voor:

-   de daadwerkelijke pagina-URL;
-   interne links;
-   taalwisselaar;
-   canonical;
-   `og:url`;
-   `hreflang`;
-   sitemap.

Maak hiervoor geen afzonderlijke handmatig beheerde URL's als dezelfde
waarde uit `routes` kan worden afgeleid.

------------------------------------------------------------------------

## 4. Minimale SEO per website

``` json
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

-   `siteUrl` bevat de productie-URL.
-   Gebruik één consistente notatie voor de afsluitende slash.
-   `defaultImage` is de fallback als een pagina geen eigen social
    preview image heeft.
-   Voor productie heeft JPG of PNG voor social preview de voorkeur.
-   Een starter mag een tijdelijke placeholder bevatten.
-   Die placeholder moet voor publicatie worden vervangen door een echte
    projectafbeelding.

------------------------------------------------------------------------

## 5. Minimale SEO Content per pagina

``` json
{
  "pages": {
    "about": {
      "seo": {
        "title": {
          "nl": "Over ons",
          "en": "About us",
          "de": "Über uns"
        },
        "description": {
          "nl": "Korte omschrijving van de pagina.",
          "en": "Short page description.",
          "de": "Kurze Beschreibung der Seite."
        },
        "image": "/assets/social-preview.jpg"
      }
    }
  }
}
```

De sleutel `about` correspondeert bij voorkeur met dezelfde `pageId` die
in `routes` wordt gebruikt:

``` text
pages.about
routes.about
```

Bij één eenvoudige pagina mogen SEO-title en description op siteniveau
worden ingericht. Bij meerdere inhoudelijke pagina's wordt SEO per
pagina ingericht.

------------------------------------------------------------------------

## 6. Wat niet als vrije SEO Content wordt opgeslagen

Sla waarden die LWE betrouwbaar kan afleiden niet nogmaals handmatig op.

Dus niet standaard:

``` json
{
  "seo": {
    "canonical": "https://www.example.nl/nl/over-ons/",
    "ogUrl": "https://www.example.nl/nl/over-ons/"
  }
}
```

Als LWE al beschikt over:

``` text
siteUrl = https://www.example.nl
pageId = about
currentLang = nl
routes.about.nl = /nl/over-ons/
```

dan kan LWE daaruit `absoluteUrl` afleiden.

Diezelfde `absoluteUrl` wordt gebruikt voor canonical, `og:url`, sitemap
en andere absolute URL-verwijzingen.

------------------------------------------------------------------------

## 7. Template-eisen

Elke indexeerbare pagina rendert minimaal:

``` njk
<html lang="{{ currentLang.code }}">
```

en in `<head>`:

``` njk
<title>{{ pageSeo.title | t(currentLang.code) }}</title>
<meta name="description" content="{{ pageSeo.description | t(currentLang.code) }}">
<link rel="canonical" href="{{ absoluteUrl }}">

<meta property="og:type" content="website">
<meta property="og:title" content="{{ pageSeo.title | t(currentLang.code) }}">
<meta property="og:description" content="{{ pageSeo.description | t(currentLang.code) }}">
<meta property="og:url" content="{{ absoluteUrl }}">
<meta property="og:image" content="{{ siteUrl }}{{ pageSeo.image or content.meta.defaultImage }}">

<meta name="twitter:card" content="summary_large_image">
```

De uiteindelijke `og:image` moet een geldige absolute URL opleveren.

------------------------------------------------------------------------

## 8. Canonical

Elke indexeerbare pagina heeft een canonical URL.

De canonical wordt bij voorkeur automatisch opgebouwd uit:

``` text
siteUrl + route van pageId voor currentLang
```

De canonical van een taalvariant verwijst naar de URL van diezelfde
taalvariant.

Dus:

``` text
/en/about-us/ → canonical /en/about-us/
```

en niet standaard:

``` text
/en/about-us/ → canonical /nl/over-ons/
```

------------------------------------------------------------------------

## 9. Hreflang

Bij een meertalige website rendert een pagina `hreflang` voor de
werkelijk beschikbare taalvarianten van dezelfde `pageId`.

Voor `pageId = about`:

``` text
NL → /nl/over-ons/
EN → /en/about-us/
DE → /de/ueber-uns/
```

wordt bijvoorbeeld:

``` html
<link rel="alternate" hreflang="nl" href="https://www.example.nl/nl/over-ons/">
<link rel="alternate" hreflang="en" href="https://www.example.nl/en/about-us/">
<link rel="alternate" hreflang="de" href="https://www.example.nl/de/ueber-uns/">
```

De template mag niet één `localizedPath` hergebruiken voor alle talen
als daardoor dezelfde URL voor verschillende `hreflang`-waarden
ontstaat.

### x-default

Gebruik `x-default` alleen als het project daar een duidelijke
standaardvariant of taalkeuzepagina voor heeft.

Stuur `x-default` niet automatisch voor iedere pagina naar `/`.

Als Nederlands de standaardvariant van `about` is, kan bijvoorbeeld
worden gekozen voor:

``` html
<link rel="alternate" hreflang="x-default" href="https://www.example.nl/nl/over-ons/">
```

De keuze voor `x-default` is een projectregel en moet consistent worden
toegepast.

------------------------------------------------------------------------

## 10. Sitemap

Een productieproject genereert een `sitemap.xml`.

De sitemap wordt afgeleid uit de daadwerkelijke routes en wordt niet
handmatig als losse lijst bijgehouden als dezelfde informatie al in het
routesysteem aanwezig is.

Gebruik dezelfde bron van waarheid:

``` text
routes
→ pagina-URL
→ canonical
→ hreflang
→ og:url
→ sitemap.xml
```

------------------------------------------------------------------------

## 11. robots.txt

Een productieproject heeft een passende `robots.txt`.

Als een sitemap beschikbaar is, mag `robots.txt` naar de
productie-sitemap verwijzen.

Conceptueel:

``` text
User-agent: *
Allow: /

Sitemap: https://www.example.nl/sitemap.xml
```

Development-, preview- of stagingomgevingen mogen indien nodig
indexering blokkeren.

Een development- of staginginstelling die indexering blokkeert mag nooit
ongemerkt naar productie worden meegenomen.

------------------------------------------------------------------------

## 12. Contentregels voor SEO

-   Elke inhoudelijke pagina heeft precies één duidelijke H1.
-   De H1 hoeft niet identiek te zijn aan de SEO-title.
-   Elke indexeerbare pagina heeft een unieke, passende SEO-title.
-   Elke indexeerbare pagina heeft een korte, concrete en passende meta
    description.
-   Gebruik beschrijvende linkteksten.
-   Afbeeldingen krijgen betekenisvolle `alt` tekst als ze inhoud
    dragen.
-   Decoratieve afbeeldingen mogen `alt=""` hebben.
-   Gebruik een logische heading-volgorde: H1, H2, H3.
-   Externe links openen alleen in een nieuw tabblad als het project dat
    als regel heeft.
-   SEO Content gebruikt dezelfde taalkeys als gewone content.

------------------------------------------------------------------------

## 13. Meertaligheid

Als een site meertalig is:

-   elke taalvariant heeft een eigen URL;
-   taalvarianten van dezelfde logische pagina delen dezelfde `pageId`;
-   SEO-title en description gebruiken dezelfde taalkeys als gewone
    content;
-   `<html lang="">` correspondeert met de actuele taal;
-   canonical verwijst naar de actuele taalvariant;
-   `hreflang` verwijst naar beschikbare taalvarianten van dezelfde
    `pageId`;
-   taalwisselaar en SEO gebruiken dezelfde centrale routerelaties;
-   ontbrekende vertalingen mogen niet worden verzonnen om alleen de
    SEO-structuur compleet te maken.

------------------------------------------------------------------------

## 14. Menu en pagina-identiteit zijn gescheiden

Navigatie gebruikt de pagina-identiteit om naar een route te verwijzen,
maar de zichtbare menutekst blijft Content.

``` json
{
  "navigation": [
    {
      "pageId": "about",
      "label": {
        "nl": "Over ons",
        "en": "About us",
        "de": "Über uns"
      }
    }
  ]
}
```

Hierdoor kan `Over ons` later worden gewijzigd in `Wie zijn wij` zonder
dat routes, canonical, `hreflang`, sitemap of taalrelaties veranderen.

Een pagina hoeft bovendien niet in het menu te staan om een geldige
`pageId` te hebben.

------------------------------------------------------------------------

## 15. SEO Content versus SEO System

### SEO Content

-   SEO-title
-   meta description
-   Open Graph title indien afwijkend
-   Open Graph description indien afwijkend
-   social preview image
-   betekenisvolle alt-teksten

### SEO System

-   `pageId`
-   routes
-   taalrelaties
-   absolute URL
-   canonical
-   `og:url`
-   `hreflang`
-   sitemap
-   `robots.txt`
-   `<html lang="">`

### Hoofdregel

> **Als LWE een technische SEO-waarde betrouwbaar uit bestaande
> projectdata kan afleiden, wordt die waarde niet nogmaals als vrije
> Content opgeslagen.**

------------------------------------------------------------------------

## 16. AI-checklist SEO

Controleer voordat een pagina of project als klaar wordt beschouwd:

-   Heeft iedere inhoudelijke pagina een stabiele `pageId`?
-   Zijn taalvarianten correct aan dezelfde `pageId` gekoppeld?
-   Heeft iedere taalvariant de juiste route?
-   Heeft de pagina een unieke SEO-title?
-   Heeft de pagina een passende meta description?
-   Is er precies één H1?
-   Is `<html lang="">` correct?
-   Wordt canonical uit de juiste taalroute opgebouwd?
-   Wijst canonical naar dezelfde taalvariant?
-   Zijn Open Graph tags aanwezig?
-   Is `og:url` gelijk aan de correcte absolute pagina-URL?
-   Is er een social preview image of fallback?
-   Levert `og:image` een geldige absolute URL op?
-   Zijn `hreflang` tags aanwezig bij meertalige sites?
-   Verwijzen `hreflang` tags naar de juiste taalvarianten van dezelfde
    pagina?
-   Is `x-default`, indien gebruikt, bewust en correct ingericht?
-   Hebben inhoudelijke afbeeldingen alt-tekst?
-   Zijn decoratieve afbeeldingen correct herkenbaar als decoratief?
-   Zijn SEO Content-velden in JSON opgenomen?
-   Zijn technische SEO-waarden waar mogelijk afgeleid in plaats van
    dubbel opgeslagen?
-   Gebruiken navigatie, taalwisselaar en SEO dezelfde routerelaties?
-   Wordt `sitemap.xml` gegenereerd uit de daadwerkelijke routes?
-   Is `robots.txt` geschikt voor productie?
-   Zijn eventuele staging- of development-`noindex` instellingen
    verwijderd voor productie?
-   Is duidelijk welke SEO-velden niet via de visuele Local Website
    Editor aanklikbaar zijn?
-   Is een tijdelijke social preview placeholder voor publicatie
    vervangen door een echte projectafbeelding?

------------------------------------------------------------------------

## 17. Kernprincipe

De SEO-architectuur van LWE gebruikt zo weinig mogelijk dubbele
informatie.

``` text
pageId
   │
   ├── pages[pageId]      → Content en SEO Content
   │
   └── routes[pageId]     → taalroutes
                               │
                               ├── pagina-URL
                               ├── taalwisselaar
                               ├── canonical
                               ├── hreflang
                               ├── og:url
                               └── sitemap
```

Daarmee ontstaat één stabiele pagina-identiteit en één bron van waarheid
voor de technische URL-relaties.

> **Content bepaalt wat de pagina zegt.**
>
> **`pageId` bepaalt welke logische pagina het is.**
>
> **Routes bepalen waar de taalvarianten staan.**
>
> **LWE leidt daaruit de technische SEO af.**
