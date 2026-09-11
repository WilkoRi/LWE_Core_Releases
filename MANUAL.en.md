# LWE Manual

LWE is not a program like Word and no separate app is needed.

You start the website editor from the project folder with a few commands. After that, you use the editor in your browser.

## 1. Install Node.js

First install Node.js LTS from:

https://nodejs.org/

Choose the normal installer for Windows or Mac.

After installation: close CMD/Terminal and open it again.

Then check:

```bash
node -v
npm -v
```

If you see version numbers, Node.js is installed correctly.

## 2. Open the project folder

The project folder is the folder that contains `package.json`.

### Windows

![Windows CMD with LWE start command](/manual_images/win_install.jpg)

1. Open the project folder in File Explorer.
2. Check that you can see `package.json`.
3. Click the address bar at the top of File Explorer.
4. Type:

```cmd
cmd
```

5. Press Enter.

A black CMD window now opens in the correct folder.

Optional check:

```cmd
dir package.json
```

### Mac

![Mac Terminal with LWE start command](/manual_images/mac_install.jpg)

Open Terminal in the project folder, or drag the project folder into Terminal after typing `cd `.

Check:

```bash
ls package.json
```

If `package.json` is not found, you are in the wrong folder.

## 3. Start for the first time

Run this once in the project folder:

```bash
npm install
```

Then start:

```bash
npm run lcb
```

Keep this window open while you work on the website.

## 4. Open the editor

Open your browser, for example Edge, Chrome or Safari.

Type or paste this in the address bar:

```txt
http://127.0.0.1:8082/__lcb/
```

This is the local LWE editor.

The normal website is here:

```txt
http://127.0.0.1:8082/
```

## 5. Stop

Click in the CMD/Terminal window and press:

```txt
Ctrl + C
```

On Windows you may see:

```txt
Terminate batch job (Y/N)?
```

Then type:

```txt
Y
```

## 6. If LWE blocks

Sometimes LWE says a check is needed first. Then run:

```bash
npm run lwe:next
```

Read the message.

If everything is correct and you approve:

```bash
npm run lwe:approve
npm run lcb
```

## 7. Preview only

Do you only want to view the existing website without rebuilding or saving?

```bash
npm run lcb:preview-only
```

## 8. Publish

Before publishing:

```bash
npm run build
npm run lwe:publish-check
```

Then upload only the contents of:

```txt
_site/
```

Never upload the whole project folder.

## 9. Important

Always use the project folder that contains `package.json`.

For publishing you only use:

```txt
_site/
```

You do not need to open or change the `node_modules/` folder.
