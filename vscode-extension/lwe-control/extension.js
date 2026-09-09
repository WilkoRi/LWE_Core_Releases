const fs = require("node:fs");
const path = require("node:path");
const vscode = require("vscode");

let panel;
let sidebarView;
let terminal;
let statusBarItem;

const commandMap = {
  install: "npm install",
  next: "npm run lwe:next",
  approve: "npm run lwe:approve",
  build: "npm run build",
  lcb: "npm run lcb",
  preview: "npm run lcb:preview-only",
  images: "npm run lwe:images",
  publish: "npm run lwe:publish-check",
  updateCheck: "npm run lwe:update-check",
  updateInstall: "npm run lwe:update-install -- --apply",
  unapprove: "npm run lwe:unapprove",
  reset: "npm run lwe:reset",
};

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("lweControl.openPanel", () => {
      openPanel(context.extensionUri);
    }),
    vscode.window.registerWebviewViewProvider("lweControl.sidebar", {
      resolveWebviewView(webviewView) {
        sidebarView = webviewView;
        setupWebview(webviewView.webview, context.extensionUri);
        webviewView.webview.html = renderPanel(readProjectInfo(), { compact: true });
        webviewView.onDidDispose(() => {
          sidebarView = undefined;
        });
      },
    })
  );

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 80);
  statusBarItem.text = "$(tools) LWE";
  statusBarItem.tooltip = "Open LWE Control Panel";
  statusBarItem.command = "lweControl.openPanel";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(refreshAll),
    vscode.window.onDidChangeActiveTextEditor(refreshAll)
  );
}

function deactivate() {}

function openPanel(extensionUri) {
  if (panel) {
    panel.reveal(vscode.ViewColumn.One);
    refreshPanel();
    return;
  }

  panel = vscode.window.createWebviewPanel(
    "lweControl",
    "LWE Control",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [extensionUri],
      retainContextWhenHidden: true,
    }
  );

  panel.onDidDispose(() => {
    panel = undefined;
  });

  setupWebview(panel.webview, extensionUri);
  refreshPanel();
}

function setupWebview(webview, extensionUri) {
  webview.options = {
    enableScripts: true,
    localResourceRoots: [extensionUri],
  };

  webview.onDidReceiveMessage(async (message) => {
    if (!message || typeof message.type !== "string") {
      return;
    }

    if (message.type === "run") {
      await runNamedCommand(message.name);
      return;
    }

    if (message.type === "startAiConversation") {
      await startAiConversation();
      return;
    }

    if (message.type === "stop") {
      stopApplication();
      return;
    }

    if (message.type === "openFile") {
      await openProjectFile(message.file);
      return;
    }

    if (message.type === "openUrl") {
      await openProjectUrl(message.path);
      return;
    }

    if (message.type === "createProject") {
      await createProject();
      return;
    }

    if (message.type === "refresh") {
      refreshAll();
      return;
    }

    if (message.type === "openCommandPanel") {
      await vscode.commands.executeCommand("lweControl.openPanel");
    }
  });
}

function refreshPanel() {
  if (!panel) {
    return;
  }

  const project = readProjectInfo();
  panel.webview.html = renderPanel(project);
}

function refreshSidebar() {
  if (!sidebarView) {
    return;
  }

  sidebarView.webview.html = renderPanel(readProjectInfo(), { compact: true });
}

function refreshAll() {
  refreshPanel();
  refreshSidebar();
}

function workspaceRoot() {
  const folder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
  return folder ? folder.uri.fsPath : "";
}

