const { execFile } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = process.cwd();
const defaultConfig = {
  siteDir: "_site",
  dataDir: "src/_data",
  lcbDir: "lcb",
  editPrefix: "/__lcb",
  assetPrefix: "/__lcb-assets",
  contentFiles: ["content.json"],
  buildCommand: "npm run build",
  imageSourceDir: "project-input/afbeeldingen",
  imageOutputDir: "",
  port: 8082,
  startPath: "/",
  demoPath: "/"
};
const config = loadConfig();
const siteDir = path.resolve(root, config.siteDir);
const dataDir = path.resolve(root, config.dataDir);
const lcbDir = path.resolve(root, config.lcbDir);
const port = Number(process.env.PORT || config.port);
const lcbPrefix = normalizePrefix(config.editPrefix);
const lcbAssetPrefix = normalizePrefix(config.assetPrefix);
const startPath = normalizeSitePath(config.startPath || "/");
const demoPath = normalizeSitePath(config.demoPath || "/");
const lcbRootPath = `${lcbPrefix}/_root/`;
const editToken = crypto.randomBytes(32).toString("hex");
const skipBuild = process.env.LWE_SKIP_BUILD === "1" || process.argv.includes("--skip-build");
const localHostnames = new Set(["127.0.0.1", "localhost", "::1"]);
const dangerousPathKeys = new Set(["__proto__", "prototype", "constructor"]);

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

function loadConfig() {
  const configPath = path.join(root, "lcb.config.json");

  if (!fsSync.existsSync(configPath)) {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...JSON.parse(fsSync.readFileSync(configPath, "utf8")),
  };
}

