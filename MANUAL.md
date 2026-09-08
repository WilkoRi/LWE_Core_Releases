# Welkom

(Deze manualtekst kan niet worden aangepast in de Local Website Editor.)

Ga je alleen teksten aanpassen in een projectmap, kijk dan in het hoofdtuk "Installeren en snel beginnen" Dan weet je waar je naar kijkt, welke map je nodig hebt en welke stappen je moet zetten.

In de Core applicatie staat 1. een demo-omgeving en 2. en in de bstanden ook de manual als .md

### Gebruik Op Eigen Risico

LWE is een open source hulpmiddel. Je mag het gebruiken, aanpassen en verbeteren, maar je blijft zelf verantwoordelijk voor wat je ermee bouwt, wijzigt en publiceert.

Controleer altijd zelf de inhoud, werking, rechten op teksten en afbeeldingen, privacy, cookies, toegankelijkheid en andere regels die voor jouw website gelden. AI kan helpen, maar AI is geen eindcontrole.

Maak bij bestaande websites eerst een kopie en test daarin. Publiceer pas als je zelf hebt gecontroleerd dat de website klopt.

## Voor Wie Is LWE Bedoeld?

LWE is bedoeld voor iedereen die snel en gecontroleerd een website wil maken of aanpassen, eventueel met hulp van een AI-assistent zoals Codex, Copilot of ChatGPT.

Kan iedereen hiermee werken? Ja. Er zijn een paar commando's die je in een terminal intypt. Een terminal is dat zwarte tekstvenster onderin VS Code. Veel ingewikkelder hoeft het voor normaal gebruik niet te worden.

Kun je deze vier commando's intypen, dan kun je met deze manual al aan de slag:

```bash
npm install
npm run lwe:next
npm run build
npm run lcb
```

Heb je al wat IT-, software- of beheerkennis, dan zal veel hiervan herkenbaar zijn.

## Wat Is LWE?

LWE betekent **Local Website Editor**.

Met LWE maak je op je eigen computer een website, of pas je een bestaande website aan. Daarna kan de website terug naar een webserver, zodat andere mensen hem kunnen bezoeken.

Bij het maken kun je gebruikmaken van een AI-agent. Zo'n AI-agent kent veel patronen om een website vorm te geven. Een opdracht als "maak hieronder drie blokken met tekst" kan een AI snel voor je uitwerken. De AI kan ook helpen bepalen wat er op de website moet komen te staan. Daarvoor gebruiken we de intake.

LWE bestaat uit drie dingen:

- een websiteproject, meestal gebouwd met de open source tool **11ty**
- een lokale editor waarmee je teksten in de browser kunt aanpassen
- een procescontrole met `npm run lwe:next`, zodat de AI niet zomaar begint te bouwen

De lokale adressen die je na het commando "npm run lcb" meestal zal krijgen zijn:

```txt
Website: http://127.0.0.1:8082/
Editor:  http://127.0.0.1:8082/__lcb/
Manual:  http://127.0.0.1:8082/manual/
```
Zijn deze adressen op je computer al in gebruik dan helpt LWE je om bv :8083 te gebruiken.


De productnaam is **Local Website Editor**. De technische editorroute heet nog `__lcb`.

## Wat Heb Je Nodig?

Je hebt **Visual Studio Code** nodig. Dat wordt meestal **VS Code** genoemd.

VS Code is een gratis programma van Microsoft om software en projectmappen te openen. Je gebruikt het om:

- de LWE-map of websiteprojectmap te openen
- bestanden zoals `website-intake.json` te bekijken
- terminalcommando's te draaien
- Codex, Copilot of een andere AI mee te laten kijken

Je kunt VS Code gratis downloaden via:

```txt
https://code.visualstudio.com/download
```

Installeer VS Code en open daarna steeds de juiste projectmap. Dat is belangrijk: als je de verkeerde map opent, kijk je misschien naar de Core of demo-data terwijl je eigenlijk aan een websiteproject wilt werken.


## Installeren En Snel Beginnen