function readJsonIfExists(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readProjectInfo() {
  const root = workspaceRoot();
  const config = root ? readJsonIfExists(path.join(root, "lcb.config.json"), {}) : {};
  const state = root ? readJsonIfExists(path.join(root, "lwe-process", "state.json"), {}) : {};
  const version = root ? readJsonIfExists(path.join(root, "lwe-process", "version.json"), {}) : {};
  const intakePath = root ? path.join(root, "project-input", "website-intake.json") : "";
  const hasPackageJson = root ? fs.existsSync(path.join(root, "package.json")) : false;
  const hasLcbConfig = root ? fs.existsSync(path.join(root, "lcb.config.json")) : false;
  const port = Number(config.port || 8082);
  const startPath = normalizeSitePath(config.startPath || "/");
  const demoPath = normalizeSitePath(config.demoPath || "/");
  const editPrefix = normalizePrefix(config.editPrefix || "/__lcb");

  return {
    root,
    folderName: root ? path.basename(root) : "Geen project geopend",
    hasPackageJson,
    hasLcbConfig,
    phase: state.phase || "onbekend",
    approved: Boolean(state.userApprovedBuild),
    intakeComplete: Boolean(state.intakeComplete),
    coreVersion: version.lwe && version.lwe.coreVersion ? version.lwe.coreVersion : "onbekend",
    runtimeVersion: version.lwe && version.lwe.runtimeVersion ? version.lwe.runtimeVersion : "onbekend",
    port,
    startUrl: `http://127.0.0.1:${port}${startPath}`,
    demoUrl: `http://127.0.0.1:${port}${demoPath}`,
    editorUrl: `http://127.0.0.1:${port}${editPrefix}/`,
    demoEditorUrl: `http://127.0.0.1:${port}${editPrefix}/_demo/`,
    intakeExists: intakePath ? fs.existsSync(intakePath) : false,
  };
}

function normalizePrefix(prefix) {
  if (!prefix.startsWith("/")) {
    return `/${prefix}`;
  }

  return prefix.replace(/\/$/, "");
}

function normalizeSitePath(sitePath) {
  if (!sitePath || sitePath === "/") {
    return "/";
  }

  const withLeadingSlash = sitePath.startsWith("/") ? sitePath : `/${sitePath}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

async function runNamedCommand(name) {
  if (!Object.prototype.hasOwnProperty.call(commandMap, name)) {
    vscode.window.showErrorMessage(`Onbekend LWE commando: ${name}`);
    return;
  }

  if (name === "approve") {
    const answer = await vscode.window.showWarningMessage(
      "Dit opent de LWE buildfase. Een AI-assistent mag dit niet namens jou doen. Geef alleen akkoord als jij het voorstel hebt goedgekeurd.",
      { modal: true },
      "Ik geef akkoord"
    );

    if (answer !== "Ik geef akkoord") {
      return;
    }
  }

  if (name === "updateInstall") {
    const answer = await vscode.window.showWarningMessage(
      "LWE controleert en installeert alleen als er een nieuwere stabiele release is. Als je al up-to-date bent, gebeurt er niets. Er wordt eerst een backup gemaakt.",
      { modal: true },
      "Update installeren"
    );

    if (answer !== "Update installeren") {
      return;
    }
  }

  const root = workspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("Open eerst een LWE projectmap in VS Code.");
    return;
  }

  if (!terminal) {
    terminal = vscode.window.createTerminal({
      name: "LWE",
      cwd: root,
    });
  }

  terminal.show();
  terminal.sendText(commandMap[name], true);
  refreshAll();
}

function stopApplication() {
  if (!terminal) {
    vscode.window.showInformationMessage("Er is nog geen LWE terminal gestart vanuit dit paneel.");
    return;
  }

  terminal.show();
  terminal.sendText("\u0003", false);
}

async function startAiConversation() {
  const root = workspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("Open eerst een LWE projectmap in VS Code.");
    return;
  }

  const prompt = [
    "Start AI Conversatie hier.",
    "",
    "Lees eerst AI_START_HERE.md, LCB-AI-INSTRUCTIES.md en de bestanden in lcb-context/.",
    "Draai of gebruik daarna npm run lwe:next als LWE/Copilot-handshake.",
    "Volg de Allowed actions en respecteer de Blocked actions.",
    "Pas geen bestanden aan voordat LWE:next dat toestaat.",
    "De AI mag npm run lwe:approve niet namens de gebruiker uitvoeren.",
    "Gebruik npm run lwe:publish-check voordat er gepubliceerd wordt.",
  ].join("\n");

  await vscode.env.clipboard.writeText(prompt);

  if (fs.existsSync(path.join(root, "AI_START_HERE.md"))) {
    await openProjectFile("AI_START_HERE.md");
  }

  await runNamedCommand("next");
  vscode.window.showInformationMessage("AI-starttekst gekopieerd. Plak die in je nieuwe AI-chat samen met de LWE:next output.");
}

async function createProject() {
  const root = workspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("Open eerst de LWE Core-map in VS Code.");
    return;
  }

  const hasInstaller = fs.existsSync(path.join(root, "install-lcb.js"));
  if (!hasInstaller) {
    vscode.window.showErrorMessage("Deze knop werkt vanuit de LWE Core-map met install-lcb.js.");
    return;
  }

  const projectName = await vscode.window.showInputBox({
    title: "Maak nieuw LWE project",
    prompt: "Naam van de nieuwe projectmap naast deze Core-map.",
    value: "Mijn_Website_Project",
    validateInput(value) {
      if (!value || !value.trim()) {
        return "Vul een projectnaam in.";
      }

      if (!/^[A-Za-z0-9_-]+$/.test(value.trim())) {
        return "Gebruik alleen letters, cijfers, underscore en streepje.";
      }

      return undefined;
    },
  });

  if (!projectName) {
    return;
  }

  if (!terminal) {
    terminal = vscode.window.createTerminal({
      name: "LWE",
      cwd: root,
    });
  }

  terminal.show();
  terminal.sendText(`node install-lcb.js ../${projectName.trim()} --mode new`, true);
}

async function openProjectFile(relativePath) {
  const root = workspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage("Open eerst een LWE projectmap in VS Code.");
    return;
  }

  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    vscode.window.showWarningMessage(`Bestand niet gevonden: ${relativePath}`);
    return;
  }

  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
}

async function openProjectUrl(urlPath) {
  const project = readProjectInfo();
  let url = urlPath;

  if (urlPath === "start") {
    url = project.startUrl;
  } else if (urlPath === "demo") {
    url = project.demoUrl;
  } else if (urlPath === "editor") {
    url = project.editorUrl;
  } else if (urlPath === "demoEditor") {
    url = project.demoEditorUrl;
  }

  await vscode.env.openExternal(vscode.Uri.parse(url));
}

function renderPanel(project, options = {}) {
  const compactClass = options.compact ? " is-compact" : "";
  const statusClass = project.hasLcbConfig ? "ok" : "warn";
  const phaseLabel = escapeHtml(project.phase);
  const approvedLabel = project.approved ? "ja" : "nee";
  const intakeLabel = project.intakeComplete ? "compleet" : "nog controleren";

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      :root {
        color-scheme: light dark;
        --bg: var(--vscode-editor-background);
        --fg: var(--vscode-editor-foreground);
        --muted: var(--vscode-descriptionForeground);
        --line: var(--vscode-panel-border);
        --button: var(--vscode-button-background);
        --button-fg: var(--vscode-button-foreground);
        --secondary: var(--vscode-button-secondaryBackground);
        --secondary-fg: var(--vscode-button-secondaryForeground);
        --danger: var(--vscode-inputValidation-warningBorder);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        padding: 28px;
        background: var(--bg);
        color: var(--fg);
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size);
        line-height: 1.5;
      }

      main {
        max-width: 980px;
        margin: 0 auto;
      }

      header {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--line);
      }

      h1, h2, h3, p { margin-top: 0; }
      h1 { margin-bottom: 8px; font-size: 2rem; line-height: 1.1; }
      h2 { margin-bottom: 12px; font-size: 1.2rem; }
      p { color: var(--muted); }

      .badge {
        display: inline-flex;
        min-height: 28px;
        align-items: center;
        padding: 0 10px;
        border: 1px solid var(--line);
        border-radius: 6px;
        font-weight: 700;
      }

      .badge.ok { border-color: var(--button); }
      .badge.warn { border-color: var(--danger); }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .card {
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      .status-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 18px;
      }

      .stat {
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      .stat span {
        display: block;
        margin-bottom: 4px;
        color: var(--muted);
        font-size: 0.82rem;
      }

      .stat strong {
        display: block;
        overflow-wrap: anywhere;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      button {
        min-height: 34px;
        border: 0;
        border-radius: 6px;
        padding: 0 12px;
        background: var(--button);
        color: var(--button-fg);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .top-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      button.secondary {
        background: var(--secondary);
        color: var(--secondary-fg);
      }

      button.warning {
        outline: 1px solid var(--danger);
      }

      code {
        color: var(--fg);
        overflow-wrap: anywhere;
      }

      .note {
        margin-top: 18px;
        padding: 12px 14px;
        border-left: 3px solid var(--danger);
        background: color-mix(in srgb, var(--danger) 10%, transparent);
      }

      body.is-compact {
        padding: 14px;
      }

      body.is-compact header {
        display: block;
      }

      body.is-compact h1 {
        font-size: 1.45rem;
      }

      body.is-compact .grid,
      body.is-compact .status-grid {
        grid-template-columns: 1fr;
      }

      body.is-compact .card {
        padding: 12px;
      }

      body.is-compact button {
        width: 100%;
      }

      body.is-compact .top-actions button {
        width: auto;
      }

      @media (max-width: 760px) {
        body { padding: 18px; }
        header, .grid, .status-grid { grid-template-columns: 1fr; }
        header { display: block; }
      }
    </style>
  </head>
  <body class="${compactClass.trim()}">
    <main>
      <header>
        <div>
          <h1>Local Website Editor</h1>
          <p>Gebruik dit paneel om LWE-stappen te starten zonder terminalcommando's te onthouden. De commando's blijven zichtbaar in de VS Code terminal.</p>
          <div class="top-actions">
            <button data-start-ai="true">Start AI Conversatie hier!</button>
            <button data-create-project="true">Maak nieuw project</button>
            <button data-run="next">Controleer status</button>
            <button class="secondary" data-url="editor">Open web editor</button>
            <button class="secondary" data-message="openPanel">Groot paneel</button>
          </div>
        </div>
        <span class="badge ${statusClass}">${project.hasLcbConfig ? "LWE project" : "Geen lcb.config.json"}</span>
      </header>

      <section class="status-grid" aria-label="Projectstatus">
        <div class="stat"><span>Map</span><strong>${escapeHtml(project.folderName)}</strong></div>
        <div class="stat"><span>Fase</span><strong>${phaseLabel}</strong></div>
        <div class="stat"><span>Intake</span><strong>${intakeLabel}</strong></div>
        <div class="stat"><span>Akkoord build</span><strong>${approvedLabel}</strong></div>
      </section>

      <section class="grid">
        <article class="card">
          <h2>Proces</h2>
          <p>Controleer eerst de LWE-status. Gebruik daarna intake, voorstel en akkoord in de juiste volgorde.</p>
          <div class="actions">
            <button data-start-ai="true">Start AI Conversatie hier!</button>
            <button data-create-project="true">Maak nieuw project</button>
            <button data-run="next">Controleer status</button>
            <button class="secondary" data-file="project-input/website-intake.json">Open intake</button>
            <button class="warning" data-run="approve">Ik geef akkoord</button>
            <button class="secondary" data-run="unapprove">Terug naar voorstel</button>
            <button class="secondary" data-run="reset">Reset naar intake</button>
          </div>
        </article>

        <article class="card">
          <h2>Bouwen en bekijken</h2>
          <p>Start build en editor vanuit VS Code. Als de guard blokkeert, lees de terminaloutput en volg <code>lwe:next</code>.</p>
          <div class="actions">
            <button data-run="install">NPM install</button>
            <button data-run="build">Build website</button>
            <button data-run="lcb">Start editor</button>
            <button class="secondary" data-stop="true">Stop applicatie</button>
            <button class="secondary" data-run="preview">Preview-only</button>
            <button class="secondary" data-run="images">Check afbeeldingen</button>
          </div>
        </article>

        <article class="card">
          <h2>URLs</h2>
          <p>Open de lokale website of web editor. Zorg dat je eerst Start editor gebruikt om de applicatie te starten.</p>
          <div class="actions">
            <button data-url="start">Open website</button>
            <button data-url="editor">Open web editor</button>
            <button class="secondary" data-url="demo">Open demo</button>
            <button class="secondary" data-url="demoEditor">Open demo editor</button>
          </div>
          <p><code>${escapeHtml(project.editorUrl)}</code></p>
        </article>

        <article class="card">
          <h2>Publicatie</h2>
          <p>Controleer altijd voor upload. Publiceer alleen de inhoud van <code>_site/</code>, nooit de hele projectmap.</p>
          <div class="actions">
            <button data-run="publish">Publicatiecheck</button>
            <button class="secondary" data-file="MANUAL.md">Open Manual als tekst</button>
          </div>
        </article>

        <article class="card">
          <h2>Updates</h2>
          <p>Controleer of er een stabiele LWE-release beschikbaar is. Installeren slaat automatisch over als je al up-to-date bent.</p>
          <div class="actions">
            <button data-run="updateCheck">Update controleren</button>
            <button class="warning" data-run="updateInstall">Update installeren</button>
          </div>
        </article>
      </section>

      <p class="note">Veiligheidsregel: de knop voor akkoord is voor de gebruiker. Een AI-assistent mag die keuze niet namens jou maken.</p>
    </main>

    <script>
      const vscode = acquireVsCodeApi();

      document.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.dataset.run) {
          vscode.postMessage({ type: "run", name: button.dataset.run });
        }

        if (button.dataset.startAi) {
          vscode.postMessage({ type: "startAiConversation" });
        }

        if (button.dataset.stop) {
          vscode.postMessage({ type: "stop" });
        }

        if (button.dataset.file) {
          vscode.postMessage({ type: "openFile", file: button.dataset.file });
        }

        if (button.dataset.url) {
          vscode.postMessage({ type: "openUrl", path: button.dataset.url });
        }

        if (button.dataset.createProject) {
          vscode.postMessage({ type: "createProject" });
        }

        if (button.dataset.message === "openPanel") {
          vscode.postMessage({ type: "openCommandPanel" });
        }
      });
    </script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  activate,
  deactivate,
};
