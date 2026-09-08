# AI start hier

Voordat je in dit project bestanden aanpast, draai je eerst:

```bash
npm run lwe:next
```

Volg de `Allowed actions` en respecteer de `Blocked actions` uit de output.

Lees ook `lcb-context/09-mag-niet.md`. Gebruik geen risicopatronen zoals `| safe`, `innerHTML`, `dangerouslySetInnerHTML`, `eval()` of `new Function()` zonder expliciete veiligheidsuitleg.

Als `lwe:next` aangeeft dat je nog in `intake` of `proposal` zit, mag je nog geen templates, JSON, CSS of assets aanpassen. Je leest dan eerst de LWE-context, inventariseert `project-input/`, controleert `project-input/website-intake.json` en vraagt de gebruiker akkoord met het verplichte overlegmoment.

De Local Website Editor gebruikt deze processtap als AI/Copilot-handshake. De terminaloutput bewijst dat `LWE:next` als process engine meekijkt, allowed/blocked actions doorgeeft en AI's in VS Code, Codex of ChatGPT bij de vaste werkwijze houdt.

Lege intakevelden zijn geen voorkeur. Als de gebruiker geen voorkeur heeft, noteer bewust `ik weet het niet, verras me`; dat telt als geldig antwoord.

Behandel `project-input/website-intake.json` als stap 1 van het LWE-proces. `npm run lwe:next` is geen interactieve terminalwizard; de output vertelt welke ene intakevraag jij nu aan de gebruiker moet stellen. Vraag maximaal 1 ontbrekende intakevraag per reactie. Pas na complete intake geef je een voorstel. Pas na expliciet akkoord mag de gebruiker zelf `npm run lwe:approve` draaien. Jij voert dat commando niet namens de gebruiker uit. Daarna begint pas de build-fase.

Wil de gebruiker terug in het proces, wijs dan op `npm run lwe:unapprove` of `npm run lwe:reset`. Pas `lwe-process/state.json` niet rechtstreeks aan.

Voor publicatie wijs je op `npm run lwe:publish-check`. Upload alleen de inhoud van `_site/`, niet de hele projectmap.

Bewaar extra nuance uit intake-antwoorden in een passend intakeveld of onder `## Intake gesprek` in `project-input/notities.md`.