Zorg eerst dat VS Code is geinstalleerd. Download VS Code gratis via:

```txt
https://code.visualstudio.com/
```

Open daarna in VS Code de juiste map. Wil je een nieuw project aanmaken, open dan de Core-map, bijvoorbeeld `LWE_Core_02`. Wil je een bestaande website aanpassen, open dan juist de websiteprojectmap.

![VS Code met een geopende LWE projectmap](/manual_images/01_vsc.jpg)

Open nu de terminal via het menu:

```txt
Terminal -> New Terminal
```

![Terminal openen in VS Code](/manual_images/02_vsc.jpg)

Installeer daarna de LWE Control extensie. Die geeft je knoppen voor de belangrijkste LWE-acties, zodat je niet steeds terminalcommando's hoeft te onthouden.

```bash
code --install-extension vscode-extension/dist/lwe-control-0.1.4.vsix --force
```

![LWE Control extensie installeren via de terminal](/manual_images/03_vsc.jpg)

Herlaad VS Code als daarom wordt gevraagd. Daarna zie je links of onderin VS Code de LWE-ingang. Open het LWE Control Panel.

![LWE Control ingang in VS Code](/manual_images/04_vsc.jpg)

Wil je alleen bestaande teksten aanpassen, dan is de korte route:

1. Klik **Start editor**.
2. Klik **Open web editor**.

![LWE Control Panel met de belangrijkste knoppen](/manual_images/05_vsc.jpg)

De browser opent de lokale website of web editor. Zet de edit-modus aan met **Zet aan**.

![Local Website Editor in de browser](/manual_images/06_web_lcb.jpg)

Klik op een tekstblok of eenvoudige opsomming. De editor opent dan een tekstveld waarin je de inhoud kunt aanpassen.

![Een bewerkbaar tekstblok selecteren](/manual_images/07_web_lcb.jpg)

Pas de tekst aan en klik **Opslaan**. LWE schrijft de wijziging terug naar de brondata en bouwt de website opnieuw naar gewone HTML in `_site/`.

![Tekst aanpassen en opslaan in LWE](/manual_images/08_web_lcb.jpg)

Voor publicatie upload je alleen de inhoud van `_site/` naar de `public_html` map of webroot van je hostingprovider. Upload niet de hele LWE-projectmap.


## Twee Soorten Mappen

LWE werkt met twee soorten mappen.

1. De Core-map

   Bijvoorbeeld `LWE_Core_02` of later `LWE_Core_03`.

   Dit is de gereedschapskist. Hier zitten de demo-website en alle bestanden waarmee je nieuwe LWE-websites kunt maken of bestaande websites geschikt kunt maken voor LWE. In de Core bouw je normaal geen echte website.

2. Je websiteproject

   Bijvoorbeeld `Mijn_Website_Project` of `wild_rabbit_11ty`.

   Dit is de map waarin jouw echte website staat. Hier werk je met de AI, vul je de intake in, bouw je de website, start je de preview en gebruik je de editor.

## Waar Kijk Ik Naar?

Dit is vaak het verwarrendste deel.

Als je `LWE_Core_02` opent, zie je ook websitebestanden en voorbeeldcontent. Dat is **demo-data**. Die demo is handig om te testen of LWE werkt, maar het is niet de website die je voor een klant, club of project gaat bouwen.

Denk aan de Core als een gereedschapskist met een voorbeeld erin.

Als je iets nieuws bouwt, maak je daarom altijd een aparte projectmap naast de Core. Die projectmap begint als starter en wordt daarna jouw echte website. In die nieuwe map mag de AI bouwen en kun jij later content aanpassen.

Voorbeeld:

```txt
projecten/
  LWE_Core_02/          <-- gereedschapskist, niet je echte website
  Mijn_Website_Project/ <-- jouw echte websiteproject
```

### Waar Komt De Nieuwe Projectmap Te Staan?

Gewoon naast `LWE_Core_XX`.

### Waarom Een Aparte Projectmap?

