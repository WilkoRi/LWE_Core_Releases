# Welcome

(This manual text cannot be edited in the Local Website Editor.)

Do not feel like reading the whole manual? Click **Demo** in the menu bar. If this is your first time using LWE, scan this manual first. It explains what you are looking at, which folder you need, and which steps to take.

The demo environment also links back to this manual.

### Use At Your Own Risk

LWE is an open source helper tool. You may use, adapt and improve it, but you remain responsible for what you build, change and publish with it.

Always check the content, behavior, rights for text and images, privacy, cookies, accessibility and any other rules that apply to your website. AI can help, but AI is not the final check.

For existing websites, make a copy first and test there. Publish only after you have checked the website yourself.

## Who Is LWE For?

LWE is for anyone who wants to create or adjust a website in a controlled way, optionally with help from an AI assistant such as Codex, Copilot or ChatGPT.

Can everyone use it? Yes. You only need a few terminal commands. The terminal is the black text window at the bottom of VS Code. For normal use, it does not have to become much more complicated than that.

If you can type these four commands, this manual is enough to get started:

```bash
npm install
npm run lwe:next
npm run build
npm run lcb
```

If you already have some IT, software or website management experience, many parts will feel familiar.

## What Is LWE?

LWE means **Local Website Editor**.

With LWE you create a website on your own computer, or you adapt an existing website. Afterwards the website can be published to a web server so other people can visit it.

During the build you can work with an AI agent. An AI agent can shape pages, distribute content and help decide what belongs on the website. For that we use the intake.

LWE consists of three parts:

- a website project, usually built with the open source tool **11ty**
- a local editor that lets you edit text in the browser
- process control with `npm run lwe:next`, so the AI does not start building without checks

The local addresses are usually:

```txt
Website: http://127.0.0.1:8082/
Editor:  http://127.0.0.1:8082/__lcb/
Manual:  http://127.0.0.1:8082/manual/
```

The product name is **Local Website Editor**. The technical editor route is still called `__lcb`.

## What Do You Need?

You need **Visual Studio Code**, usually called **VS Code**.

VS Code is a free Microsoft program for opening software projects and folders. You use it to:

- open the LWE folder or website project folder
- view files such as `website-intake.json`
- run terminal commands
- let Codex, Copilot or another AI inspect the project

You can download VS Code for free:

```txt
https://code.visualstudio.com/download
```

Install VS Code and always open the correct project folder. This matters: if you open the wrong folder, you may be looking at the Core or demo data while you intended to work on a real website project.

## Install And Start Quickly

First make sure VS Code is installed. Download it for free:

```txt
https://code.visualstudio.com/
```

Then open the right folder in VS Code. To create a new project, open the Core folder, for example `LWE_Core_02`. To edit an existing website, open the website project folder instead.

![VS Code with an opened LWE project folder](/manual_images/01_vsc.jpg)

Open the terminal from the menu:

```txt
Terminal -> New Terminal
```

![Opening the terminal in VS Code](/manual_images/02_vsc.jpg)

Install the LWE Control extension. It gives you buttons for the most important LWE actions, so you do not have to remember every terminal command.

```bash
code --install-extension vscode-extension/dist/lwe-control-0.1.4.vsix --force
```

![Installing the LWE Control extension from the terminal](/manual_images/03_vsc.jpg)

Reload VS Code if needed. After that you will see the LWE entry on the left side or in the status bar. Open the LWE Control Panel.

![LWE Control entry in VS Code](/manual_images/04_vsc.jpg)

If you only want to edit existing text, the short route is:

1. Click **Start editor**.
2. Click **Open web editor**.

![LWE Control Panel with the main buttons](/manual_images/05_vsc.jpg)

The browser opens the local website or web editor. Turn edit mode on with **Zet aan**.

![Local Website Editor in the browser](/manual_images/06_web_lcb.jpg)

Click a text block or simple list. The editor opens a text field where you can change the content.

![Selecting an editable text block](/manual_images/07_web_lcb.jpg)

Change the text and click **Opslaan**. LWE writes the change back to the source data and rebuilds the website as plain HTML in `_site/`.

![Editing and saving text in LWE](/manual_images/08_web_lcb.jpg)

For publishing, upload only the contents of `_site/` to the `public_html` folder or webroot of your hosting provider. Do not upload the whole LWE project folder.

## Two Types Of Folders

LWE works with two types of folders.

1. The Core folder

   For example `LWE_Core_02` or later `LWE_Core_03`.

   This is the toolbox. It contains the demo website and all files needed to create new LWE websites or add LWE to existing websites. Normally you do not build a real website inside the Core.

