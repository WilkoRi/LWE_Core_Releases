# lcb2026 installer

Met `install-lcb.js` kun je de Local Website Editor toevoegen aan een nieuw of bestaand 11ty-project.

De Local Website Editor is een lokale beheerlaag voor websitecontent.

`lcb2026` is de project/mapnaam. `lcb` blijft de technische afkorting in bestandsnamen, scripts en routes.

Deze map bevat zowel een demo-site als een installerpakket. De demo-site staat in `src/`. De overdraagbare installer bestaat uit `install-lcb.js`, `server.js`, `lcb/`, `lcb.config.json`, `LCB-AI-INSTRUCTIES.md` en `lcb-context/`.

`project-input/` is de vaste map voor bronmateriaal dat een gebruiker aanlevert.

## Nieuw project

```bash
node install-lcb.js ../nieuwe-site --mode new
cd ../nieuwe-site
npm install
npm run lcb
```

Dit maakt een kleine 11ty + Bootstrap starter met:

- `src/_data/content.json`
- `src/index.njk`
- `src/assets/styles.css`
- `lcb-server.js`
- `lcb/`
- `lcb.config.json`
- AI-contextbestanden
- `project-input/`

## Bestaand 11ty-project

```bash
node install-lcb.js ../wild_rabbit_11ty --mode existing
cd ../wild_rabbit_11ty
npm install
npm run lcb
```

Voor AI-gebruik is dit proces ook vastgelegd in:

```txt
lcb-context/05-installatieproces.md
```

Een AI moet eerst bepalen of de doelmap leeg/nieuw is of al een bestaande 11ty-site bevat. Gebruik `--mode existing` niet om automatisch bestaande templates om te bouwen; dat gebeurt daarna bewust per pagina.

Dit voegt alleen de Local Website Editor-laag toe:

- `lcb-server.js`
- `lcb/editor.js`
- `lcb/lcb-editor.css`
- `lcb.config.json`
- `LCB-AI-INSTRUCTIES.md`
- `lcb-context/`
- `project-input/`
- npm-script `lcb`

Het converteert bestaande templates niet automatisch. Dat is bewust: bestaande sites moeten per pagina gecontroleerd worden om beheerbare Content naar JSON te verplaatsen en correcte `data-edit-path` attributen toe te voegen.

Na installatie is een bestaand project dus nog niet automatisch klaar voor beheer. De editor is beschikbaar, maar bestaande pagina's moeten eerst aan het LCB-contentcontract voldoen.

De Local Website Editor werkt pas op bestaande pagina's nadat:

- de beheerbare Content uit JSON komt
- de template die JSON rendert
- de HTML-elementen correcte `data-edit-file` en `data-edit-path` attributen hebben
- het JSON-bestand in `lcb.config.json` bij `contentFiles` staat

System-teksten hoeven niet bewerkbaar te zijn. Alles wat niet expliciet System is, behandel je als Content.

## Configuratie

De belangrijkste instellingen staan in `lcb.config.json`.

```json
{
  "siteDir": "_site",
  "dataDir": "src/_data",
  "lcbDir": "lcb",
  "editPrefix": "/__lcb",
  "assetPrefix": "/__lcb-assets",
  "contentFiles": ["content.json"],
  "buildCommand": "npm run build",
  "port": 8082
}
```

Voor bestaande projecten hoef je meestal alleen `siteDir`, `dataDir`, `contentFiles` of `buildCommand` aan te passen.

## Belangrijk

Start de Local Website Editor in een geinstalleerd project met:

```bash
npm run lcb
```

De normale website blijft dan bereikbaar op:

```txt
http://127.0.0.1:8082/
```

De editor draait op:

```txt
http://127.0.0.1:8082/__lcb/
```

Alleen de editorroute krijgt de Local Website Editor-toolbar en editor-assets.

Als je `npx @11ty/eleventy --serve` gebruikt, start je alleen Eleventy zelf. Die gebruikt standaard `http://localhost:8080/` en heeft geen Local Website Editor-route.