- je houdt de Core schoon
- je kunt later opnieuw een website starten
- demo-content raakt niet vermengd met echte projectcontent
- de AI bouwt niet per ongeluk in de gereedschapskist
- je kunt een bestaand project veilig eerst als kopie testen

Als je een bestaande website wilt omzetten, maak dan liefst eerst een kopie van die website. Werk in die kopie totdat je zeker weet dat alles klopt.

Voorbeeld:

```txt
wild_rabbit_11ty/       <-- originele of actieve werkversie
wild_rabbit_11ty_test/  <-- veilige kopie om LWE op te testen
```

Twijfel je waar je bent? Kijk in VS Code linksboven naar de geopende mapnaam. Staat daar `LWE_Core_02`, dan zit je in de Core. Staat daar de naam van je websiteproject, dan zit je goed om aan die website te werken.

## Waar Zijn De Mappen Voor?

In een LWE-project kom je vaak deze mappen en bestanden tegen:

| Map of bestand | Waarvoor is het? | Zelf aanpassen? |
| --- | --- | --- |
| `project-input/` | Alles wat jij aanlevert voordat de AI gaat bouwen: intake, documenten, foto's, logo's, oude website en notities. | Ja, dit is juist jouw aanleverplek. |
| `project-input/website-intake.json` | De vaste intake. LWE controleert of deze voldoende is ingevuld voordat de AI mag bouwen. | Ja, samen met de AI invullen. |
| `src/` | De echte websitebron. Hier staan templates, website-data, styles en assets waaruit de site gebouwd wordt. | Liever via AI of bewust handmatig. Dit verandert de website. |
| `src/_data/` | JSON-bestanden met beheerbare websitecontent, zoals teksten, menu's, evenementen of instellingen. | Ja, maar voorzichtig. De editor en AI gebruiken deze data. |
| `src/_includes/` | Herbruikbare template-onderdelen zoals navigatie en footer. | Meestal niet als gewone gebruiker. |
| `src/assets/` | Beelden, CSS, icons en andere bestanden die de website gebruikt. | Soms, bijvoorbeeld bij logo's of foto's. |
| `_site/` | De gebouwde website-output. Dit is wat 11ty maakt uit `src/`. | Nee. Niet handmatig aanpassen; dit wordt opnieuw gegenereerd. |
| `lcb/` | Bestanden van de Local Website Editor zelf. | Nee, meestal niet. |
| `lcb-context/` | Afspraken en instructies die de AI moet lezen voordat hij bouwt. | Alleen aanpassen als je het LWE-proces wilt verbeteren. |
| `lwe-process/` | Processtatus: intakefase, buildfase, akkoord en controles. | Niet handmatig, behalve als je precies weet wat je doet. |
| `lwe-process/version.json` | Versie-informatie van LWE Core en de runtime in dit project. | Nee, meestal niet. Handig voor updates. |
| `node_modules/` | Geinstalleerde technische pakketten na `npm install`. | Nee. |
| `package.json` | Projectinstellingen en commando's zoals `npm run build` en `npm run lcb`. | Meestal niet als gewone gebruiker. |
| `MANUAL.md` | Deze handleiding in het Nederlands. | Ja, als je de uitleg wilt verbeteren. |
| `MANUAL.en.md` | Deze handleiding in het Engels. | Ja, als je de uitleg wilt verbeteren. |
| `MANUAL.de.md` | Deze handleiding in het Duits. | Ja, als je de uitleg wilt verbeteren. |

De belangrijkste scheiding is:

```txt
project-input/ = aangeleverde informatie en intake
src/           = echte websitebron
_site/         = automatisch gebouwde website
```

### Afbeeldingen Voorbereiden

Zet originele foto's en logo's eerst in `project-input/afbeeldingen/`.

LWE kan daar veilige webversies van maken met Sharp:

```bash
npm run lwe:images
```

Dit is eerst een controle. Er worden dan nog geen bestanden geschreven.

Als het voorstel klopt:

```bash
npm run lwe:images -- --apply
```

