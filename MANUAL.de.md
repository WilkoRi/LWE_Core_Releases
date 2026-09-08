# Willkommen

(Dieser Handbuchtext kann im Local Website Editor nicht bearbeitet werden.)

Keine Lust, das ganze Handbuch zu lesen? Klicke in der Menuleiste auf **Demo**. Wenn du LWE zum ersten Mal verwendest, lies dieses Handbuch kurz durch. Dann weisst du, worauf du schaust, welchen Ordner du brauchst und welche Schritte du machen musst.

In der Demo-Umgebung gibt es auch einen Link zuruck zu diesem Handbuch.

### Nutzung Auf Eigenes Risiko

LWE ist ein Open-Source-Hilfswerkzeug. Du darfst es verwenden, anpassen und verbessern, aber du bleibst selbst verantwortlich fur das, was du damit baust, anderst und veroffentlichst.

Prufe immer selbst Inhalt, Funktion, Rechte an Texten und Bildern, Datenschutz, Cookies, Barrierefreiheit und andere Regeln, die fur deine Website gelten. AI kann helfen, aber AI ist keine Endkontrolle.

Mache bei bestehenden Websites zuerst eine Kopie und teste dort. Veroffentliche erst, wenn du selbst gepruft hast, dass die Website stimmt.

## Fur Wen Ist LWE Gedacht?

LWE ist fur alle gedacht, die schnell und kontrolliert eine Website erstellen oder anpassen wollen, optional mit Hilfe eines AI-Assistenten wie Codex, Copilot oder ChatGPT.

Kann jeder damit arbeiten? Ja. Du brauchst nur einige Befehle im Terminal. Das Terminal ist das schwarze Textfenster unten in VS Code. Fur normale Nutzung muss es kaum komplizierter werden.

Wenn du diese vier Befehle eintippen kannst, kannst du mit diesem Handbuch starten:

```bash
npm install
npm run lwe:next
npm run build
npm run lcb
```

Wenn du schon etwas IT-, Software- oder Website-Erfahrung hast, wird vieles vertraut wirken.

## Was Ist LWE?

LWE bedeutet **Local Website Editor**.

Mit LWE erstellst du eine Website auf deinem eigenen Computer oder passt eine bestehende Website an. Danach kann die Website wieder auf einen Webserver veroffentlicht werden, damit andere Menschen sie besuchen konnen.

Beim Erstellen kannst du mit einem AI-Agenten arbeiten. Ein AI-Agent kann Seiten gestalten, Inhalte verteilen und helfen zu bestimmen, was auf die Website gehort. Dafur verwenden wir die Intake.

LWE besteht aus drei Teilen:

- ein Websiteprojekt, meistens gebaut mit dem Open-Source-Werkzeug **11ty**
- ein lokaler Editor, mit dem du Texte im Browser anpassen kannst
- eine Prozesskontrolle mit `npm run lwe:next`, damit die AI nicht einfach ohne Kontrolle baut

Die lokalen Adressen sind meistens:

```txt
Website: http://127.0.0.1:8082/
Editor:  http://127.0.0.1:8082/__lcb/
Manual:  http://127.0.0.1:8082/manual/
```

Der Produktname ist **Local Website Editor**. Die technische Editorroute heisst noch `__lcb`.

## Was Brauchst Du?

Du brauchst **Visual Studio Code**, meistens **VS Code** genannt.

VS Code ist ein kostenloses Programm von Microsoft zum Offnen von Softwareprojekten und Ordnern. Du verwendest es, um:

- den LWE-Ordner oder Websiteprojektordner zu offnen
- Dateien wie `website-intake.json` anzusehen
- Terminalbefehle auszufuhren
- Codex, Copilot oder eine andere AI mitlesen zu lassen

Du kannst VS Code kostenlos herunterladen:

```txt
https://code.visualstudio.com/download
```

