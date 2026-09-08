# Mag Niet / Veiligheidsgrenzen

Deze lijst is bedoeld voor AI-assistenten en gebruikers. LWE is een workflow guard, geen volledige security sandbox. Daarom moeten risicovolle acties expliciet worden vermeden of eerst worden besproken.

## Proces

- Bouw geen echte website in `LWE_Core_XX`; maak of open een aparte websiteprojectmap.
- Pas geen websitebestanden aan als `npm run lwe:next` `edit_files`, `build_site`, `rewrite_content` of `create_pages` blokkeert.
- Omzeil de guard niet met directe buildcommando's zoals `npx eleventy` als LWE de build blokkeert.
- Voer `npm run lwe:approve` niet namens de gebruiker uit. Dit commando is de menselijke akkoordknop.
- Pas `lwe-process/state.json` niet rechtstreeks aan. Processtatus is machine-owned en loopt via LWE-commando's.

## Publiceren

- Upload niet de hele LWE-projectmap naar `public_html`.
- Upload normaal alleen de inhoud van `_site/` naar de publieke hostingmap.
- Publiceer normaal geen `project-input/`, `lcb/`, `lwe-process/`, `lcb-context/`, `scripts/`, `node_modules/`, `server.js`, `lcb-server.js`, `.env`, AI-instructies of lokale notities.
- Sla `npm run lwe:publish-check` niet over als de gebruiker wil publiceren.
- Maak bij een bestaande live website eerst een backup.

## Code En Templates

- Gebruik geen `| safe` op JSON-content, intake-content, editorcontent of andere gebruikersinput.
- Gebruik `| safe` alleen voor vooraf gecontroleerde system-content, met expliciete reden.
- Gebruik geen `innerHTML` voor content uit JSON, intake, editorvelden of externe bronnen.
- Gebruik geen `dangerouslySetInnerHTML`, `eval()` of `new Function()` zonder expliciete veiligheidsreview.
- Voeg geen schrijfbare API-route toe zonder duidelijke validatie en toegangscontrole.
- Schrijf niet naar willekeurige bestandspaden vanuit editor- of gebruikersinput.

## Content

- Laat geen demo-, placeholder- of migratietekst ongemerkt staan op een echte website.
- Gebruik `data-lwe-system` niet om gewone bezoekerstekst buiten JSON te houden.
- Gebruik geen personenfoto's zonder expliciet akkoord.
- Gebruik geen screenshots zonder expliciet akkoord als daar gevoelige informatie op kan staan.
- Laat meertalige taalwissels niet terugvallen naar de homepage als er een overeenkomstige pagina bestaat.

Als een risicopatroon toch nodig lijkt, stop dan en leg kort uit:

1. waar het patroon staat;
2. waarom het nodig is;
3. waarom het veilig is;
4. welke alternatieven zijn overwogen.