LWE overschrijft geen originele afbeeldingen. De webversies komen in een aparte `processed` map, meestal:

```txt
src/assets/images/processed/
```

Belangrijk:

- logo's worden niet automatisch gecropt
- foto's worden standaard verkleind, niet vergroot
- de beeldverhouding blijft behouden
- gebruik personenfoto's alleen als daar akkoord voor is
- als een beeld exact uitgesneden moet worden, overleg dat eerst met de AI

Handige presets:

```bash
npm run lwe:images -- --preset=general
npm run lwe:images -- --preset=hero
npm run lwe:images -- --preset=person
npm run lwe:images -- --preset=logo
```

Wil je gericht testen op bestandsnaam:

```bash
npm run lwe:images -- --preset=hero --match=circuit
npm run lwe:images -- --preset=person --match=voorzitter
```

### Kalender En Events

Heeft je website een kalender of evenementlijst, geef dan in de intake aan of verlopen events automatisch verborgen moeten worden.

LWE verwijdert oude events niet uit de data. Ze blijven in JSON staan, maar kunnen automatisch uit de publieke websiteweergave verdwijnen. Een event blijft zichtbaar tot en met de laatste eventdatum en verdwijnt pas de dag erna.

Bij gewone statische hosting gebeurt dit met een klein script dat met de website mee gaat. Daardoor hoef je niet opnieuw te bouwen of uploaden alleen omdat een datum voorbij is.

Gebruik dit voor gewone bezoekerslijsten. Wil je een archiefpagina met oude events, dan kan die dezelfde data zonder deze filter tonen.

## Deze Manual Staat Ook In Je Projectmap

Je kunt deze manual in de browser lezen, maar hij staat ook als bestand in de projectmap:

```txt
MANUAL.md
MANUAL.en.md
MANUAL.de.md
```

De Core kopieert dit bestand mee bij installatie. Daardoor staat dezelfde uitleg ook in nieuwe en bestaande LWE-projecten.

In de Core-demo en in een nieuw starterproject kan dezelfde manual ook als HTML worden getoond:

```txt
http://127.0.0.1:8082/manual/
http://127.0.0.1:8082/manual/en/
http://127.0.0.1:8082/manual/de/
```

Bij een bestaande productiesite is `MANUAL.md` vooral bedoeld als document in de projectmap. Of er ook een publieke of lokale HTML-pagina voor de manual komt, hangt af van het project. Voor productie wil je meestal geen extra publieke manualpagina toevoegen zonder bewuste keuze.

## Tekst Bewerken In LWE

LWE gebruikt gewone tekstvelden. Er is bewust geen zware teksteditor met knoppen voor vet, cursief of HTML.

In de editor betekent `Enter` gewoon: nieuwe regel. Laat je een lege regel tussen twee stukken tekst, dan ziet de website dat als een nieuwe alinea. Dit wordt opgeslagen als normale tekst, niet als HTML-code.

## Nieuwe Website Maken

1. Open VS Code.
2. Kies **File / Open Folder** en open `LWE_Core_XX`.
3. Kies **Terminal / New Terminal**.
4. Controleer of de terminal onderin ongeveer eindigt op `LWE_Core_02 %` of jouw Core-mapnaam.

Staat dat er niet, ga dan in de terminal naar de Core-map:

```bash
cd /pad/naar/LWE_Core_02
```

Werkt dat niet, vraag dan aan de AI hoe je naar de juiste map gaat. Dat is standaard terminalkennis.

Wil je eerst de manual en demo bekijken, typ dan:

```bash
npm run lcb
```

Het systeem geeft iets terug als:

```txt
Start hier:      http://127.0.0.1:8082/manual/
Demo website:    http://127.0.0.1:8082/
Website editor:  http://127.0.0.1:8082/__lcb/
```

Kopieer de URL naar je browser. Begin met:

```txt
http://127.0.0.1:8082/manual/
```

Ben je klaar met lezen, maak dan je nieuwe projectmap:

```bash
node install-lcb.js ../Mijn_Website_Project --mode new
```