Installiere VS Code und offne danach immer den richtigen Projektordner. Das ist wichtig: Wenn du den falschen Ordner offnest, siehst du vielleicht den Core oder Demo-Daten, obwohl du an einer echten Website arbeiten willst.

## Installieren Und Schnell Starten

Stelle zuerst sicher, dass VS Code installiert ist. Du kannst VS Code kostenlos herunterladen:

```txt
https://code.visualstudio.com/
```

Offne danach in VS Code den richtigen Ordner. Wenn du ein neues Projekt erstellen willst, offne den Core-Ordner, zum Beispiel `LWE_Core_02`. Wenn du eine bestehende Website bearbeiten willst, offne stattdessen den Websiteprojektordner.

![VS Code mit geoffnetem LWE-Projektordner](/manual_images/01_vsc.jpg)

Offne nun das Terminal uber das Menu:

```txt
Terminal -> New Terminal
```

![Terminal in VS Code offnen](/manual_images/02_vsc.jpg)

Installiere danach die LWE Control Erweiterung. Sie gibt dir Schaltflachen fur die wichtigsten LWE-Aktionen, damit du dir nicht alle Terminalbefehle merken musst.

```bash
code --install-extension vscode-extension/dist/lwe-control-0.1.4.vsix --force
```

![LWE Control Erweiterung uber das Terminal installieren](/manual_images/03_vsc.jpg)

Lade VS Code neu, wenn das notig ist. Danach siehst du links oder unten in VS Code den LWE-Einstieg. Offne das LWE Control Panel.

![LWE Control Einstieg in VS Code](/manual_images/04_vsc.jpg)

Wenn du nur bestehende Texte anpassen willst, ist der kurze Weg:

1. Klicke **Start editor**.
2. Klicke **Open web editor**.

![LWE Control Panel mit den wichtigsten Schaltflachen](/manual_images/05_vsc.jpg)

Der Browser offnet die lokale Website oder den Web Editor. Aktiviere den Bearbeitungsmodus mit **Zet aan**.

![Local Website Editor im Browser](/manual_images/06_web_lcb.jpg)

Klicke auf einen Textblock oder eine einfache Liste. Der Editor offnet dann ein Textfeld, in dem du den Inhalt anpassen kannst.

![Einen bearbeitbaren Textblock auswahlen](/manual_images/07_web_lcb.jpg)

Passe den Text an und klicke **Opslaan**. LWE schreibt die Anderung in die Quelldaten zuruck und baut die Website als normales HTML in `_site/`.

![Text in LWE anpassen und speichern](/manual_images/08_web_lcb.jpg)

Zum Veroffentlichen ladst du nur den Inhalt von `_site/` in den `public_html` Ordner oder die Webroot deines Hostingproviders hoch. Lade nicht den ganzen LWE-Projektordner hoch.

## Zwei Arten Von Ordnern

LWE arbeitet mit zwei Arten von Ordnern.

1. Der Core-Ordner

   Zum Beispiel `LWE_Core_02` oder spater `LWE_Core_03`.

   Das ist der Werkzeugkasten. Hier stehen die Demo-Website und alle Dateien, mit denen du neue LWE-Websites erstellen oder bestehende Websites fur LWE vorbereiten kannst. Im Core baust du normalerweise keine echte Website.

2. Dein Websiteprojekt

   Zum Beispiel `Mijn_Website_Project` oder `wild_rabbit_11ty`.

   Das ist der Ordner mit deiner echten Website. Hier arbeitest du mit der AI, fullst die Intake aus, baust die Website, startest die Vorschau und nutzt den Editor.

## Worauf Schaue Ich?

Das ist oft der verwirrendste Teil.

Wenn du `LWE_Core_02` offnest, siehst du auch Website-Dateien und Beispielinhalte. Das sind **Demo-Daten**. Die Demo ist hilfreich, um zu testen, ob LWE funktioniert, aber sie ist nicht die Website, die du fur einen Kunden, Verein oder ein Projekt baust.

Denke an den Core als Werkzeugkasten mit einem Beispiel darin.

