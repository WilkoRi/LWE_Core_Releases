# Installatieproces

Dit document beschrijft hoe een AI de Local Website Editor installeert in een nieuw of bestaand 11ty-project.

## Startvraag

Een gebruiker kan bijvoorbeeld vragen:

```txt
Ik heb een lege map gemaakt. Kunnen we hier een website mee bouwen met 11ty, Bootstrap en de Local Website Editor?
```

Of:

```txt
Ik heb een bestaande 11ty-site. Kunnen we deze beheren met de Local Website Editor?
```

De AI moet eerst bepalen of het gaat om:

- een nieuw project
- een bestaand 11ty-project

## Controle voor installatie

Controleer eerst:

- bestaat de doelmap?
- staat er al een `package.json`?
- staat er al een `.eleventy.js` of `eleventy.config.*`?
- bestaat er al een `src/_data` map?
- bestaat er al een `_site` map?
- is het project leeg of bevat het bestaande templates/content?

Gebruik deze controle om te kiezen tussen `--mode new` en `--mode existing`.

## Nieuw project

Gebruik `--mode new` als de map leeg is of als er nog geen website-structuur bestaat.

```bash
node install-lcb.js ../nieuwe-site --mode new
cd ../nieuwe-site
npm install
npm run lcb
```

Dit maakt een nieuwe starter met placeholder-content. Bij een echt project moet die demo/placeholder-content worden vervangen of verwijderd.

Dit maakt een nieuwe starter met:

- 11ty
- Bootstrap in de template
- JSON-contentmodel
- Local Website Editor-server
- Local Website Editor-assets
- AI-context
- een centraal navigatiecomponent
- een centrale footer
- sticky-footer basis-CSS
- taalselector als de starter meertalig is

Daarna zijn er twee URL's:

```txt
http://127.0.0.1:8082/
http://127.0.0.1:8082/__lcb/
```

De snelste manier om te starten staat ook in `project-input/README.md`, zodat de gebruiker de startcommando's terugvindt op de plek waar hij bronmateriaal verzamelt.

Let op: `npx @11ty/eleventy --serve` start alleen de gewone Eleventy-server. Die gebruikt standaard `http://localhost:8080/` en heeft geen Local Website Editor-route. Voor de Local Website Editor gebruik je `npm run lcb`.

## Bestaand project

Gebruik `--mode existing` als er al een 11ty-site bestaat.

```bash
node install-lcb.js ../wild_rabbit_11ty --mode existing
cd ../wild_rabbit_11ty
npm install
npm run lcb
```

Dit installeert alleen de Local Website Editor-laag. Het maakt de bestaande site niet automatisch beheerbaar en ruimt geen bestaande demo- of oude content op.

Dit installeert alleen:

- `lcb-server.js`
- `lcb/`
- `lcb.config.json`
- `LCB-AI-INSTRUCTIES.md`
- `lcb-context/`
- npm-script `lcb`

Belangrijk: bestaande templates worden niet automatisch geconverteerd.

Installatie betekent alleen dat de Local Website Editor beschikbaar is. Een bestaand project is daarna nog niet automatisch beheerbaar.

## Werkingsvoorwaarde bij bestaande projecten

Installeren alleen is niet genoeg om bestaande pagina's bewerkbaar te maken.

De Local Website Editor kan alleen teksten bewerken als aan beide voorwaarden is voldaan:

1. De beheerbare Content-tekst komt uit een JSON-bestand dat in `lcb.config.json` bij `contentFiles` staat.
2. Het HTML-element dat die tekst toont heeft een exact kloppend `data-edit-file` en `data-edit-path`.

Voorbeeld:

```json
{
  "pages": {
    "home": {
      "hero": {
        "title": {
          "nl": "Welkom"
        }
      }
    }
  }
}
```

```njk
<h1
  data-edit-file="content.json"
  data-edit-path="pages.home.hero.title.nl"
>
  {{ content.pages.home.hero.title.nl }}
</h1>
```

Als een bestaande pagina hardcoded tekst bevat, bijvoorbeeld:

```html
<h1>Welkom</h1>
```

dan kan de Local Website Editor die tekst niet opslaan naar JSON. De AI moet die pagina eerst omzetten naar het Local Website Editor-contentcontract.

System-teksten hoeven niet te worden omgezet. Alles wat niet expliciet System is, moet wel naar het contentcontract.

Na installatie moet de AI per pagina bepalen:

1. Welke zichtbare teksten Content zijn.
2. Welke zichtbare teksten System zijn.
3. Welke Content naar JSON moet.
4. Welke JSON-structuur daarvoor nodig is.
5. Welke templates aangepast moeten worden.
6. Welke `data-edit-file` en `data-edit-path` attributen nodig zijn.
7. Of de normale website-output schoon blijft.
8. Of de Local Website Editor-route de content kan bewerken.

Voor bestaande projecten moet de AI voor het omzetten eerst overleggen:

```txt
Ik ga nu deze pagina's omzetten naar JSON + edit-paden:
- ...

Ik behandel dit als Content:
- ...

Ik behandel dit als System:
- ...

Zal ik beginnen?
```

## Wanneer niet automatisch doorgaan

Vraag eerst bevestiging als:

- de bestaande site geen 11ty-project lijkt te zijn
- het project een afwijkende build heeft
- er meerdere contentbronnen zijn
- `package.json` scripts onduidelijk zijn
- bestaande bestanden overschreven zouden worden

Gebruik `--force` alleen als de gebruiker expliciet akkoord is met overschrijven.

## AI-antwoord na installatie

Na installatie meldt de AI kort:

- welke mode gebruikt is
- welke bestanden zijn toegevoegd
- welk npm-script gestart moet worden
- welke URL de normale site toont
- welke URL de Local Website Editor toont
- wat nog per pagina moet worden omgezet
- dat bestaande content pas werkt na JSON + edit-paden
- dat demo/placeholder-content bij een echt project moet worden vervangen
- of het project single-language of multi-language is en of er een taalselector aanwezig is

Voorbeeld:

```txt
Local Website Editor is geinstalleerd in existing-mode.
Start met npm run lcb.
Normale site: http://127.0.0.1:8082/
Editor: http://127.0.0.1:8082/__lcb/

De bestaande templates zijn nog niet automatisch omgezet naar JSON-content.
```