Open daarna niet de Core-map, maar de nieuwe projectmap in VS Code:

```txt
Mijn_Website_Project
```

Vanaf dat moment werk je in het websiteproject.

## Bestaande Website Naar LWE Brengen

Begin in de Core-map en installeer LWE in een bestaande projectmap:

```bash
node install-lcb.js ../Mijn_Bestaande_Website --mode existing
```

Open daarna de bestaande websiteprojectmap in VS Code.

## Bestaande LWE-Projecten Updaten

De normale toekomst-route is via GitHub Releases. Dan controleert het project zelf of er een stabiele LWE-update beschikbaar is:

```bash
npm run lwe:update-check
```

Na akkoord installeer je de release:

```bash
npm run lwe:update-install -- --apply
```

Een release mag alleen LWE-systeembestanden vervangen die in `lwe-release-manifest.json` staan. Websitecontent, projectdata, project-CSS, templates, `.htaccess`, `project-input/` en `lwe-process/state.json` blijven van het project.

Tijdens ontwikkeling kan je ook nog lokaal updaten vanuit de Core-map. Begin dan met een dry-run:

```bash
npm run lwe:update -- ../Mijn_Bestaande_Website
```

Als het plan klopt, voer je de update uit:

```bash
npm run lwe:update -- ../Mijn_Bestaande_Website --apply
```

De update vernieuwt de LWE-runtime, scripts, manuals en contextbestanden. Je websitebron (`src/`), contentdata (`src/_data/`), projectinput en `lwe-process/state.json` blijven behouden. Als een oud 11ty-project nog niet JSON-ready is, wordt dat niet automatisch opgelost; dat is een aparte migratiestap.

Na een update kan `npm run lcb` bewust blokkeren door de nieuwe guard. Gebruik dan `npm run lwe:next` om te zien wat nog nodig is, of `npm run lcb:preview-only` als je alleen read-only naar de bestaande `_site/` wilt kijken.

## Eerst Bronmateriaal Verzamelen

Zet alles wat de AI nodig heeft in `project-input/`.

Gebruik bijvoorbeeld:

- `project-input/documenten/` voor teksten, Word-export, markdown of notities
- `project-input/afbeeldingen/` voor logo's en foto's
- `project-input/oude-website/` voor oude HTML, screenshots of exports
- `project-input/online-bronnen.md` voor links naar bestaande websites
- `project-input/notities.md` voor losse afspraken
- `project-input/website-intake.json` voor de vaste intake

De AI moet deze map eerst lezen voordat er een ontwerp of websitevoorstel komt.

## Start In Een Websiteproject

Open een terminal in het websiteproject en draai:

```bash
npm install
npm run lwe:next
```

`npm run lwe:next` is geen gewone wizard. Het stelt niet zelf vragen in de terminal. Het toont de actuele status voor jou en voor de AI.

Plak of laat deze output lezen door Copilot, ChatGPT of een andere AI in VS Code.

## Wat Moet De AI Daarna Doen?

De AI moet de output van `npm run lwe:next` volgen.

Bij een nieuwe of incomplete intake hoort de AI:

- eerst `LCB-AI-INSTRUCTIES.md` te lezen
- daarna `lcb-context/` te lezen
- daarna `project-input/` te inventariseren
- maximaal 1 intakevraag tegelijk te stellen
- geen websitebestanden aan te passen

Een goede eerste opdracht aan Copilot is:

```txt
Gebruik de output van npm run lwe:next als LWE process engine status.
Lees eerst LCB-AI-INSTRUCTIES.md, lcb-context/ en project-input/.
Stel maximaal 1 ontbrekende intakevraag per reactie.
Pas geen websitebestanden aan zolang LWE edit_files blokkeert.
```

## Intake Invullen

De intake staat in:

```txt
project-input/website-intake.json
```

Je hoeft geen lange verhalen te schrijven. Korte antwoorden zijn goed.

Voorbeelden:

- `ja`
- `nee`
- `niet nodig`
- `onbekend`
- `ik weet het niet, verras me`