Wenn du etwas Neues baust, erstellst du deshalb immer einen separaten Projektordner neben dem Core. Dieser Projektordner startet als Starter und wird danach deine echte Website. In diesem neuen Ordner darf die AI bauen und du kannst spater Inhalte anpassen.

Beispiel:

```txt
projecten/
  LWE_Core_02/          <-- Werkzeugkasten, nicht deine echte Website
  Mijn_Website_Project/ <-- dein echtes Websiteprojekt
```

Wenn du eine bestehende Website umstellen willst, mache wenn moglich zuerst eine Kopie. Arbeite in dieser Kopie, bis du sicher bist, dass alles stimmt.

Beispiel:

```txt
wild_rabbit_11ty/       <-- Original oder aktive Version
wild_rabbit_11ty_test/  <-- sichere Kopie zum Testen von LWE
```

Nicht sicher, wo du bist? Schaue links oben in VS Code auf den geoffneten Ordnernamen. Steht dort `LWE_Core_02`, bist du im Core. Steht dort dein Websiteprojekt, bist du am richtigen Ort.

## Wofur Sind Die Ordner?

In einem LWE-Projekt siehst du oft diese Ordner und Dateien:

| Ordner oder Datei | Wofur ist das? | Selbst anpassen? |
| --- | --- | --- |
| `project-input/` | Alles, was du vor dem Bauen lieferst: Intake, Dokumente, Fotos, Logos, alte Website und Notizen. | Ja, das ist dein Eingabebereich. |
| `project-input/website-intake.json` | Die feste Intake. LWE pruft, ob sie vollstandig genug ist, bevor die AI bauen darf. | Ja, gemeinsam mit der AI ausfullen. |
| `src/` | Die echte Websitequelle. Hier stehen Templates, Website-Daten, Styles und Assets. | Lieber via AI oder bewusst von Hand. |
| `src/_data/` | JSON-Dateien mit verwaltbaren Websiteinhalten, zum Beispiel Texte, Menus, Events oder Einstellungen. | Ja, aber vorsichtig. |
| `src/_includes/` | Wiederverwendbare Template-Teile wie Navigation und Footer. | Meistens nicht als normaler Benutzer. |
| `src/assets/` | Bilder, CSS, Icons und andere Website-Dateien. | Manchmal, zum Beispiel bei Logos oder Fotos. |
| `_site/` | Die generierte Website-Ausgabe. 11ty erstellt diese aus `src/`. | Nein. Nicht von Hand bearbeiten. |
| `lcb/` | Dateien des Local Website Editor selbst. | Normalerweise nein. |
| `lcb-context/` | Absprachen und Anweisungen, die die AI vor dem Bauen lesen muss. | Nur wenn du den LWE-Prozess verbessern willst. |
| `lwe-process/` | Prozessstatus: Intakephase, Buildphase, Freigabe und Kontrollen. | Nicht manuell bearbeiten, ausser du weisst genau, was du tust. |
| `lwe-process/version.json` | Versionsinformation fur LWE Core und die Runtime in diesem Projekt. | Normalerweise nein. Nutzlich fur Updates. |
| `node_modules/` | Installierte technische Pakete nach `npm install`. | Nein. |
| `package.json` | Projekteinstellungen und Befehle wie `npm run build` und `npm run lcb`. | Meistens nein. |
| `MANUAL.md` | Dieses Handbuch auf Niederlandisch. | Ja, wenn du die Erklarung verbessern willst. |
| `MANUAL.en.md` | Dieses Handbuch auf Englisch. | Ja, wenn du die Erklarung verbessern willst. |
| `MANUAL.de.md` | Dieses Handbuch auf Deutsch. | Ja, wenn du die Erklarung verbessern willst. |

Die wichtigste Trennung ist:

```txt
project-input/ = gelieferte Informationen und Intake
src/           = echte Websitequelle
_site/         = automatisch generierte Website
```

### Bilder Vorbereiten

