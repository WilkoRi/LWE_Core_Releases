# Afbeeldingen

## Uitgangspunt

Afbeeldingen zijn bronmateriaal totdat ze bewust gekozen en verwerkt zijn.

LWE mag afbeeldingen voorbereiden met `npm run lwe:images`, maar de AI moet behoudend werken:

- overschrijf nooit originele afbeeldingen in `project-input/`
- crop niet automatisch
- behoud de beeldverhouding
- vergroot kleine afbeeldingen niet kunstmatig
- gebruik een aparte outputmap voor verwerkte afbeeldingen
- noem welke afbeelding waar gebruikt wordt en waarom

De standaard outputmap is:

```txt
src/assets/images/processed/
```

Als een bestaand 11ty-project geen `src/assets/` heeft, gebruikt LWE:

```txt
assets/images/processed/
```

## Commando

Eerst altijd droog testen:

```bash
npm run lwe:images
```

Pas daarna schrijven:

```bash
npm run lwe:images -- --apply
```

Presets:

```bash
npm run lwe:images -- --preset=general
npm run lwe:images -- --preset=hero
npm run lwe:images -- --preset=person
npm run lwe:images -- --preset=logo
```

Gericht filteren op bestandsnaam kan met:

```bash
npm run lwe:images -- --preset=hero --match=circuit
npm run lwe:images -- --preset=person --match=voorzitter
```

Gebruik `--force` alleen als gegenereerde output bewust opnieuw gemaakt mag worden.

## Wat Mag Niet

- geen bronbestanden comprimeren of vervangen
- geen gezichten/personenfoto's gebruiken zonder akkoord
- geen screenshots gebruiken zonder akkoord
- geen logo croppen
- geen afbeelding forceren in een verhouding waardoor de essentie verdwijnt
- geen HTML of script uit bestandsnamen of metadata gebruiken

## Logo's

Logo's zijn extra kwetsbaar.

Voor logo's geldt:

- gebruik bij voorkeur `--preset=logo`
- de standaard logo-preset verwerkt alleen rasterbestanden met `logo` in de bestandsnaam
- behoud transparantie
- behoud verhouding
- pas de zichtbare grootte in CSS/HTML aan, niet door het bronbeeld plat te drukken
- controleer op desktop en mobiel of het menu niet zakt of springt

## Logo Reviewvraag Na Build

Als de AI een logo heeft geplaatst, moet de AI na `npm run build` en het starten van de preview expliciet aan de gebruiker vragen:

```txt
Controleer het logo:
- staat het logo op de juiste plek?
- is het logo scherp genoeg?
- klopt de verhouding, of lijkt het uitgerekt/platgedrukt?
- is het logo te hoog of te laag voor de menubalk?
- is het logo te breed of te klein?
- werkt het ook goed op mobiel?

Als het niet klopt: moet ik vooral de hoogte, breedte, witruimte of plaatsing aanpassen?
```

De AI mag bij een logo eerst CSS aanpassen, zoals `max-height`, `width: auto`, `object-fit: contain` of padding. De AI mag het bronlogo niet croppen of vervangen zonder overleg.

## Foto's En Hero-Beelden

Voor gewone foto's en hero-beelden geldt:

- `general` is de veilige standaard
- `hero` is bedoeld voor brede headers
- de preset mag verkleinen, maar niet croppen
- als een hero exact moet bijsnijden, moet de AI eerst overleggen

## Afbeeldingen Bewerkbaar Maken

Als een afbeelding door de gebruiker in LWE gewijzigd moet kunnen worden, zet de afbeeldingsbron in een contentbestand en geef het `<img>` element een editpad.

Gebruik geen uploadveld of HTML-invoer. LWE wijzigt alleen de tekstwaarde van `src` en eventueel `alt`.

Voorbeeld:

```njk
<img
  src="{{ section.image.src }}"
  alt="{{ section.image.alt | t(currentLang.code) }}"
  data-edit-src-file="content.json"
  data-edit-src-path="pages.home.sections.0.image.src"
  data-edit-alt-file="content.json"
  data-edit-alt-path="pages.home.sections.0.image.alt.nl">
```

Daarmee kan de editor:

- het afbeeldingspad aanpassen
- de alt-tekst aanpassen
- de toonverhouding aanpassen als de template een ratio-editpad heeft
- gewone escaping behouden
- de originele afbeelding ongemoeid laten

De nieuwe afbeelding moet al als bestand in het project staan, bijvoorbeeld in:

```txt
src/assets/images/processed/
```

## Toonverhouding Bewerken

LWE mag de bronafbeelding niet automatisch croppen om een verhouding af te dwingen. De gebruiker mag wel kiezen hoe de afbeelding in het websitevak getoond wordt.

Gebruik daarvoor een tekstveld in de contentdata met een van deze waarden:

```txt
landscape
square
portrait
```

Voorbeeld:

```njk
<img
  src="{{ section.image.src }}"
  alt="{{ section.image.alt | t(currentLang.code) }}"
  data-image-ratio="{{ section.image.ratio or 'landscape' }}"
  data-edit-src-file="content.json"
  data-edit-src-path="pages.home.sections.0.image.src"
  data-edit-alt-file="content.json"
  data-edit-alt-path="pages.home.sections.0.image.alt.nl"
  data-edit-ratio-file="content.json"
  data-edit-ratio-path="pages.home.sections.0.image.ratio">
```

De LWE editor toont dit als drie simpele keuzes: liggend, vierkant en staand. De CSS bepaalt de zichtbare uitsnede met `object-fit: cover`; het originele bestand blijft ongemoeid.

In de LWE editor kan de gebruiker bij een bewerkbare afbeelding kiezen uit bestaande projectafbeeldingen. De knop `Afbeeldingen verversen` mag alleen de vaste LWE image-pipeline draaien:

```bash
npm run lwe:images -- --preset=general --apply
```

Gebruik hiervoor geen vrij invulbaar terminalcommando in de browser.

Na verversen moet LWE ook de website opnieuw bouwen, zodat nieuw verwerkte afbeeldingen direct in de lokale preview zichtbaar zijn.

Let op: bronafbeeldingen in `project-input/afbeeldingen/` houden hun eigen extensie, zoals `.jpg` of `.png`. De veilige websiteversie in `src/assets/images/processed/` wordt standaard `.webp`, behalve logo's met de logo-preset. Dat is normaal.

De knop `Open afbeeldingenmap` mag alleen de vaste bronmap openen:

```txt
project-input/afbeeldingen/
```

Deze knop krijgt geen vrij pad vanuit de browser. Op macOS opent dit Finder, op Windows Explorer en op Linux de standaard file manager als die beschikbaar is.

## Background-Afbeeldingen

Een CSS `background-image` is vaak niet betrouwbaar aanklikbaar, omdat tekst, knoppen of overlays erboven liggen.

Maak een hero-background daarom niet alleen via CSS bewerkbaar. Voeg ook een kleine edit-proxy toe die alleen in LWE edit-modus zichtbaar wordt.

Voorbeeld:

```njk
<section class="hero" style="background-image: url('{{ page.hero.image }}');">
  <button
    type="button"
    class="lcb-image-edit-proxy"
    data-edit-src-file="content.json"
    data-edit-src-path="pages.home.hero.image">
    Bewerk hero-afbeelding
  </button>

  <h1>{{ page.hero.title }}</h1>
</section>
```

Voor bezoekers is deze knop verborgen. In LWE edit-modus kan de gebruiker de background-afbeelding toch bewust openen en aanpassen.

## Personenfoto's

Voor personenfoto's geldt:

- gebruik `--preset=person`
- gebruik bij voorkeur `--match=naam-of-functie` als de map ook gewone foto's bevat
- vraag akkoord voordat personen herkenbaar gepubliceerd worden
- als de verhouding sterk afwijkt, moet de AI dit melden
- de uiteindelijke uitsnede gebeurt met CSS in de website, niet door het bronbestand te vernietigen

## Publiceren

Publiceer alleen de gebouwde website-output uit `_site/`.

Publiceer niet:

- `project-input/`
- `lwe-image.config.json`
- `scripts/`
- `lcb-context/`
- `lwe-process/`

Verwerkte afbeeldingen die door de website gebruikt worden, komen via 11ty wel mee in `_site/assets/`.