2. Your website project

   For example `Mijn_Website_Project` or `wild_rabbit_11ty`.

   This is the folder that contains your real website. Here you work with the AI, fill in the intake, build the website, start the preview and use the editor.

## What Am I Looking At?

This is often the confusing part.

When you open `LWE_Core_02`, you also see website files and example content. That is **demo data**. The demo is useful to test whether LWE works, but it is not the website you are building for a client, club or project.

Think of the Core as a toolbox with an example inside it.

When you build something new, always create a separate project folder next to the Core. That project folder starts as a starter and then becomes your real website. In that new folder the AI may build and you can later edit content.

Example:

```txt
projecten/
  LWE_Core_02/          <-- toolbox, not your real website
  Mijn_Website_Project/ <-- your real website project
```

If you convert an existing website, first make a copy if possible. Work in that copy until you are sure everything is correct.

Example:

```txt
wild_rabbit_11ty/       <-- original or active version
wild_rabbit_11ty_test/  <-- safe copy for testing LWE
```

Not sure where you are? Look at the folder name in the top left of VS Code. If it says `LWE_Core_02`, you are in the Core. If it shows your website project name, you are in the right place to work on that website.

## What Are The Folders For?

In an LWE project you often see these folders and files:

| Folder or file | What is it for? | Edit yourself? |
| --- | --- | --- |
| `project-input/` | Everything you provide before the AI builds: intake, documents, photos, logos, old website and notes. | Yes, this is your input area. |
| `project-input/website-intake.json` | The fixed intake. LWE checks whether it is complete enough before the AI may build. | Yes, fill it in together with the AI. |
| `src/` | The real website source. Templates, website data, styles and assets live here. | Preferably via AI or carefully by hand. |
| `src/_data/` | JSON files with manageable website content, such as text, menus, events or settings. | Yes, but carefully. |
| `src/_includes/` | Reusable template parts such as navigation and footer. | Usually not as a regular user. |
| `src/assets/` | Images, CSS, icons and other website assets. | Sometimes, for logos or photos. |
| `_site/` | The generated website output. 11ty creates this from `src/`. | No. Do not edit by hand. |
| `lcb/` | Files for the Local Website Editor itself. | Usually no. |
| `lcb-context/` | Agreements and instructions the AI must read before building. | Only if you improve the LWE process. |
| `lwe-process/` | Process state: intake phase, build phase, approval and checks. | Do not edit manually unless you know exactly what you are doing. |
| `lwe-process/version.json` | Version information for LWE Core and the runtime in this project. | Usually no. Useful for updates. |
| `node_modules/` | Installed technical packages after `npm install`. | No. |
| `package.json` | Project settings and commands such as `npm run build` and `npm run lcb`. | Usually no. |
| `MANUAL.md` | This manual in Dutch. | Yes, if you want to improve the explanation. |
| `MANUAL.en.md` | This manual in English. | Yes, if you want to improve the explanation. |
| `MANUAL.de.md` | This manual in German. | Yes, if you want to improve the explanation. |

The most important split is:

```txt
project-input/ = supplied information and intake
src/           = real website source
_site/         = automatically generated website
```

### Preparing Images

Put original photos and logos in `project-input/afbeeldingen/` first.

LWE can create safe web versions with Sharp:

```bash
npm run lwe:images
```

This is a check first. It does not write files yet.

If the proposal looks right:

```bash
npm run lwe:images -- --apply
```

LWE does not overwrite original images. The web versions are written to a separate `processed` folder, usually:

```txt
src/assets/images/processed/
```

Important:

- logos are not cropped automatically
- photos are reduced by default, not enlarged
- the aspect ratio is preserved
- use photos of people only when there is approval
- if an image must be cropped exactly, discuss that with the AI first

Useful presets:

```bash
npm run lwe:images -- --preset=general
npm run lwe:images -- --preset=hero
npm run lwe:images -- --preset=person
npm run lwe:images -- --preset=logo
```

To test only matching filenames:

```bash
npm run lwe:images -- --preset=hero --match=circuit
npm run lwe:images -- --preset=person --match=chair
```

### Calendar And Events

If your website has a calendar or event list, say in the intake whether past events should be hidden automatically.

LWE does not delete old events from the data. They stay in JSON, but they can automatically disappear from the public website view. An event remains visible through its last event date and disappears the day after.

On normal static hosting this is handled by a small script that is published with the website. That means you do not need to rebuild or upload only because a date has passed.

Use this for normal visitor-facing lists. If you want an archive page with old events, that page can show the same data without this filter.

## This Manual Is Also In Your Project Folder

You can read this manual in the browser, but it also exists as files in the project folder:

```txt
MANUAL.md
MANUAL.en.md
MANUAL.de.md
```