Lege originale Fotos und Logos zuerst in `project-input/afbeeldingen/`.

LWE kann daraus sichere Webversionen mit Sharp erstellen:

```bash
npm run lwe:images
```

Das ist zuerst eine Kontrolle. Es werden noch keine Dateien geschrieben.

Wenn der Vorschlag stimmt:

```bash
npm run lwe:images -- --apply
```

LWE uberschreibt keine Originalbilder. Die Webversionen kommen in einen separaten `processed` Ordner, meistens:

```txt
src/assets/images/processed/
```

Wichtig:

- Logos werden nicht automatisch gecroppt
- Fotos werden standardmassig verkleinert, nicht vergrossert
- das Seitenverhaltnis bleibt erhalten
- Personenfotos nur verwenden, wenn es eine Freigabe gibt
- wenn ein Bild exakt zugeschnitten werden muss, zuerst mit der AI besprechen

Nutzliche Presets:

```bash
npm run lwe:images -- --preset=general
npm run lwe:images -- --preset=hero
npm run lwe:images -- --preset=person
npm run lwe:images -- --preset=logo
```

Um gezielt nach Dateinamen zu testen:

```bash
npm run lwe:images -- --preset=hero --match=circuit
npm run lwe:images -- --preset=person --match=vorsitz
```

### Kalender Und Events

Wenn deine Website einen Kalender oder eine Eventliste hat, gib im Intake an, ob vergangene Events automatisch ausgeblendet werden sollen.

LWE loscht alte Events nicht aus den Daten. Sie bleiben in JSON stehen, konnen aber automatisch aus der offentlichen Website-Ansicht verschwinden. Ein Event bleibt bis einschliesslich zum letzten Eventdatum sichtbar und verschwindet erst am Tag danach.

Bei normalem statischem Hosting macht das ein kleines Script, das mit der Website veroffentlicht wird. Dadurch musst du nicht neu bauen oder hochladen, nur weil ein Datum vorbei ist.

Nutze das fur normale Besucherlisten. Wenn du eine Archivseite mit alten Events willst, kann diese Seite dieselben Daten ohne diesen Filter zeigen.

## Dieses Handbuch Steht Auch Im Projektordner

Du kannst dieses Handbuch im Browser lesen, aber es steht auch als Dateien im Projektordner:

```txt
MANUAL.md
MANUAL.en.md
MANUAL.de.md
```

Der Core kopiert diese Dateien bei der Installation mit. Dadurch ist dieselbe Erklarung auch in neuen und bestehenden LWE-Projekten vorhanden.

In der Core-Demo und in einem neuen Starterprojekt kann das Handbuch auch als HTML gezeigt werden:

```txt
http://127.0.0.1:8082/manual/
http://127.0.0.1:8082/manual/en/
http://127.0.0.1:8082/manual/de/
```

Bei einer bestehenden Produktionssite sind die Markdown-Dateien vor allem als Projektdokumentation gedacht. Ob eine offentliche oder lokale HTML-Handbuchseite dazukommt, hangt vom Projekt ab.

## Text In LWE Bearbeiten

LWE verwendet normale Textfelder. Es gibt bewusst keinen schweren Editor mit Schaltflachen fur fett, kursiv oder HTML.

Im Editor bedeutet `Enter` einfach: neue Zeile. Wenn du zwischen zwei Textstucken eine leere Zeile lasst, zeigt die Website das als neuen Absatz. Gespeichert wird normale Textinformation, kein HTML-Code.

## Neue Website Erstellen

1. Offne VS Code.
2. Wahle **File / Open Folder** und offne `LWE_Core_XX`.
3. Wahle **Terminal / New Terminal**.
4. Prufe, ob das Terminal ungefahr mit `LWE_Core_02 %` oder deinem Core-Ordnernamen endet.

Wenn nicht, gehe im Terminal zum Core-Ordner:

```bash
cd /pad/naar/LWE_Core_02
```

Wenn du zuerst Manual und Demo ansehen willst, tippe:

```bash
npm run lcb
```

Das System gibt etwa dies zuruck:

```txt
Start here:     http://127.0.0.1:8082/manual/
Demo website:   http://127.0.0.1:8082/
Website editor: http://127.0.0.1:8082/__lcb/
```

Wenn du bereit bist, erstelle deinen neuen Projektordner:

```bash
node install-lcb.js ../Mijn_Website_Project --mode new
```

Offne danach nicht den Core-Ordner, sondern den neuen Projektordner in VS Code.

## Bestehende Website Zu LWE Bringen

Starte im Core-Ordner und installiere LWE in einen bestehenden Projektordner:

```bash
node install-lcb.js ../Mijn_Bestaande_Website --mode existing
```

Offne danach diesen Websiteprojektordner in VS Code.

## Bestehende LWE-Projekte Aktualisieren

Der normale zukunftige Weg lauft uber GitHub Releases. Das Projekt kann selbst prufen, ob ein stabiles LWE-Update verfugbar ist:

```bash
npm run lwe:update-check
```

Nach Zustimmung installierst du die Release:

```bash
npm run lwe:update-install -- --apply
```

Eine Release darf nur LWE-Systemdateien ersetzen, die in `lwe-release-manifest.json` stehen. Websitecontent, Projektdaten, Projekt-CSS, Templates, `.htaccess`, `_site/`, `node_modules/`, `project-input/` und `lwe-process/state.json` bleiben im Besitz des Projekts.

`_site/` darf in Core als Demo/Manual-Output vorhanden sein. Bei einem Update eines bestehenden Projekts wird `_site/` nie uberschrieben.

Wahrend der Entwicklung kannst du weiterhin lokal aus dem Core-Ordner aktualisieren. Starte dann mit einem Dry-run:

```bash
npm run lwe:update -- ../Mijn_Bestaande_Website
```

Wenn der Plan stimmt, fuhrst du das Update aus:

```bash
npm run lwe:update -- ../Mijn_Bestaande_Website --apply
```

Das Update erneuert LWE-Runtime, Scripts, Manuals und Kontextdateien. Deine Websitequelle (`src/`), Contentdaten (`src/_data/`), Project-input und `lwe-process/state.json` bleiben erhalten. Wenn ein altes 11ty-Projekt noch nicht JSON-ready ist, wird das nicht automatisch gelost; das bleibt ein separater Migrationsschritt.

Nach einem Update kann `npm run lcb` bewusst durch die neue Guard blockiert werden. Fuhre `npm run lwe:next` aus, um zu sehen, was noch fehlt, oder nutze `npm run lcb:preview-only`, wenn du nur read-only die bestehende `_site/` ansehen willst.

## Zuerst Quellmaterial Sammeln

Lege alles, was die AI braucht, in `project-input/`.

Zum Beispiel:

- `project-input/documenten/` fur Texte, Markdown, Exporte oder Notizen
- `project-input/afbeeldingen/` fur Logos und Fotos
- `project-input/oude-website/` fur altes HTML, Screenshots oder Exporte
- `project-input/online-bronnen.md` fur Links zu bestehenden Websites
- `project-input/notities.md` fur lose Absprachen
- `project-input/website-intake.json` fur die feste Intake

Die AI muss diesen Ordner lesen, bevor sie ein Design oder Website-Angebot macht.

## Start In Einem Websiteprojekt

Offne ein Terminal im Websiteprojekt und fuhre aus:

```bash
npm install
npm run lwe:next
```

`npm run lwe:next` ist kein interaktiver Terminal-Assistent. Es zeigt den aktuellen Prozessstatus fur dich und die AI.

Fuge die Ausgabe in Copilot, ChatGPT oder eine andere AI in VS Code ein.

## Was Soll Die AI Danach Tun?

Die AI muss die Ausgabe von `npm run lwe:next` befolgen.

Bei einer neuen oder unvollstandigen Intake soll die AI:

- zuerst `LCB-AI-INSTRUCTIES.md` lesen
- danach `lcb-context/` lesen
- danach `project-input/` inventarisieren
- maximal eine Intake-Frage pro Antwort stellen
- keine Website-Dateien anpassen

Eine gute erste Anweisung an Copilot ist:

```txt
Use the output of npm run lwe:next as the LWE process engine status.
Read LCB-AI-INSTRUCTIES.md, lcb-context/ and project-input/ first.
Ask at most one missing intake question per response.
Do not change website files while LWE blocks edit_files.
```

## Intake Ausfullen

Die Intake steht hier:

```txt
project-input/website-intake.json
```

Kurze Antworten sind gut:

- `ja`
- `nee`
- `niet nodig`
- `onbekend`
- `ik weet het niet, verras me`

Leer lassen ist keine Antwort. Wenn du keine Praferenz hast, schreibe das bewusst.

## Vorschlag Und Freigabe

Wenn die Intake komplett ist, muss die AI zuerst einen Vorschlag machen.

Darin muss stehen:

- was die AI aus der Intake verstanden hat
- welche Seiten gebaut werden
- welche Sprache oder Sprachen verwendet werden
- welche Farben, Logos, Bilder und Social Media verwendet werden
- welche Funktionalitat gebaut wird und welche nicht
- was bewusst nicht gemacht wird

Danach muss die AI explizit fragen:

```txt
Soll ich anfangen?
```

Erst nach deiner Freigabe darf die Buildphase geoffnet werden.

## Buildphase Offnen

Nach deiner Freigabe fuhrst du selbst aus:

```bash
npm run lwe:approve
npm run build
```

Lass einen AI-Assistenten `npm run lwe:approve` nicht fur dich ausfuhren. Dieser Befehl ist die menschliche Freigabetaste.

`npm run build` hat einen LWE Guard. Wenn die Intake nicht komplett ist, die Phase nicht stimmt oder keine Freigabe vorliegt, stoppt der Build.

Das ist kein Fehler. Das ist Absicht.

Wenn du zuruck willst, weil Vorschlag, Intake oder Scope geandert werden mussen, bearbeite `lwe-process/state.json` nicht von Hand. Verwende:

```bash
npm run lwe:unapprove
npm run lwe:reset
```

`npm run lwe:unapprove` geht zuruck zum Vorschlag. `npm run lwe:reset` geht zuruck zur Intake.

## Website Und Editor Starten

Nach einem erfolgreichen Build startest du lokale Website und Editor:

```bash
npm run lcb
```

In der Core-Demo und in einem neuen Starterprojekt beginnst du beim Manual:

```txt
Start here: http://127.0.0.1:8082/manual/
Demo:       http://127.0.0.1:8082/
Editor:     http://127.0.0.1:8082/__lcb/
```

Bei einer bestehenden Website ist die normale Website meistens der Start:

```txt
Website: http://127.0.0.1:8082/
Editor:  http://127.0.0.1:8082/__lcb/
```

Wenn du nur schnell die bestehende `_site/` ansehen willst, ohne erneut zu bauen, verwende:

```bash
npm run lcb:preview-only
```

Dieser Modus ist read-only. Speichern im Editor ist deaktiviert.

## Review

Prufe mindestens:

- stimmt der Inhalt?
- sind die richtigen Seiten vorhanden?
- stehen Logo und Bilder richtig?
- sind Farben und Stil aus der Intake sichtbar?
- funktioniert das mobile Menu?
- funktioniert der Sprachumschalter?
- stimmen Social-Media-Links?
- ist keine Demo- oder Placeholder-Texte ubrig?
- kann der Inhalt im Editor angepasst werden?

Wenn du Feedback hast, gib es an die AI. Danach lasst du die AI erneut bauen und `npm run lwe:next` ausfuhren.

Wenn der Editor meldet, dass die Content-Datei inzwischen geandert wurde, lade die Editor-Seite neu. So uberschreiben zwei offene Fenster ihre Anderungen nicht unbemerkt.

