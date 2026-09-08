# Bronmateriaal

Elke website start met bronmateriaal. Gebruik daarvoor de vaste map:

```txt
project-input/
```

Deze map is bedoeld voor alles wat de gebruiker verzamelt voordat de AI een website bouwt of een bestaande site omzet.

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

## Werkwijze voor AI

Voordat een AI een websitevoorstel maakt, inventariseert hij `project-input/`.

De AI maakt eerst een overzicht van:

- ingevulde en ontbrekende antwoorden in `website-intake.json`
- doel van de website en gewenste bezoekersactie
- voorkeuren voor taal, kleur, lettertypen, huisstijl en uitstraling
- gewenste functionaliteit zoals contactformulier, zoeken, agenda, nieuws, inschrijven, meertaligheid en downloads
- social media accounts en of de site moet sturen op volgen of delen
- juridische en organisatorische aandachtspunten die relevant zijn voor dit project
- gevonden teksten
- gevonden afbeeldingen
- gevonden documenten
- gevonden oude websitebestanden
- gevonden online bronnen
- opvallende dubbele informatie
- informatie die verouderd lijkt
- informatie die ontbreekt

Daarna stelt de AI een informatiestructuur voor.

Lege intakevelden tellen als ontbrekend. Als de gebruiker geen voorkeur heeft voor bijvoorbeeld taal, kleur, stijl of pagina's, is `ik weet het niet, verras me` een geldig antwoord. Als een zwaar onderwerp niet relevant is voor het project, noteert de AI bewust `niet nodig` of `niet relevant`.

## Oude website herbouwen

Als `project-input/oude-website/` HTML-bestanden bevat, gebruikt de AI die als lokale bron.

De AI kijkt dan naar:

- paginatitels
- hoofdmenu
- headings
- alinea's
- afbeeldingen
- downloads
- interne links
- externe links
- SEO metadata als die aanwezig is

Daarna bepaalt de AI welke informatie naar de nieuwe JSON-structuur gaat.

## Online informatie gebruiken

Als `project-input/online-bronnen.md` URL's bevat, ziet de AI dit als lijst met mogelijke bronnen.

Gebruik online bronnen alleen als:

- de gebruiker expliciet vraagt om online informatie te gebruiken
- de taak duidelijk gaat over het opnieuw bouwen van een bestaande online website
- actuele informatie nodig is

Bij online bronnen moet de AI:

- bron-URL's bijhouden
- externe links herkennen
- geen grote stukken tekst klakkeloos overnemen zonder controle
- aangeven welke informatie uit welke bron komt
- controleren of lokale bronbestanden voorrang hebben op online bronnen

## Van bronmateriaal naar contentmodel

Bronmateriaal is nog geen websitecontent.

De AI moet eerst bepalen:

- wat Content is
- wat System is
- wat verouderd of dubbel is
- wat op de homepage hoort
- wat een detailpagina nodig heeft
- wat data-gedreven moet worden
- welke SEO-velden nodig zijn

Daarna vraagt de AI akkoord voordat hij JSON en templates maakt.
