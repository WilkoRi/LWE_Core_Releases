# SEO-basis

SEO hoort bij het standaard bouwproces van elke 11ty + Local Website Editor + Bootstrap website.

De AI moet SEO meenemen voordat hij templates als klaar beschouwt.

## SEO is onderdeel van het contentcontract

SEO-velden zijn beheerbare Content, ook als ze niet zichtbaar op de pagina staan.

Voorbeelden:

- `<title>`
- meta description
- canonical URL
- Open Graph title
- Open Graph description
- social preview image
- taalvarianten en hreflang

Omdat deze velden niet altijd aanklikbaar zijn op de pagina, zijn ze in versie 1 meestal niet via de visuele editor te bewerken. Ze moeten wel in JSON staan en door de template worden gerenderd.

## Minimale SEO per website

Elke site heeft minimaal:

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

## Minimale SEO per pagina

Elke pagina heeft minimaal:

```json
{
  "pages": {
    "home": {
      "seo": {
        "title": {
          "nl": "Paginatitel",
          "en": "Page title",
          "de": "Seitentitel"
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

Als een project klein is, mag `meta.title` en `meta.description` op siteniveau gebruikt worden. Bij meerdere pagina's moet SEO per pagina worden ingericht.

## Template-eisen

Elke pagina rendert minimaal:

```njk
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

Bij meertalige sites rendert elke pagina ook `hreflang` links:

```njk
{% for lang in content.languages %}
  <link rel="alternate" hreflang="{{ lang.code }}" href="{{ siteUrl }}{{ localizedPath }}">
{% endfor %}
<link rel="alternate" hreflang="x-default" href="{{ siteUrl }}/">
```

## Contentregels voor SEO

- Elke pagina heeft precies een duidelijke H1.
- De H1 hoeft niet identiek te zijn aan de SEO-title.
- Meta descriptions zijn kort, concreet en uniek per pagina.
- Gebruik beschrijvende linkteksten.
- Afbeeldingen krijgen betekenisvolle `alt` tekst als ze inhoud dragen.
- Decoratieve afbeeldingen mogen lege `alt=""` hebben.
- Gebruik logische heading-volgorde: H1, H2, H3.
- Externe links openen in een nieuw tabblad als het project dat als regel heeft.

## Meertaligheid

Als een site meertalig is:

- SEO-title en description hebben dezelfde taalkeys als gewone content.
- Elke taalpagina heeft een eigen URL.
- Elke taalpagina verwijst met `hreflang` naar de andere taalvarianten.
- De canonical URL wijst naar de URL van dezelfde taalvariant, niet altijd naar Nederlands.

## AI-checklist SEO

Controleer voordat je klaar bent:

- Heeft de pagina een unieke SEO-title?
- Heeft de pagina een unieke meta description?
- Is er precies een H1?
- Klopt de canonical URL?
- Zijn Open Graph tags aanwezig?
- Is er een social preview image of fallback?
- Zijn `hreflang` tags aanwezig bij meertalige sites?
- Hebben inhoudelijke afbeeldingen alt-tekst?
- Zijn SEO-velden in JSON opgenomen?
- Is duidelijk welke SEO-velden niet via de visuele Local Website Editor aanklikbaar zijn?
- Is een tijdelijke social preview placeholder voor publicatie vervangen door een echte projectafbeelding?

Voor productie heeft een JPG of PNG social preview image de voorkeur. Een starter mag een tijdelijke placeholder bevatten, maar die moet voor publicatie worden vervangen door een echte projectafbeelding.