## Auf Hosting Veroffentlichen

LWE lauft zuerst lokal auf deinem eigenen Computer. Andere Menschen konnen diese lokale Website nicht automatisch sehen. Dafur muss die generierte Website zu deinem Hostingprovider hochgeladen werden.

Denke an Hosting als einen Ordner auf einem anderen Computer. Viele Hostingprovider nennen diesen offentlichen Ordner zum Beispiel:

```txt
public_html
```

Die generierte Website steht lokal in:

```txt
_site/
```

Einfach gesagt bedeutet Veroffentlichen:

```txt
Inhalt von _site/  ->  public_html bei deinem Hostingprovider
```

Das kann uber FTP, SFTP, ein Hostingpanel, Git, rsync oder eine andere Uploadmethode passieren. Welche Methode richtig ist, hangt von deinem Hostingprovider ab.

Wichtig:

- lade normalerweise den Inhalt von `_site/` hoch, nicht den ganzen LWE-Projektordner
- `project-input/`, `lcb/`, `lwe-process/`, `node_modules/` und AI-Kontext gehoren meistens nicht auf den offentlichen Webserver
- teste nach dem Upload Seiten, Bilder, CSS, Sprachwechsel und Formulare
- mache ein Backup, bevor du eine bestehende Live-Website ersetzt

Lass LWE die Publikationsausgabe zuerst prufen:

```bash
npm run lwe:publish-check
```

Wenn du unsicher bist, frage die AI vor dem Upload nach einem Publikationscheck fur deine Hostingmethode.

## Haufige Situationen

### LWE Fragt Nichts Im Terminal

Das stimmt. `npm run lwe:next` zeigt Statusinformationen. Diese Ausgabe verwendest du als Auftrag fur den AI-Chat.

### LWE Guard Blocked

Dann hat LWE den Prozess bewusst gestoppt.

Lies den Grund im Terminal. Meistens ist eines davon notig:

- Intake weiter ausfullen
- AI zuerst einen Vorschlag machen lassen
- Freigabe geben
- `npm run lwe:approve` ausfuhren
- unerlaubte Anderungen kontrollieren

### Website Offnet, Editor Nicht

Prufe, ob du `npm run lcb` verwendest und nicht nur eine normale 11ty-Vorschau.

Der Editor gehort hierhin:

```txt
http://127.0.0.1:8082/__lcb/
```

### Port 8082 Ist Belegt

Verwende einen anderen Port:

```bash
PORT=8083 npm run lcb
```

Oder finde den Prozess:

```bash
lsof -i :8082
```

Die wichtigste Zahl ist die `PID`. Wenn die PID `2135` ist, kannst du sie so prufen:

```bash
lsof -nP -p 2135
```

Stoppe einen Prozess nur, wenn du sicher bist, dass du ihn nicht mehr brauchst. Oft ist ein anderer Port sicherer.

Zum Stoppen:

```bash
kill 2135
```

## Kurze Reihenfolge

Fur eine neue Website:

```bash
cd /pad/naar/LWE_Core_02
node install-lcb.js ../Mijn_Website_Project --mode new
```

Offne `Mijn_Website_Project` in VS Code.

```bash
npm install
npm run lwe:next
```

Gib die Ausgabe an die AI. Fulle die Intake ruhig aus. Warte auf den Vorschlag und die Frage:

```txt
Soll ich anfangen?
```

Nach Freigabe:

```bash
npm run lwe:approve
npm run build
npm run lcb
```

## Wichtigste Regel

LWE ist kein Knopf, der automatisch eine Website macht.

LWE ist ein Prozess, in dem Benutzer, AI und Process Engine zusammenarbeiten:

- der Benutzer liefert Input und Freigabe
- die AI liest, fragt, schlagt vor und baut
- LWE pruft, ob die Reihenfolge stimmt

Wenn diese drei einander sauber kontrollieren, bleibt Websitebau ruhiger und zuverlassiger.
