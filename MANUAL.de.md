# LWE Handbuch

LWE ist kein Programm wie Word und es wird keine separate App benoetigt.

Du startest den Website-Editor aus dem Projektordner mit ein paar Befehlen. Danach benutzt du den Editor einfach im Browser.

## 1. Node.js installieren

Installiere zuerst Node.js LTS von:

https://nodejs.org/

Waehle den normalen Installer fuer Windows oder Mac.

Nach der Installation: CMD/Terminal schliessen und wieder neu oeffnen.

Dann pruefen:

```bash
node -v
npm -v
```

Wenn Versionsnummern angezeigt werden, ist Node.js richtig installiert.

## 2. Projektordner oeffnen

Der Projektordner ist der Ordner, in dem `package.json` steht.

### Windows

![Windows CMD mit LWE Startbefehl](/manual_images/win_install.jpg)

1. Oeffne den Projektordner im Explorer.
2. Pruefe, ob du `package.json` siehst.
3. Klicke oben in die Adressleiste vom Explorer.
4. Tippe:

```cmd
cmd
```

5. Druecke Enter.

Jetzt oeffnet sich ein schwarzes CMD-Fenster im richtigen Ordner.

Optional pruefen:

```cmd
dir package.json
```

### Mac

![Mac Terminal mit LWE Startbefehl](/manual_images/mac_install.jpg)

Oeffne Terminal im Projektordner, oder ziehe den Projektordner nach `cd ` in das Terminal-Fenster.

Pruefe:

```bash
ls package.json
```

Wenn `package.json` nicht gefunden wird, bist du im falschen Ordner.

## 3. Zum ersten Mal starten

Fuehre dies einmal im Projektordner aus:

```bash
npm install
```

Danach starten:

```bash
npm run lcb
```

Lass dieses Fenster offen, solange du an der Website arbeitest.

## 4. Editor oeffnen

Oeffne deinen Browser, zum Beispiel Edge, Chrome oder Safari.

Tippe oder fuege dies oben in die Adressleiste ein:

```txt
http://127.0.0.1:8082/__lcb/
```

Das ist der lokale LWE Editor.

Die normale Website steht hier:

```txt
http://127.0.0.1:8082/
```

## 5. Stoppen

Klicke in das CMD/Terminal-Fenster und druecke:

```txt
Ctrl + C
```

Unter Windows kann gefragt werden:

```txt
Terminate batch job (Y/N)?
```

Tippe dann:

```txt
Y
```

## 6. Wenn LWE blockiert

Manchmal sagt LWE, dass zuerst eine Kontrolle noetig ist. Dann ausfuehren:

```bash
npm run lwe:next
```

Lies die Meldung.

Wenn alles stimmt und du einverstanden bist:

```bash
npm run lwe:approve
npm run lcb
```

## 7. Nur ansehen

Willst du nur die bestehende Website ansehen, ohne neu zu bauen oder zu speichern?

```bash
npm run lcb:preview-only
```

## 8. Veroeffentlichen

Vor dem Veroeffentlichen:

```bash
npm run build
npm run lwe:publish-check
```

Danach nur den Inhalt von diesem Ordner hochladen:

```txt
_site/
```

Niemals den ganzen Projektordner hochladen.

## 9. Wichtig

Benutze immer den Projektordner, in dem `package.json` steht.

Zum Veroeffentlichen benutzt du nur:

```txt
_site/
```

Den Ordner `node_modules/` musst du nicht oeffnen oder aendern.