function loadImageConfig() {
  const configPath = path.join(root, "lwe-image.config.json");

  if (!fsSync.existsSync(configPath)) {
    return {};
  }

  return JSON.parse(fsSync.readFileSync(configPath, "utf8"));
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

function resolveLcbPublicPath(lcbPublicPath) {
  const normalized = normalizeSitePath(lcbPublicPath || "/");

  if (normalized === "/_root/") {
    return "/";
  }

  if (normalized === "/_demo/") {
    return demoPath;
  }

  if (normalized === "/_start/") {
    return startPath;
  }

  return lcbPublicPath && lcbPublicPath !== "/" ? lcbPublicPath : startPath;
}

function lcbChrome() {
  return `
    <div class="lcb-toolbar" data-lcb-toolbar>
      <div>
        <strong>LWE edit-modus</strong>
        <span data-lcb-status>Klik op "Zet aan" om tekst te bewerken.</span>
      </div>
      <button type="button" class="lcb-toggle" data-lcb-toggle aria-pressed="false">Zet aan</button>
    </div>

    <aside class="lcb-drawer" data-lcb-drawer aria-hidden="true">
      <div class="lcb-drawer-header">
        <div>
          <span data-lcb-editor-title>Bewerk tekst</span>
          <details class="lcb-technical-info">
            <summary>Technische info</summary>
            <strong data-lcb-path>Geen element gekozen</strong>
          </details>
        </div>
        <button type="button" data-lcb-close aria-label="Sluiten">x</button>
      </div>
      <div data-lcb-text-group>
        <label for="lcb-editor-field" data-lcb-field-label>Tekst</label>
        <textarea id="lcb-editor-field" data-lcb-field rows="8"></textarea>
      </div>
      <div class="lcb-url-field" data-lcb-url-group hidden>
        <label for="lcb-editor-url-field">Link</label>
        <input id="lcb-editor-url-field" data-lcb-url-field type="text" autocomplete="off">
      </div>
      <div class="lcb-url-field" data-lcb-image-src-group hidden>
        <label for="lcb-editor-image-src-field">Afbeelding</label>
        <div class="lcb-image-preview" data-lcb-image-preview-box hidden>
          <img data-lcb-image-preview alt="">
          <span data-lcb-image-preview-caption>Geen afbeelding gekozen</span>
        </div>
        <div class="lcb-image-picker">
          <label for="lcb-editor-image-select">Kies bestaande afbeelding</label>
          <select id="lcb-editor-image-select" data-lcb-image-select></select>
          <button type="button" data-lcb-image-open-folder>Open afbeeldingenmap</button>
          <button type="button" data-lcb-image-refresh>Afbeeldingen verversen</button>
        </div>
        <input id="lcb-editor-image-src-field" data-lcb-image-src-field type="text" autocomplete="off">
      </div>
      <div class="lcb-url-field" data-lcb-image-alt-group hidden>
        <label for="lcb-editor-image-alt-field">Alt-tekst</label>
        <textarea id="lcb-editor-image-alt-field" data-lcb-image-alt-field rows="4"></textarea>
      </div>
      <div class="lcb-url-field" data-lcb-image-ratio-group hidden>
        <label>Verhouding</label>
        <div class="lcb-image-ratio-options" role="group" aria-label="Afbeeldingsverhouding">
          <button type="button" data-lcb-image-ratio-button value="landscape" aria-pressed="false">
            <span class="lcb-ratio-shape is-landscape"></span>
            <span>Liggend</span>
          </button>
          <button type="button" data-lcb-image-ratio-button value="square" aria-pressed="false">
            <span class="lcb-ratio-shape is-square"></span>
            <span>Vierkant</span>
          </button>
          <button type="button" data-lcb-image-ratio-button value="portrait" aria-pressed="false">
            <span class="lcb-ratio-shape is-portrait"></span>
            <span>Staand</span>
          </button>
        </div>
      </div>
      <div class="lcb-actions">
        <button type="button" class="lcb-save" data-lcb-save>Opslaan</button>
        <button type="button" class="lcb-cancel" data-lcb-cancel>Annuleren</button>
      </div>
      <p data-lcb-message></p>
    </aside>
  `;
}

function injectLcb(html) {
  const cssUrl = lcbAssetUrl("lcb-editor.css");
  const editorUrl = lcbAssetUrl("editor.js");

  return html
    .replace("</head>", `    <link rel="stylesheet" href="${cssUrl}">\n  </head>`)
    .replace("<body>", `<body>\n${lcbChrome()}`)
    .replace("</body>", `    <script>window.LCB_CONFIG = ${JSON.stringify({ editPrefix: lcbPrefix, assetPrefix: lcbAssetPrefix, rootEditPath: lcbRootPath, editToken, contentVersions: contentFileVersions() })};</script>\n    <script src="${editorUrl}" defer></script>\n  </body>`);
}

function stripEditorOnlyControls(html) {
  return html.replace(
    /<([a-z][\w:-]*)\b(?=[^>]*\bdata-lcb-only\b)[^>]*>[\s\S]*?<\/\1>/gi,
    ""
  );
}

function lcbAssetUrl(assetName) {
  const filePath = resolveInside(lcbDir, assetName);
  let version = "dev";

  if (filePath && fsSync.existsSync(filePath)) {
    version = hashText(fsSync.readFileSync(filePath, "utf8")).slice(0, 12);
  }

  return `${lcbAssetPrefix}/${assetName}?v=${version}`;
}

function send(response, statusCode, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(body);
}

function createSaveError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function readJsonBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;

    if (body.length > 1_000_000) {
      throw createSaveError(413, "Request is te groot.");
    }
  }

  try {
    return JSON.parse(body);
  } catch {
    throw createSaveError(400, "Ongeldige JSON body.");
  }
}

function parseHostHeader(hostHeader) {
  if (!hostHeader) {
    return { hostname: "", port: "" };
  }

  try {
    const parsed = new URL(`http://${hostHeader}`);
    return {
      hostname: parsed.hostname.replace(/^\[|\]$/g, ""),
      port: parsed.port,
    };
  } catch {
    return {
      hostname: hostHeader.split(":")[0].replace(/^\[|\]$/g, ""),
      port: "",
    };
  }
}

function isLocalHostHeader(hostHeader) {
  const host = parseHostHeader(hostHeader);
  return localHostnames.has(host.hostname) && (!host.port || Number(host.port) === port);
}

function isAllowedOrigin(originHeader) {
  if (!originHeader) {
    return true;
  }

  try {
    const origin = new URL(originHeader);
    const hostname = origin.hostname.replace(/^\[|\]$/g, "");
    const originPort = Number(origin.port || (origin.protocol === "https:" ? 443 : 80));
    return localHostnames.has(hostname) && originPort === port;
  } catch {
    return false;
  }
}

function hasJsonContentType(request) {
  const contentType = request.headers["content-type"] || "";
  return contentType.split(";")[0].trim().toLowerCase() === "application/json";
}

function isValidEditToken(value) {
  if (typeof value !== "string" || value.length !== editToken.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(editToken));
}

function rejectSave(response, statusCode, message) {
  send(response, statusCode, JSON.stringify({ error: message }), "application/json; charset=utf-8");
  return false;
}