Belangrijk: leeg laten is geen antwoord. Als je geen voorkeur hebt, schrijf dan bewust `ik weet het niet, verras me`.

## Voorstel En Akkoord

Als de intake compleet is, moet de AI eerst een voorstel maken.

Daarin moet staan:

- wat de AI uit de intake heeft begrepen
- welke pagina's gebouwd worden
- welke taal of talen gebruikt worden
- welke kleuren, logo's, afbeeldingen en social media worden gebruikt
- welke functionaliteit wel en niet wordt gebouwd
- wat bewust nog niet wordt gedaan

Daarna moet de AI expliciet vragen:

```txt
Zal ik beginnen?
```

Pas als jij akkoord geeft, mag de buildfase open.

## Buildfase Openzetten

Na jouw akkoord draai jij zelf:

```bash
npm run lwe:approve
npm run build
```

Laat een AI-assistent `npm run lwe:approve` niet namens jou uitvoeren. Dat commando is de menselijke akkoordknop.

`npm run build` heeft een LWE guard. Als de intake niet compleet is, de fase nog niet klopt of er geen akkoord is, stopt de build.

Dat is geen fout. Dat is de bedoeling.

Wil je terug omdat je het voorstel, de intake of de scope wilt aanpassen? Gebruik dan niet handmatig `lwe-process/state.json`, maar:

```bash
npm run lwe:unapprove
npm run lwe:reset
```

`npm run lwe:unapprove` gaat terug naar het voorstel. `npm run lwe:reset` gaat terug naar de intake.

## Website En Editor Starten

Na een succesvolle build start je de lokale website en editor:

```bash
npm run lcb
```

Bij de Core-demo en bij een nieuw starterproject begin je bij de manual:

```txt
Start hier: http://127.0.0.1:8082/manual/
Demo:       http://127.0.0.1:8082/
Editor:     http://127.0.0.1:8082/__lcb/
```

Bij een bestaande website is de gewone website meestal de start:

```txt
Website: http://127.0.0.1:8082/
Editor:  http://127.0.0.1:8082/__lcb/
```

Wil je alleen snel kijken naar de bestaande `_site/` zonder opnieuw te bouwen, gebruik dan:

```bash
npm run lcb:preview-only
```

Deze modus is read-only. Opslaan in de editor is dan uitgeschakeld.

## Reviewen

Bekijk de website en controleer minimaal:

- klopt de inhoud?
- zijn de juiste pagina's aanwezig?
- staan logo en afbeeldingen goed?
- zijn kleuren en stijl uit de intake zichtbaar?
- werkt mobiel menu?
- werkt de taalselector?
- staan social media links goed?
- is er geen demo- of placeholdertekst blijven staan?
- kan de content in de editor worden aangepast?

Als je feedback hebt, geef die aan de AI. Laat de AI daarna opnieuw bouwen en `npm run lwe:next` draaien.

Als de editor meldt dat het contentbestand ondertussen is gewijzigd, ververs dan de editorpagina. Dat voorkomt dat twee open vensters elkaars wijzigingen ongemerkt overschrijven.

## Publiceren Naar Hosting

LWE draait eerst lokaal op je eigen computer. Andere mensen kunnen die lokale website niet automatisch zien. Daarvoor moet de gebouwde website naar je hostingprovider.

Denk aan hosting als een map op een andere computer. Veel hostingproviders noemen die publieke map bijvoorbeeld:

```txt
public_html
```

De gebouwde website staat lokaal in:

```txt
_site/
```

In simpele vorm betekent publiceren dus:

```txt
inhoud van _site/  ->  public_html bij je hostingprovider
```

Dat kan via FTP, SFTP, een hostingpaneel, Git, rsync of een andere uploadmethode. Welke methode klopt, hangt af van je hostingprovider.

Belangrijk:

- upload normaal de inhoud van `_site/`, niet de hele LWE-projectmap
- `project-input/`, `lcb/`, `lwe-process/`, `node_modules/` en je AI-context horen meestal niet publiek op de webserver
- test na upload of pagina's, afbeeldingen, CSS, taalwissels en formulieren werken
- maak voor een bestaande live website eerst een backup

Laat LWE eerst controleren wat je gaat publiceren:

```bash
npm run lwe:publish-check
```

Als je twijfelt, vraag de AI om een publicatiecheck voor jouw hostingmethode voordat je iets uploadt.

## Veelvoorkomende Situaties

### LWE Vraagt Niets In De Terminal

Dat klopt. `npm run lwe:next` geeft statusinformatie. Je gebruikt die output als opdracht voor de AI-chat.

### LWE Guard Blocked

Dan heeft LWE het proces bewust gestopt.

Lees de reden in de terminal. Meestal is een van deze dingen nodig:

- intake verder invullen
- AI eerst een voorstel laten maken
- akkoord geven
- `npm run lwe:approve` draaien
- ongeautoriseerde wijzigingen controleren

### Website Opent Wel, Editor Niet

Controleer of je `npm run lcb` gebruikt en niet alleen een gewone 11ty-preview.

De editor hoort op:

```txt
http://127.0.0.1:8082/__lcb/
```

### Poort 8082 Is Bezet

Zie je deze melding?

```txt
Poort 8082 is al in gebruik.
Gebruik tijdelijk een andere poort, bijvoorbeeld: PORT=8083 npm run lcb
Of stop het andere proces dat deze poort gebruikt.
```

Dan draait er waarschijnlijk al een andere LWE-preview, 11ty-preview of server op dezelfde poort.

De snelste oplossing is een andere poort gebruiken:

```bash
PORT=8083 npm run lcb
```

Dan worden de URLs:

```txt
Website: http://127.0.0.1:8083/
Editor:  http://127.0.0.1:8083/__lcb/
```

Wil je weten welk proces poort 8082 gebruikt, dan kun je op Mac gebruiken:

```bash
lsof -i :8082
```

Je ziet dan bijvoorbeeld zoiets:

```txt
COMMAND  PID  USER   FD   TYPE  DEVICE  SIZE/OFF  NODE NAME
node    2135  user   12u  IPv4  ...     0t0       TCP 127.0.0.1:8082 (LISTEN)
```

Het belangrijkste getal is de `PID`. In dit voorbeeld is dat `2135`.

Wil je weten uit welke projectmap dat proces komt, gebruik dan:

```bash
lsof -nP -p 2135
```

Zo kun je bijvoorbeeld zien dat de server uit een andere projectmap draait, zoals `wild_rabbit_11ty`.

Stop alleen een proces als je zeker weet dat je het niet meer nodig hebt. Vaak is een andere poort kiezen genoeg en veiliger.

Als je het proces wilt stoppen, gebruik je:

```bash
kill 2135
```

Daarna kun je opnieuw proberen:

```bash
npm run lcb
```

## De Korte Volgorde

Voor een nieuwe website:

```bash
cd /pad/naar/LWE_Core_02
node install-lcb.js ../Mijn_Website_Project --mode new
```

Open `Mijn_Website_Project` in VS Code.

```bash
npm install
npm run lwe:next
```

Geef de output aan de AI. Vul de intake rustig in. Wacht op het voorstel en de vraag:

```txt
Zal ik beginnen?
```

Na akkoord:

```bash
npm run lwe:approve
npm run build
npm run lcb
```

Open daarna:

```txt
Start hier: http://127.0.0.1:8082/manual/
Website:    http://127.0.0.1:8082/
Editor:     http://127.0.0.1:8082/__lcb/
```

## Belangrijkste Regel

LWE is geen knop die automatisch een website maakt.

LWE is een proces waarin de gebruiker, de AI en de process engine samenwerken:

- de gebruiker levert input en geeft akkoord
- de AI leest, vraagt, stelt voor en bouwt
- LWE controleert of de volgorde klopt

Als die drie elkaar netjes blijven controleren, blijft het bouwen veel rustiger en betrouwbaarder.
