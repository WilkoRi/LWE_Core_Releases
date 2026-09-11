# LWE Handleiding

LWE is geen programma zoals Word en er is geen aparte app nodig.

Je start de website-editor vanuit de projectmap met een paar commando's. Daarna gebruik je de editor gewoon in je browser.

## 1. Node.js installeren

Installeer eerst Node.js LTS via:

https://nodejs.org/

Kies de normale installer voor Windows of Mac.

Na installatie: sluit CMD/Terminal en open die opnieuw.

Controleer daarna:

```bash
node -v
npm -v
```

Als je versienummers ziet, is Node.js goed geinstalleerd.

## 2. Projectmap openen

De projectmap is de map waar `package.json` in staat.

### Windows

![Windows CMD met LWE startcommando](/manual_images/win_install.jpg)

1. Open de projectmap in Verkenner.
2. Controleer dat je `package.json` ziet.
3. Klik bovenin de adresbalk van Verkenner.
4. Typ:

```cmd
cmd
```

5. Druk op Enter.

Er opent nu een zwart CMD-venster in de juiste map.

Controleer eventueel:

```cmd
dir package.json
```

### Mac

![Mac Terminal met LWE startcommando](/manual_images/mac_install.jpg)

Open Terminal in de projectmap, of sleep de projectmap naar Terminal na `cd `.

Controleer:

```bash
ls package.json
```

Als `package.json` niet gevonden wordt, zit je in de verkeerde map.

## 3. Eerste keer starten

Doe dit eenmalig in de projectmap:

```bash
npm install
```

Daarna starten:

```bash
npm run lcb
```

Laat dit venster openstaan zolang je met de website werkt.

## 4. Editor openen

Open je browser, bijvoorbeeld Edge, Chrome of Safari.

Typ of plak bovenin de adresbalk:

```txt
http://127.0.0.1:8082/__lcb/
```

Dat is de lokale LWE editor.

De gewone website staat hier:

```txt
http://127.0.0.1:8082/
```

## 5. Stoppen

Klik in het CMD/Terminal venster en druk:

```txt
Ctrl + C
```

Op Windows kan gevraagd worden:

```txt
Terminate batch job (Y/N)?
```

Typ dan:

```txt
Y
```

## 6. Als LWE blokkeert

Soms zegt LWE dat er eerst controle nodig is. Draai dan:

```bash
npm run lwe:next
```

Lees de melding.

Als alles klopt en je akkoord bent:

```bash
npm run lwe:approve
npm run lcb
```

## 7. Alleen kijken

Wil je alleen kijken naar de bestaande website zonder opnieuw bouwen of opslaan?

```bash
npm run lcb:preview-only
```

## 8. Publiceren

Voor publicatie:

```bash
npm run build
npm run lwe:publish-check
```

Upload daarna alleen de inhoud van:

```txt
_site/
```

Upload nooit de hele projectmap.

## 9. Belangrijk

Gebruik altijd de projectmap waar `package.json` in staat.

Voor publiceren gebruik je alleen:

```txt
_site/
```

De map `node_modules/` hoef je niet te openen of aan te passen.