function isInsidePath(baseDir, targetPath) {
  const relative = path.relative(baseDir, targetPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function hashText(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function contentFileVersions() {
  const versions = {};

  for (const file of config.contentFiles) {
    const filePath = resolveInside(dataDir, file);
    if (!filePath || !fsSync.existsSync(filePath)) continue;
    versions[file] = hashText(fsSync.readFileSync(filePath, "utf8"));
  }

  return versions;
}

function readContentData(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return JSON.parse(fsSync.readFileSync(filePath, "utf8"));
  }

  if (ext === ".js" || ext === ".cjs") {
    delete require.cache[require.resolve(filePath)];
    const data = require(filePath);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw createSaveError(400, "Alleen JS-datafiles met een object-export zijn LWE-bewerkbaar.");
    }

    return data;
  }

  throw createSaveError(400, "Alleen .json, .js en .cjs contentbestanden zijn toegestaan.");
}

function serializeContentData(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return `${JSON.stringify(content, null, 2)}\n`;
  }

  if (ext === ".js" || ext === ".cjs") {
    return `module.exports = ${JSON.stringify(content, null, 2)};\n`;
  }

  throw createSaveError(400, "Alleen .json, .js en .cjs contentbestanden zijn toegestaan.");
}

function resolveInside(baseDir, unsafeRelativePath) {
  const relativePath = String(unsafeRelativePath || "").replace(/^[/\\]+/, "");
  const targetPath = path.resolve(baseDir, relativePath);
  return isInsidePath(baseDir, targetPath) ? targetPath : null;
}

function validateSaveRequest(request, response) {
  if (!isLocalHostHeader(request.headers.host)) {
    return rejectSave(response, 403, "Ongeldige host voor lokale editor.");
  }

  if (!isAllowedOrigin(request.headers.origin)) {
    return rejectSave(response, 403, "Ongeldige origin voor lokale editor.");
  }

  if (!hasJsonContentType(request)) {
    return rejectSave(response, 415, "Alleen application/json save requests zijn toegestaan.");
  }

  if (!isValidEditToken(request.headers["x-lwe-edit-token"])) {
    return rejectSave(response, 403, "Ongeldige Local Website Editor token.");
  }

  return true;
}

function setByPath(object, editPath, value) {
  const parts = editPath.split(".");

  if (parts.some((part) => !part || dangerousPathKeys.has(part))) {
    throw createSaveError(400, `Ongeldig of onveilig edit-pad: ${editPath}`);
  }

  let cursor = object;

  for (const part of parts.slice(0, -1)) {
    if (!cursor || typeof cursor !== "object" || !Object.prototype.hasOwnProperty.call(cursor, part)) {
      throw createSaveError(400, `Pad bestaat niet: ${editPath}`);
    }

    cursor = cursor[part];
  }

  const lastPart = parts[parts.length - 1];

  if (!cursor || typeof cursor !== "object" || !Object.prototype.hasOwnProperty.call(cursor, lastPart)) {
    throw createSaveError(400, `Veld bestaat niet: ${editPath}`);
  }

  cursor[lastPart] = value;
}

function getByPath(object, editPath) {
  const parts = editPath.split(".");

  if (parts.some((part) => !part || dangerousPathKeys.has(part))) {
    throw createSaveError(400, `Ongeldig of onveilig edit-pad: ${editPath}`);
  }

  let cursor = object;

  for (const part of parts) {
    if (!cursor || typeof cursor !== "object" || !Object.prototype.hasOwnProperty.call(cursor, part)) {
      throw createSaveError(400, `Pad bestaat niet: ${editPath}`);
    }

    cursor = cursor[part];
  }

  if (typeof cursor !== "string") {
    throw createSaveError(400, `Veld is geen tekst: ${editPath}`);
  }

  return cursor;
}

function buildSite() {
  return new Promise((resolve, reject) => {
    let buildCommand;

    try {
      buildCommand = parseBuildCommand(config.buildCommand);
    } catch (error) {
      reject(error);
      return;
    }

    execFile(buildCommand.command, buildCommand.args, commandOptions({ cwd: root }), (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || stdout || error.message));
        return;
      }

      resolve(stdout);
    });
  });
}