The Core copies these files during installation. That means the same explanation is available in new and existing LWE projects.

In the Core demo and in a new starter project, the manual can also be shown as HTML:

```txt
http://127.0.0.1:8082/manual/
http://127.0.0.1:8082/manual/en/
http://127.0.0.1:8082/manual/de/
```

For an existing production site, the Markdown files are mainly meant as project documentation. Whether a public or local HTML manual page is added depends on the project.

## Editing Text In LWE

LWE uses normal text fields. It deliberately does not use a heavy editor with buttons for bold, italic or HTML.

In the editor, `Enter` simply means: new line. If you leave an empty line between two pieces of text, the website shows that as a new paragraph. This is saved as normal text, not as HTML code.

## Create A New Website

1. Open VS Code.
2. Choose **File / Open Folder** and open `LWE_Core_XX`.
3. Choose **Terminal / New Terminal**.
4. Check that the terminal ends with something like `LWE_Core_02 %` or your Core folder name.

If not, go to the Core folder in the terminal:

```bash
cd /pad/naar/LWE_Core_02
```

To view the manual and demo first, type:

```bash
npm run lcb
```

The system returns something like:

```txt
Start here:     http://127.0.0.1:8082/manual/
Demo website:   http://127.0.0.1:8082/
Website editor: http://127.0.0.1:8082/__lcb/
```

When you are ready, create your new project folder:

```bash
node install-lcb.js ../Mijn_Website_Project --mode new
```

Then open the new project folder in VS Code, not the Core folder.

## Bring An Existing Website To LWE

Start in the Core folder and install LWE into an existing project folder:

```bash
node install-lcb.js ../Mijn_Bestaande_Website --mode existing
```

Then open that website project folder in VS Code.

## Update Existing LWE Projects

The normal future route is through GitHub Releases. The project can check whether a stable LWE update is available:

```bash
npm run lwe:update-check
```

After approval, install the release:

```bash
npm run lwe:update-install -- --apply
```

A release may only replace LWE system files listed in `lwe-release-manifest.json`. Website content, project data, project CSS, templates, `.htaccess`, `project-input/` and `lwe-process/state.json` remain project-owned.

During development you can still update locally from the Core folder. Start with a dry-run:

```bash
npm run lwe:update -- ../Mijn_Bestaande_Website
```

If the plan looks right, apply the update:

```bash
npm run lwe:update -- ../Mijn_Bestaande_Website --apply
```

The update refreshes the LWE runtime, scripts, manuals and context files. Your website source (`src/`), content data (`src/_data/`), project input and `lwe-process/state.json` are preserved. If an old 11ty project is not JSON-ready yet, this is not solved automatically; that remains a separate migration step.

After an update, `npm run lcb` may intentionally be blocked by the new guard. Run `npm run lwe:next` to see what is still needed, or use `npm run lcb:preview-only` if you only want a read-only view of the existing `_site/`.

## First Collect Source Material

Put everything the AI needs in `project-input/`.

Use for example:

- `project-input/documenten/` for text, markdown, exports or notes
- `project-input/afbeeldingen/` for logos and photos
- `project-input/oude-website/` for old HTML, screenshots or exports
- `project-input/online-bronnen.md` for links to existing websites
- `project-input/notities.md` for loose agreements
- `project-input/website-intake.json` for the fixed intake

The AI must read this folder before it makes a design or website proposal.

## Start In A Website Project

Open a terminal in the website project and run:

```bash
npm install
npm run lwe:next
```

`npm run lwe:next` is not an interactive terminal wizard. It shows the current process status for you and the AI.

Paste the output into Copilot, ChatGPT or another AI in VS Code.

## What Should The AI Do Next?

The AI must follow the output from `npm run lwe:next`.

With a new or incomplete intake, the AI should:

- read `LCB-AI-INSTRUCTIES.md`
- read `lcb-context/`
- inspect `project-input/`
- ask at most one intake question at a time
- avoid changing website files

A good first instruction for Copilot is:

```txt
Use the output of npm run lwe:next as the LWE process engine status.
Read LCB-AI-INSTRUCTIES.md, lcb-context/ and project-input/ first.
Ask at most one missing intake question per response.
Do not change website files while LWE blocks edit_files.
```

## Fill In The Intake

The intake file is:

```txt
project-input/website-intake.json
```

Short answers are fine:

- `yes`
- `no`
- `not needed`
- `unknown`
- `I do not know, surprise me`

Leaving a field empty is not an answer. If you have no preference, write that consciously.

## Proposal And Approval

When the intake is complete, the AI must first make a proposal.

It should explain:

- what it understood from the intake
- which pages will be built
- which language or languages will be used
- which colors, logos, images and social media will be used
- which functionality will and will not be built
- what is intentionally left out

Then the AI must explicitly ask:

```txt
Shall I begin?
```

Only after your approval may the build phase open.

## Open The Build Phase

After your approval, you run:

```bash
npm run lwe:approve
npm run build
```

Do not let an AI assistant run `npm run lwe:approve` for you. That command is the human approval button.

`npm run build` has an LWE guard. If the intake is incomplete, the phase is wrong or there is no approval, the build stops.

That is not a bug. That is the point.

If you want to go back because the proposal, intake or scope must change, do not edit `lwe-process/state.json` by hand. Use:

```bash
npm run lwe:unapprove
npm run lwe:reset
```

`npm run lwe:unapprove` goes back to the proposal. `npm run lwe:reset` goes back to the intake.

## Start Website And Editor

After a successful build, start the local website and editor:

```bash
npm run lcb
```

In the Core demo and a new starter project you start at the manual:

```txt
Start here: http://127.0.0.1:8082/manual/
Demo:       http://127.0.0.1:8082/
Editor:     http://127.0.0.1:8082/__lcb/
```

In an existing website, the normal website is usually the start:

```txt
Website: http://127.0.0.1:8082/
Editor:  http://127.0.0.1:8082/__lcb/
```

If you only want to quickly inspect the existing `_site/` without building again, use:

```bash
npm run lcb:preview-only
```

This mode is read-only. Saving in the editor is disabled.

## Review

Check at least:

- is the content correct?
- are the right pages present?
- are logo and images used correctly?
- are the intake colors and style visible?
- does the mobile menu work?
- does the language switcher work?
- are social media links correct?
- is there no demo or placeholder text left?
- can the content be edited in the editor?

Give feedback to the AI. Then let the AI build again and run `npm run lwe:next`.

If the editor says the content file changed in the meantime, refresh the editor page. This prevents two open windows from silently overwriting each other's changes.

## Publish To Hosting

LWE runs locally on your own computer first. Other people cannot automatically see that local website. To make it public, the generated website must be uploaded to your hosting provider.

Think of hosting as a folder on another computer. Many hosting providers call the public folder something like:

```txt
public_html
```

The generated website is local in:

```txt
_site/
```

In simple form, publishing means:

```txt
contents of _site/  ->  public_html at your hosting provider
```

This can happen through FTP, SFTP, a hosting panel, Git, rsync or another upload method. The correct method depends on your hosting provider.

Important:

- normally upload the contents of `_site/`, not the whole LWE project folder
- `project-input/`, `lcb/`, `lwe-process/`, `node_modules/` and AI context usually do not belong on the public web server
- after upload, test pages, images, CSS, language switching and forms
- make a backup before replacing an existing live website

Let LWE check the publishing output first:

```bash
npm run lwe:publish-check
```

If you are unsure, ask the AI for a publishing check for your hosting method before uploading anything.

## Common Situations

### LWE Does Not Ask Questions In The Terminal

Correct. `npm run lwe:next` shows status information. You use that output as an instruction for the AI chat.

### LWE Guard Blocked

Then LWE intentionally stopped the process.

Read the reason in the terminal. Usually one of these is needed:

- complete the intake
- let the AI make a proposal first
- give approval
- run `npm run lwe:approve`
- check unauthorized changes

### Website Opens, Editor Does Not

Check that you use `npm run lcb` and not only a normal 11ty preview.

The editor should be here:

```txt
http://127.0.0.1:8082/__lcb/
```

### Port 8082 Is In Use

Use another port:

```bash
PORT=8083 npm run lcb
```

Or find the process:

```bash
lsof -i :8082
```

The important number is the `PID`. If the PID is `2135`, you can inspect it with:

```bash
lsof -nP -p 2135
```

Only stop a process if you are sure you no longer need it. Often using another port is safer.

To stop it:

```bash
kill 2135
```

## Short Order

For a new website:

```bash
cd /pad/naar/LWE_Core_02
node install-lcb.js ../Mijn_Website_Project --mode new
```

Open `Mijn_Website_Project` in VS Code.

```bash
npm install
npm run lwe:next
```

Give the output to the AI. Fill in the intake calmly. Wait for the proposal and the question:

```txt
Shall I begin?
```

After approval:

```bash
npm run lwe:approve
npm run build
npm run lcb
```

## Most Important Rule

LWE is not a button that automatically makes a website.

LWE is a process in which the user, the AI and the process engine work together:

- the user provides input and approval
- the AI reads, asks, proposes and builds
- LWE checks whether the order is correct

When those three keep each other in check, website building stays calmer and more reliable.
