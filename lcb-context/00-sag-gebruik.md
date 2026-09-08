# SAG gebruik

SAG betekent hier: Static Augmented Generation.

De huidige Local Website Editor gebruikt geen technische RAG-engine. Hij gebruikt een kleine vaste kennisbundel die een AI eerst moet lezen voordat hij gaat bouwen.

Bij echte RAG haalt een systeem dynamisch relevante informatie op uit een grotere kennisbron. Bij SAG ligt een klein, bewust gekozen deel van de informatie statisch klaar in `lcb-context/` en `project-input/`. Dat is sneller, eenvoudiger en beter controleerbaar voor dit prototype.

Een AI mag daarnaast nog steeds relevante projectinhoud ophalen uit de aangeleverde bestanden of bronnen, maar LWE heeft daar geen aparte vector-database of RAG-model voor nodig.

Noem dit daarom `SAG`, `Static Augmented Generation`, `projectcontext` of `vaste kennisbundel`; niet `Mini RAG`, alsof er al automatische retrieval is.

## Doel

De kennisbundel zorgt dat een AI niet alleen code schrijft, maar eerst het werkmodel begrijpt:

- 11ty bouwt de site
- Bootstrap vormt de responsive basis
- JSON bevat beheerbare Content
- Local Website Editor is de lokale beheerlaag
- de publieke site blijft schoon
- `/__lcb/` is de lokale beheerroute
- SEO hoort bij het standaard bouwproces

## Leesvolgorde

Een AI leest minimaal:

1. `LCB-AI-INSTRUCTIES.md`
2. `lcb-context/01-content-structuur.md`
3. `lcb-context/02-template-regels.md`
4. `lcb-context/03-project-afspraken.md`
5. `lcb-context/04-bouwkader-11ty-lcb-bootstrap.md`
6. `lcb-context/05-installatieproces.md`
7. `lcb-context/06-seo-basis.md`
8. `lcb-context/07-bronmateriaal.md`
9. `lcb-context/08-project-start-checklist.md`
10. `lcb-context/09-mag-niet.md`
11. `lcb-context/10-afbeeldingen.md`

Als er een projectcontext bestaat, leest de AI daarna ook:

```txt
project-context/
```

Daarna inventariseert de AI ook:

```txt
project-input/
```

In `project-input/` zet de gebruiker teksten, afbeeldingen, documenten, oude websitebestanden, online bronnen en notities.

## Overlegmoment

Na het lezen van de context begint de AI niet meteen met bouwen.

De AI geeft eerst terug:

```txt
Ik begrijp dat dit project werkt met:
- 11ty
- Bootstrap
- JSON-content
- Local Website Editor als lokale beheerlaag

Ik heb deze LWE-context gelezen:
- ...

Taalkeuze:
- single-language / multi-language
- bij multi-language hoort een zichtbare taalkeuze

Demo/placeholder-content:
- ...

Navigatie/footer:
- centraal nav-component
- centrale footer
- sticky footer bij weinig content

Ik ga nu deze onderdelen aanpassen:
- ...

Ik behandel dit als Content:
- ...

Ik behandel dit als System:
- ...

Ik neem deze SEO-onderdelen mee:
- ...

Ik heb dit bronmateriaal gevonden:
- ...

Ik heb deze afbeeldingen gecontroleerd:
- ...

Zal ik beginnen?
```

Pas na akkoord van de gebruiker voert de AI de wijziging uit.

## Wanneer echte RAG nodig wordt

Echte retrieval wordt pas nuttig als de kennisbasis groot wordt, bijvoorbeeld met veel projecten, componenten en domeinspecifieke regels.

Dan kan deze structuur groeien naar:

```txt
lcb-knowledge/
  core/
  components/
  seo/
  projects/
```

Voor nu is SAG betrouwbaarder en eenvoudiger.