function parseBuildCommand(buildCommand) {
  const commandText = String(buildCommand || "").trim();
  const npmRunMatch = commandText.match(/^npm run ([A-Za-z0-9:_-]+)$/);

  if (npmRunMatch) {
    return {
      command: process.platform === "win32" ? "npm.cmd" : "npm",
      args: ["run", npmRunMatch[1]],
    };
  }

  if (commandText === "eleventy") {
    return {
      command: process.platform === "win32" ? "npx.cmd" : "npx",
      args: ["eleventy"],
    };
  }

  throw new Error(`Build command niet toegestaan zonder allowlist: ${commandText}`);
}

function commandOptions(options = {}) {
  return {
    ...options,
    shell: process.platform === "win32",
  };
}

function publicUrlForAsset(sourcePath) {
  const normalized = sourcePath.split(path.sep).join("/");
  const srcAssets = "/src/assets/";
  const rootAssets = "/assets/";
  const siteAssets = "/_site/assets/";

  if (normalized.includes(srcAssets)) {
    return `/assets/${normalized.split(srcAssets)[1]}`;
  }

  if (normalized.includes(siteAssets)) {
    return `/assets/${normalized.split(siteAssets)[1]}`;
  }

  if (normalized.includes(rootAssets)) {
    return `/assets/${normalized.split(rootAssets)[1]}`;
  }

  return "";
}

async function walkImageDirectory(baseDir, results = []) {
  let entries;

  try {
    entries = await fs.readdir(baseDir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const entryPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      await walkImageDirectory(entryPath, results);
      continue;
    }

    if (!entry.isFile() || !imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    const stats = await fs.stat(entryPath);
    const url = publicUrlForAsset(entryPath);

    if (!url) {
      continue;
    }

    results.push({
      name: entry.name,
      url,
      size: stats.size,
    });
  }

  return results;
}

async function listAvailableImages() {
  const candidateDirs = imageOutputDirectories();
  const seenUrls = new Set();
  const images = [];

  for (const dir of candidateDirs) {
    if (!isInsidePath(root, dir) && !isInsidePath(siteDir, dir)) {
      continue;
    }

    const found = await walkImageDirectory(dir);

    for (const image of found) {
      if (seenUrls.has(image.url)) {
        continue;
      }

      seenUrls.add(image.url);
      images.push(image);
    }
  }

  images.sort((a, b) => a.url.localeCompare(b.url));
  return images;
}

function detectDefaultImageOutputDir() {
  if (fsSync.existsSync(path.join(root, "src", "assets"))) {
    return "src/assets/images/processed";
  }

  return "assets/images/processed";
}

function imageOutputDirectories() {
  const imageConfig = loadImageConfig();
  const configuredOutputDir = config.imageOutputDir || imageConfig.outputDir || detectDefaultImageOutputDir();
  const candidates = [
    configuredOutputDir,
    "src/assets/images/processed",
    "assets/images/processed",
    path.join(siteDir, "assets", "images", "processed"),
  ];
  const seen = new Set();
  const directories = [];

  for (const candidate of candidates) {
    const directoryPath = path.isAbsolute(candidate) ? candidate : resolveInside(root, candidate);

    if (!directoryPath || seen.has(directoryPath)) {
      continue;
    }

    seen.add(directoryPath);
    directories.push(directoryPath);
  }

  return directories;
}

function runImageRefresh() {
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const args = ["run", "lwe:images", "--", "--preset=general", "--apply"];

    execFile(
      command,
      args,
      commandOptions({ cwd: root, timeout: 120_000, maxBuffer: 1024 * 1024 * 6 }),
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || stdout || error.message));
          return;
        }

        resolve({ stdout, stderr });
      }
    );
  });
}

function sourceImageDirectory() {
  const imageConfig = loadImageConfig();
  const sourceDir = config.imageSourceDir || imageConfig.sourceDir || "project-input/afbeeldingen";
  return resolveInside(root, sourceDir) || path.join(root, "project-input", "afbeeldingen");
}

function openDirectory(directoryPath) {
  return new Promise((resolve, reject) => {
    let command;
    let args;

    if (process.platform === "darwin") {
      command = "open";
      args = [directoryPath];
    } else if (process.platform === "win32") {
      command = "explorer.exe";
      args = [directoryPath];
    } else {
      command = "xdg-open";
      args = [directoryPath];
    }

    execFile(command, args, { cwd: root, timeout: 15_000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || stdout || error.message));
        return;
      }

      resolve();
    });
  });
}

async function handleImageList(request, response) {
  try {
    if (!validateSaveRequest(request, response)) {
      return;
    }

    await readJsonBody(request);
    const images = await listAvailableImages();

    send(response, 200, JSON.stringify({ ok: true, images }), "application/json; charset=utf-8");
  } catch (error) {
    send(response, error.statusCode || 500, JSON.stringify({ error: error.message }), "application/json; charset=utf-8");
  }
}

async function handleImageRefresh(request, response) {
  try {
    if (!validateSaveRequest(request, response)) {
      return;
    }

    if (skipBuild) {
      send(
        response,
        423,
        JSON.stringify({ error: "Preview-only modus: afbeeldingen verversen is uitgeschakeld. Start normaal met npm run lcb om te bewerken." }),
        "application/json; charset=utf-8"
      );
      return;
    }

    await readJsonBody(request);
    const commandResult = await runImageRefresh();
    await buildSite();
    const images = await listAvailableImages();

    send(response, 200, JSON.stringify({ ok: true, images, output: commandResult.stdout || commandResult.stderr || "" }), "application/json; charset=utf-8");
  } catch (error) {
    send(response, error.statusCode || 500, JSON.stringify({ error: error.message }), "application/json; charset=utf-8");
  }
}

async function handleImageOpenFolder(request, response) {
  try {
    if (!validateSaveRequest(request, response)) {
      return;
    }

    await readJsonBody(request);
    const directoryPath = sourceImageDirectory();

    if (!isInsidePath(root, directoryPath)) {
      send(response, 403, JSON.stringify({ error: "Afbeeldingenmap ligt buiten het project." }), "application/json; charset=utf-8");
      return;
    }

    await fs.mkdir(directoryPath, { recursive: true });
    await openDirectory(directoryPath);

    send(
      response,
      200,
      JSON.stringify({ ok: true, directory: path.relative(root, directoryPath) }),
      "application/json; charset=utf-8"
    );
  } catch (error) {
    send(response, error.statusCode || 500, JSON.stringify({ error: error.message }), "application/json; charset=utf-8");
  }
}

async function handleSave(request, response) {
  try {
    if (!validateSaveRequest(request, response)) {
      return;
    }

    if (skipBuild) {
      send(
        response,
        423,
        JSON.stringify({ error: "Preview-only modus: opslaan is uitgeschakeld. Start normaal met npm run lcb om te bewerken." }),
        "application/json; charset=utf-8"
      );
      return;
    }

    const body = await readJsonBody(request);

    if (!config.contentFiles.includes(body.file)) {
      send(response, 400, JSON.stringify({ error: `Alleen deze bestanden mogen aangepast worden: ${config.contentFiles.join(", ")}` }), "application/json; charset=utf-8");
      return;
    }

    if (!body.path || typeof body.value !== "string") {
      send(response, 400, JSON.stringify({ error: "Ongeldige save payload." }), "application/json; charset=utf-8");
      return;
    }

    const filePath = resolveInside(dataDir, body.file);

    if (!filePath) {
      send(response, 400, JSON.stringify({ error: "Ongeldig contentbestand." }), "application/json; charset=utf-8");
      return;
    }

    const currentFileText = await fs.readFile(filePath, "utf8");
    const currentVersion = hashText(currentFileText);

    if (!body.expectedVersion || body.expectedVersion !== currentVersion) {
      send(
        response,
        409,
        JSON.stringify({
          error: "Dit contentbestand is ondertussen gewijzigd. Ververs de editor en probeer opnieuw.",
          currentVersion,
        }),
        "application/json; charset=utf-8"
      );
      return;
    }

    const content = readContentData(filePath);

    setByPath(content, body.path, body.value);
    const nextFileText = serializeContentData(filePath, content);
    await fs.writeFile(filePath, nextFileText);
    await buildSite();

    send(response, 200, JSON.stringify({ ok: true, version: hashText(nextFileText) }), "application/json; charset=utf-8");
  } catch (error) {
    send(response, error.statusCode || 500, JSON.stringify({ error: error.message }), "application/json; charset=utf-8");
  }
}

async function handleRead(request, response) {
  try {
    if (!validateSaveRequest(request, response)) {
      return;
    }

    const body = await readJsonBody(request);

    if (!config.contentFiles.includes(body.file)) {
      send(response, 400, JSON.stringify({ error: `Alleen deze bestanden mogen gelezen worden: ${config.contentFiles.join(", ")}` }), "application/json; charset=utf-8");
      return;
    }

    if (!body.path || typeof body.path !== "string") {
      send(response, 400, JSON.stringify({ error: "Ongeldige read payload." }), "application/json; charset=utf-8");
      return;
    }

    const filePath = resolveInside(dataDir, body.file);

    if (!filePath) {
      send(response, 400, JSON.stringify({ error: "Ongeldig contentbestand." }), "application/json; charset=utf-8");
      return;
    }

    const currentFileText = await fs.readFile(filePath, "utf8");
    const content = readContentData(filePath);
    const value = getByPath(content, body.path);

    send(
      response,
      200,
      JSON.stringify({ ok: true, value, version: hashText(currentFileText) }),
      "application/json; charset=utf-8"
    );
  } catch (error) {
    send(response, error.statusCode || 500, JSON.stringify({ error: error.message }), "application/json; charset=utf-8");
  }
}

async function serveFile(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestPath = decodeURIComponent(url.pathname);

  if (requestPath === lcbAssetPrefix || requestPath.startsWith(`${lcbAssetPrefix}/`)) {
    await serveLcbAsset(requestPath, response);
    return;
  }

  const isLcbRequest = requestPath === lcbPrefix || requestPath.startsWith(`${lcbPrefix}/`);
  const lcbPublicPath = isLcbRequest ? requestPath.slice(lcbPrefix.length) : "";
  const publicPath = isLcbRequest ? resolveLcbPublicPath(lcbPublicPath) : requestPath;
  const normalizedPath = publicPath.endsWith("/") ? `${publicPath}index.html` : publicPath;
  const filePath = resolveInside(siteDir, normalizedPath);

  if (!filePath) {
    send(response, 403, "Verboden");
    return;
  }

  try {
    let file = await fs.readFile(filePath);
    const ext = path.extname(filePath);

    if (ext === ".html") {
      const html = file.toString("utf8");
      file = Buffer.from(isLcbRequest ? injectLcb(html) : stripEditorOnlyControls(html));
    }

    send(response, 200, file, mimeTypes[ext] || "application/octet-stream");
  } catch (error) {
    if (requestPath === "/assets" || requestPath.startsWith("/assets/")) {
      const served = await serveAssetFallback(requestPath, response);
      if (served) {
        return;
      }
    }

    send(response, 404, "Niet gevonden");
  }
}

async function serveAssetFallback(requestPath, response) {
  const assetPath = requestPath.replace(/^\/assets\/?/, "");

  if (!assetPath) {
    return false;
  }

  const fallbackRoots = [
    path.join(root, "src", "assets"),
    path.join(root, "assets"),
  ];

  for (const fallbackRoot of fallbackRoots) {
    const filePath = resolveInside(fallbackRoot, assetPath);

    if (!filePath) {
      continue;
    }

    try {
      const file = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      send(response, 200, file, mimeTypes[ext] || "application/octet-stream");
      return true;
    } catch {
      // Try the next local asset folder.
    }
  }

  return false;
}

async function serveLcbAsset(requestPath, response) {
  const assetPath = requestPath.slice(lcbAssetPrefix.length).replace(/^\//, "");
  const filePath = resolveInside(lcbDir, assetPath);

  if (!filePath) {
    send(response, 403, "Verboden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    send(response, 200, file, mimeTypes[ext] || "application/octet-stream");
  } catch (error) {
    send(response, 404, "Niet gevonden");
  }
}

function startServer() {
  server.listen(port, "127.0.0.1", () => {
    if (skipBuild) {
      console.log("Preview-only modus: bestaande _site wordt getoond zonder build. Opslaan is uitgeschakeld.");
    }
    console.log(`Start hier:      http://127.0.0.1:${port}${startPath}`);
    if (demoPath !== startPath) {
      console.log(`Demo website:    http://127.0.0.1:${port}${demoPath}`);
      console.log(`Demo editor:     http://127.0.0.1:${port}${lcbPrefix}/_demo/`);
    }
    console.log(`Website editor:  http://127.0.0.1:${port}${lcbPrefix}/`);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/read") {
    handleRead(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/save") {
    handleSave(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/images/list") {
    handleImageList(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/images/refresh") {
    handleImageRefresh(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/images/open-folder") {
    handleImageOpenFolder(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveFile(request, response);
    return;
  }

  send(response, 405, "Methode niet toegestaan");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Poort ${port} is al in gebruik.`);
    console.error(`Gebruik tijdelijk een andere poort, bijvoorbeeld: PORT=${port + 1} npm run lcb`);
    console.error("Of stop het andere proces dat deze poort gebruikt.");
    process.exit(1);
  }

  throw error;
});

if (skipBuild) {
  startServer();
} else {
  buildSite()
    .then(startServer)
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
