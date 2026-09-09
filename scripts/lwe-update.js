#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const sourceRoot = path.resolve(__dirname, "..");
const targetArg = process.argv[2];
const apply = process.argv.includes("--apply");
const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");

function printHelp() {
  console.log(`
LWE update voor bestaande projecten

Gebruik:
  npm run lwe:update -- ../Mijn_Website_Project
  npm run lwe:update -- ../Mijn_Website_Project --apply

Direct:
  node scripts/lwe-update.js ../Mijn_Website_Project
  node scripts/lwe-update.js ../Mijn_Website_Project --apply

Standaard is dit een dry-run. Zonder --apply wordt niets geschreven.
`);
}

if (!targetArg || targetArg.startsWith("--")) {
  printHelp();
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), targetArg);
const backupRoot = path.join(path.dirname(targetDir), "_lwe-backups", path.basename(targetDir), timestamp);
const lweControlRecommendation = "lwe-local.lwe-control";

function readText(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readEleventyInputMode() {
  const candidates = [".eleventy.js", "eleventy.config.js", "eleventy.config.cjs"];
  const configText = candidates
    .map((file) => readText(path.join(targetDir, file)))
    .filter(Boolean)
    .join("\n");

  if (/\binput\s*:\s*["']src["']/.test(configText)) return "src";
  if (/\binput\s*:\s*["']\.["']/.test(configText)) return "root";
  if (fs.existsSync(path.join(targetDir, "src"))) return "src";
  if (fs.existsSync(path.join(targetDir, "_includes")) || fs.existsSync(path.join(targetDir, "_data"))) return "root";
  return "unknown";
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function plannedFileContent(sourceRel, targetRel, runtime) {
  const source = path.join(sourceRoot, sourceRel);
  let content = fs.readFileSync(source, "utf8");

  if ([runtime.next, runtime.approve, runtime.reset].includes(targetRel)) {
    const requiredPath = `./${path.basename(runtime.rules)}`;
    content = content.replace(/require\("\.\/lwe-rules"\)/g, `require("${requiredPath}")`);
  }

  return content;
}

function isBinaryFile(relativePath) {
  return /\.(png|jpe?g|gif|webp|ico|icns|vsix|zip|gz|tar)$/i.test(relativePath);
}

function samePlannedFile(sourceRel, targetRel, runtime) {
  const target = path.join(targetDir, targetRel);
  if (!fs.existsSync(target)) return false;
  if (isBinaryFile(sourceRel) || isBinaryFile(targetRel)) {
    return fs.readFileSync(path.join(sourceRoot, sourceRel)).equals(fs.readFileSync(target));
  }
  return plannedFileContent(sourceRel, targetRel, runtime) === fs.readFileSync(target, "utf8");
}

function backupExisting(relativePath) {
  const source = path.join(targetDir, relativePath);
  if (!fs.existsSync(source)) return;
  const backup = path.join(backupRoot, relativePath);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.copyFileSync(source, backup);
}

function listFiles(dirRel) {
  const dir = path.join(sourceRoot, dirRel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dirRel, entry.name))
    .sort();
}

function listFilesRecursive(dirRel, options = {}) {
  const dir = path.join(sourceRoot, dirRel);
  const ignored = options.ignored || [];
  if (!fs.existsSync(dir)) return [];

  const files = [];
  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name === ".DS_Store") continue;
      const absolute = path.join(currentDir, entry.name);
      const relative = path.relative(sourceRoot, absolute);
      if (ignored.some((pattern) => relative === pattern || relative.startsWith(`${pattern}/`))) {
        continue;
      }
      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile()) {
        files.push(relative);
      }
    }
  }
  walk(dir);
  return files.sort();
}

function latestLweControlVsix() {
  const distDir = path.join(sourceRoot, "vscode-extension", "dist");

  if (!fs.existsSync(distDir)) {
    return "";
  }

  return fs.readdirSync(distDir)
    .filter((file) => /^lwe-control-.+\.vsix$/.test(file))
    .sort()
    .at(-1) || "";
}

function nextVsCodeExtensionsJson() {
  const filePath = path.join(targetDir, ".vscode", "extensions.json");
  const current = readJson(filePath, {});
  const recommendations = Array.isArray(current.recommendations) ? current.recommendations : [];

  if (recommendations.includes(lweControlRecommendation)) {
    return current;
  }

  return {
    ...current,
    recommendations: [...recommendations, lweControlRecommendation],
  };
}

function runtimeFileNames(pkg) {
  const commonJsExt = pkg.type === "module" ? ".cjs" : ".js";

  return {
    server: `lcb-server${commonJsExt}`,
    next: `scripts/lwe-next${commonJsExt}`,
    approve: `scripts/lwe-approve-build${commonJsExt}`,
    reset: `scripts/lwe-reset${commonJsExt}`,
    publishCheck: `scripts/lwe-publish-check${commonJsExt}`,
    images: `scripts/lwe-images${commonJsExt}`,
    rules: `scripts/lwe-rules${commonJsExt}`,
    update: `scripts/lwe-update${commonJsExt}`,
    updateCheck: `scripts/lwe-update-check${commonJsExt}`,
    updateInstall: `scripts/lwe-update-install${commonJsExt}`,
  };
}

function defaultLcbConfig() {
  return {
    siteDir: "_site",
    dataDir: "src/_data",
    lcbDir: "lcb",
    editPrefix: "/__lcb",
    assetPrefix: "/__lcb-assets",
    contentFiles: ["content.json"],
    buildCommand: "npm run build",
    port: 8082,
    startPath: "/",
    demoPath: "/",
  };
}

function initialLweState() {
  return {
    phase: "intake",
    projectType: "unknown",
    languageMode: "unknown",
    userApprovedBuild: false,
    contextRead: false,
    projectInputInventoried: false,
    websiteIntakeChecked: false,
    demoContentChecked: false,
    navFooterChecked: false,
    seoChecked: false,
    assetsChecked: false,
  };
}

function projectInputStarterFiles() {
  return [
    "project-input/README.md",
    "project-input/website-intake.json",
    "project-input/online-bronnen.md",
    "project-input/notities.md",
    "project-input/teksten/.gitkeep",
    "project-input/afbeeldingen/.gitkeep",
    "project-input/documenten/.gitkeep",
    "project-input/oude-website/.gitkeep",
  ];
}

function lweEleventyIgnoreEntries() {
  return [
    "# LWE local tooling - not public website content",
    "LCB-AI-INSTRUCTIES.md",
    "AI_START_HERE.md",
    "MANUAL.md",
    "MANUAL.*.md",
    "lwe-image.config.json",
    "project-input/**",
    "lcb-context/**",
    "lwe-process/**",
    "lwe/**",
    "lcb/**",
    "scripts/lwe-*.js",
    "scripts/lwe-*.cjs",
    ".lwe-backups/**",
    "**/*.bak",
  ];
}

function nextEleventyIgnore() {
  const ignorePath = path.join(targetDir, ".eleventyignore");
  const current = readText(ignorePath, "");
  const lines = current.split(/\r?\n/);
  const nextLines = [...lines];

  for (const entry of lweEleventyIgnoreEntries()) {
    if (!nextLines.includes(entry)) nextLines.push(entry);
  }

  return nextLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function eleventyConfigPath() {
  return [".eleventy.js", "eleventy.config.js", "eleventy.config.cjs"]
    .map((file) => path.join(targetDir, file))
    .find((filePath) => fs.existsSync(filePath)) || "";
}

function stripEditorOnlyTransformSnippet() {
  return `

  // LWE: houd editor-only knoppen uit de platte publicatie-output.
  eleventyConfig.addTransform("lwe-strip-editor-only-controls", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }

    return content.replace(
      /<button\\b(?=[^>]*\\bdata-edit-(?:path|href-path|src-path)=)[\\s\\S]*?<\\/button>/gi,
      ""
    );
  });
`;
}

function nextEleventyConfig(current) {
  if (/lwe-strip-editor-only-controls|strip-editor-only-controls/.test(current)) {
    return current;
  }

  const snippet = stripEditorOnlyTransformSnippet();
  const registerTextIndex = current.indexOf("registerTextFilters(eleventyConfig);");
  if (registerTextIndex !== -1) {
    const insertAt = registerTextIndex + "registerTextFilters(eleventyConfig);".length;
    return `${current.slice(0, insertAt)}${snippet}${current.slice(insertAt)}`;
  }

  const registerCalendarIndex = current.indexOf("registerCalendarFilters(eleventyConfig);");
  if (registerCalendarIndex !== -1) {
    const insertAt = registerCalendarIndex + "registerCalendarFilters(eleventyConfig);".length;
    return `${current.slice(0, insertAt)}${snippet}${current.slice(insertAt)}`;
  }

  const moduleStartMatch = current.match(/module\.exports\s*=\s*function\s*\([^)]*eleventyConfig[^)]*\)\s*\{/);
  if (moduleStartMatch?.index !== undefined) {
    const insertAt = moduleStartMatch.index + moduleStartMatch[0].length;
    return `${current.slice(0, insertAt)}${snippet}${current.slice(insertAt)}`;
  }

  return current;
}

function buildFilePlan(runtime) {
  const files = [
    ["server.js", runtime.server],
    ["lcb/editor.js", "lcb/editor.js"],
    ["lcb/lcb-editor.css", "lcb/lcb-editor.css"],
    ["scripts/lwe-next.js", runtime.next],
    ["scripts/lwe-approve-build.js", runtime.approve],
    ["scripts/lwe-reset.js", runtime.reset],
    ["scripts/lwe-images.js", runtime.images],
    ["scripts/lwe-publish-check.js", runtime.publishCheck],
    ["scripts/lwe-rules.js", runtime.rules],
    ["scripts/lwe-update.js", runtime.update],
    ["scripts/lwe-update-check.js", runtime.updateCheck],
    ["scripts/lwe-update-install.js", runtime.updateInstall],
    ["scripts/lwe-control-desktop-release-macos.js", "scripts/lwe-control-desktop-release-macos.js"],
    ["lwe-image.config.json", "lwe-image.config.json"],
    ["lwe-update.config.json", "lwe-update.config.json"],
    ["lwe-release-manifest.json", "lwe-release-manifest.json"],
    ["lwe-process/process.json", "lwe-process/process.json"],
    ["lwe-process/version.json", "lwe-process/version.json"],
    ["lwe/filters/calendar.js", "lwe/filters/calendar.js"],
    ["lwe/filters/text.cjs", "lwe/filters/text.cjs"],
    ["LCB-AI-INSTRUCTIES.md", "LCB-AI-INSTRUCTIES.md"],
    ["AI_START_HERE.md", "AI_START_HERE.md"],
    ["MANUAL.md", "MANUAL.md"],
    ["MANUAL.en.md", "MANUAL.en.md"],
    ["MANUAL.de.md", "MANUAL.de.md"],
    ...listFiles("manual_images").map((file) => [file, file]),
    ...listFiles("lcb-context").map((file) => [file, file]),
    ...listFilesRecursive("desktop/lwe-control", {
      ignored: [
        "desktop/lwe-control/dist",
        "desktop/lwe-control/node_modules",
        "desktop/lwe-control/src-tauri/gen",
        "desktop/lwe-control/src-tauri/target",
        "desktop/lwe-control/src-tauri/icons/icon.iconset",
      ],
    }).map((file) => [file, file]),
  ];

  if (readEleventyInputMode() === "src" || fs.existsSync(path.join(targetDir, "src", "assets"))) {
    files.push(["src/assets/system.css", "src/assets/system.css"]);
    files.push(["src/assets/system-calendar.js", "src/assets/system-calendar.js"]);
  } else if (readEleventyInputMode() === "root" && fs.existsSync(path.join(targetDir, "assets"))) {
    files.push(["src/assets/system-calendar.js", "assets/js/system-calendar.js"]);
  }

  for (const file of projectInputStarterFiles()) {
    const source = path.join(sourceRoot, file);
    if (fs.existsSync(source) && !fs.existsSync(path.join(targetDir, file))) {
      files.push([file, file]);
    }
  }

  return files;
}

function writePlannedFile(sourceRel, targetRel, runtime) {
  if (!apply) return;
  const target = path.join(targetDir, targetRel);
  backupExisting(targetRel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (isBinaryFile(sourceRel) || isBinaryFile(targetRel)) {
    fs.copyFileSync(path.join(sourceRoot, sourceRel), target);
  } else {
    fs.writeFileSync(target, plannedFileContent(sourceRel, targetRel, runtime));
  }
}

function scriptUpdates(runtime) {
  return {
    prebuild: `node ${runtime.next} --guard=build`,
    lcb: `node ${runtime.server}`,
    "lcb:preview-only": `node ${runtime.server} --skip-build`,
    "lwe:next": `node ${runtime.next}`,
    "lwe:approve": `node ${runtime.approve}`,
    "lwe:reset": `node ${runtime.reset} --to=intake`,
    "lwe:unapprove": `node ${runtime.reset} --to=proposal`,
    "lwe:images": `node ${runtime.images}`,
    "lwe:publish-check": `node ${runtime.publishCheck}`,
    "lwe:update": `node ${runtime.update}`,
    "lwe:update-check": `node ${runtime.updateCheck}`,
    "lwe:update-install": `node ${runtime.updateInstall}`,
    "lwe:control-desktop:install": "npm --prefix desktop/lwe-control install",
    "lwe:control-desktop:dev": "npm --prefix desktop/lwe-control run tauri:dev",
    "lwe:control-desktop:build": "npm --prefix desktop/lwe-control run tauri:build",
    "lwe:control-desktop:release-macos": "node scripts/lwe-control-desktop-release-macos.js",
    "lwe:guard": `node ${runtime.next} --guard=build`,
    "lwe:audit": `node ${runtime.next}`,
  };
}

function compareJson(a, b) {
  return JSON.stringify(a, null, 2) === JSON.stringify(b, null, 2);
}

function printList(title, items) {
  console.log(title);
  if (!items.length) {
    console.log("- none");
    return;
  }
  for (const item of items) console.log(`- ${item}`);
}

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`Doelmap bestaat niet: ${targetDir}`);
  process.exit(1);
}

const targetPackagePath = path.join(targetDir, "package.json");
const targetPackage = readJson(targetPackagePath, null);
if (!targetPackage) {
  console.error("Geen package.json gevonden. Dit lijkt geen Node/11ty project.");
  process.exit(1);
}

const runtime = runtimeFileNames(targetPackage);
const currentVersion = readJson(path.join(targetDir, "lwe-process", "version.json"), { lwe: {} });
const coreVersion = readJson(path.join(sourceRoot, "lwe-process", "version.json"), { lwe: {} });
const lcbConfigPath = path.join(targetDir, "lcb.config.json");
const oldLcbConfig = readJson(lcbConfigPath, null);
const nextLcbConfig = oldLcbConfig ? { ...defaultLcbConfig(), ...oldLcbConfig } : defaultLcbConfig();
const packageWarnings = [];
const packageScripts = scriptUpdates(runtime);
if (targetPackage.scripts?.prebuild && !/lwe-next/.test(targetPackage.scripts.prebuild)) {
  packageScripts.prebuild = targetPackage.scripts.prebuild;
  packageWarnings.push(
    "custom prebuild script behouden; voeg LWE guard handmatig toe of bespreek hoe deze gecombineerd moet worden"
  );
}
const nextScripts = {
  ...(targetPackage.scripts || {}),
  ...packageScripts,
};
if (!nextScripts.build) nextScripts.build = "eleventy";
const nextPackage = {
  ...targetPackage,
  scripts: nextScripts,
  devDependencies: {
    ...(targetPackage.devDependencies || {}),
    "@11ty/eleventy": targetPackage.devDependencies?.["@11ty/eleventy"] || "^3.1.6",
    "sharp": targetPackage.devDependencies?.sharp || "^0.35.4",
  },
};

const filePlan = buildFilePlan(runtime).map(([sourceRel, targetRel]) => {
  const sourcePath = path.join(sourceRoot, sourceRel);
  const targetPath = path.join(targetDir, targetRel);
  const exists = fs.existsSync(targetPath);
  return {
    sourceRel,
    targetRel,
    action: exists ? (samePlannedFile(sourceRel, targetRel, runtime) ? "unchanged" : "replace") : "add",
  };
});

const packageAction = fs.existsSync(targetPackagePath)
  ? (compareJson(targetPackage, nextPackage) ? "unchanged" : "update")
  : "add";
const configAction = fs.existsSync(lcbConfigPath)
  ? (compareJson(oldLcbConfig, nextLcbConfig) ? "unchanged" : "merge")
  : "add";
const statePath = path.join(targetDir, "lwe-process", "state.json");
const stateAction = fs.existsSync(statePath) ? "keep" : "add";
const appearsLweProject = fs.existsSync(lcbConfigPath) || fs.existsSync(path.join(targetDir, "lwe-process")) || fs.existsSync(path.join(targetDir, "lcb"));
const jsonReadySignals = fs.existsSync(path.join(targetDir, "src", "_data")) && readText(targetPackagePath).includes("eleventy");
const eleventyInputMode = readEleventyInputMode();
const eleventyConfigText = [".eleventy.js", "eleventy.config.js", "eleventy.config.cjs"]
  .map((file) => readText(path.join(targetDir, file)))
  .filter(Boolean)
  .join("\n");
const calendarFilterRegistered = /registerCalendarFilters|upcomingEvents/.test(eleventyConfigText);
const textFilterRegistered = /registerTextFilters|addFilter\(["']lines["']|addFilter\(["']paragraphs["']|\|\s*(lines|paragraphs)\b/.test(eleventyConfigText);
const eleventyIgnorePath = path.join(targetDir, ".eleventyignore");
const currentEleventyIgnore = readText(eleventyIgnorePath, "");
const plannedEleventyIgnore = nextEleventyIgnore();
const shouldManageEleventyIgnore = eleventyInputMode === "root";
const eleventyIgnoreAction = shouldManageEleventyIgnore
  ? (currentEleventyIgnore === plannedEleventyIgnore ? "unchanged" : fs.existsSync(eleventyIgnorePath) ? "update" : "add")
  : "not needed";
const currentEleventyConfigPath = eleventyConfigPath();
const currentEleventyConfig = currentEleventyConfigPath ? readText(currentEleventyConfigPath) : "";
const plannedEleventyConfig = currentEleventyConfig ? nextEleventyConfig(currentEleventyConfig) : "";
const eleventyConfigAction = !currentEleventyConfigPath
  ? "missing"
  : currentEleventyConfig === plannedEleventyConfig ? "unchanged" : "patch";
const vscodeExtensionsPath = path.join(targetDir, ".vscode", "extensions.json");
const currentVsCodeExtensions = readJson(vscodeExtensionsPath, {});
const plannedVsCodeExtensions = nextVsCodeExtensionsJson();
const vscodeExtensionsAction = compareJson(currentVsCodeExtensions, plannedVsCodeExtensions)
  ? "unchanged"
  : fs.existsSync(vscodeExtensionsPath) ? "merge" : "add";
const lweControlVsix = latestLweControlVsix();
const targetVsixRel = lweControlVsix ? path.join(".vscode", "extensions", lweControlVsix) : "";
const targetVsixPath = targetVsixRel ? path.join(targetDir, targetVsixRel) : "";
const vscodeVsixAction = !lweControlVsix
  ? "missing in Core"
  : fs.existsSync(targetVsixPath) ? "unchanged" : "add";

console.log("LWE UPDATE PLAN");
console.log("===============");
console.log("");
console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
console.log(`Target: ${targetDir}`);
console.log(`Current runtime: ${currentVersion.lwe?.runtimeVersion || "unknown"}`);
console.log(`Core runtime: ${coreVersion.lwe?.runtimeVersion || "unknown"}`);
console.log(`Project lijkt al LWE: ${appearsLweProject ? "ja" : "nee / gedeeltelijk"}`);
console.log(`JSON-ready signalen: ${jsonReadySignals ? "ja" : "nee / onbekend"}`);
console.log(`11ty input mode: ${eleventyInputMode}`);
console.log(`Kalenderfilter geregistreerd: ${calendarFilterRegistered ? "ja" : "nee / handmatig controleren"}`);
console.log(`Tekstfilters lines/paragraphs geregistreerd: ${textFilterRegistered ? "ja" : "nee / handmatig controleren"}`);
console.log("");
console.log("Belangrijk:");
console.log("- src/ en src/_data/ worden niet overschreven");
console.log("- project-input/ wordt niet overschreven; ontbrekende starterbestanden worden alleen toegevoegd");
console.log("- lwe-process/state.json wordt behouden als die bestaat");
console.log("- zonder --apply wordt niets geschreven");
console.log("");

printList(
  "Bestanden:",
  filePlan.map((item) => `${item.action}: ${item.targetRel}`)
);
console.log("");
console.log(`package.json: ${packageAction}`);
if (packageWarnings.length) {
  printList("Package waarschuwingen:", packageWarnings);
}
console.log(`lcb.config.json: ${configAction}`);
console.log(`lwe-process/state.json: ${stateAction}`);
console.log(`.eleventyignore: ${eleventyIgnoreAction}`);
console.log(`Eleventy config: ${eleventyConfigAction}${currentEleventyConfigPath ? ` (${path.basename(currentEleventyConfigPath)})` : ""}`);
console.log(`.vscode/extensions.json: ${vscodeExtensionsAction}`);
console.log(`LWE Control VSIX: ${vscodeVsixAction}${targetVsixRel ? ` (${targetVsixRel})` : ""}`);
if (apply) console.log(`Backup: ${backupRoot}`);
console.log("");

if (!apply) {
  console.log("Voer uit met:");
  console.log(`node scripts/lwe-update.js ${targetArg} --apply`);
  console.log("");
  console.log("Of via npm:");
  console.log(`npm run lwe:update -- ${targetArg} --apply`);
  process.exit(0);
}

if (packageAction !== "unchanged") {
  backupExisting("package.json");
  writeJson(targetPackagePath, nextPackage);
}

if (configAction !== "unchanged") {
  backupExisting("lcb.config.json");
  writeJson(lcbConfigPath, nextLcbConfig);
}

if (eleventyIgnoreAction === "add" || eleventyIgnoreAction === "update") {
  backupExisting(".eleventyignore");
  fs.writeFileSync(eleventyIgnorePath, plannedEleventyIgnore);
}

if (eleventyConfigAction === "patch") {
  const relativeConfigPath = path.relative(targetDir, currentEleventyConfigPath);
  backupExisting(relativeConfigPath);
  fs.writeFileSync(currentEleventyConfigPath, plannedEleventyConfig);
}

if (vscodeExtensionsAction === "add" || vscodeExtensionsAction === "merge") {
  backupExisting(".vscode/extensions.json");
  writeJson(vscodeExtensionsPath, plannedVsCodeExtensions);
}

if (vscodeVsixAction === "add" && targetVsixRel) {
  backupExisting(targetVsixRel);
  fs.mkdirSync(path.dirname(targetVsixPath), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, "vscode-extension", "dist", lweControlVsix), targetVsixPath);
}

if (stateAction === "add") {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  writeJson(statePath, initialLweState());
}

for (const item of filePlan) {
  if (item.action === "unchanged") continue;
  writePlannedFile(item.sourceRel, item.targetRel, runtime);
}

console.log("LWE UPDATE DONE");
console.log("Draai in het bijgewerkte project:");
console.log("npm install");
console.log("npm run lwe:next");
console.log("npm run lwe:publish-check");
console.log("npm run lwe:images -- --preset=general");
console.log("");
console.log("Let op: na een update kan npm run lcb bewust blokkeren door de LWE guard.");
console.log("Dat betekent meestal dat intake, akkoord, taalroutes of andere proceschecks nog niet klaar zijn.");
console.log("Wil je alleen kijken naar de bestaande _site? Gebruik dan:");
console.log("npm run lcb:preview-only");
if (!jsonReadySignals) {
  console.log("");
  console.log("Let op: dit project gebruikt geen standaard src/_data LWE-startersstructuur.");
  console.log("De update vernieuwt LWE-runtime en procescontrole, maar zet bestaande websitecontent niet automatisch om naar bewerkbare JSON.");
  console.log("Als de site al LWE-editpaden heeft, blijven die gewoon werken.");
}
if (!calendarFilterRegistered) {
  console.log("");
  console.log("Kalenderfilter:");
  console.log("- de module staat na update in lwe/filters/calendar.js");
  console.log("- registreer hem in de 11ty config voordat je `events | upcomingEvents` gebruikt");
  console.log("- voeg toe: const { registerCalendarFilters } = require(\"./lwe/filters/calendar\");");
  console.log("- roep binnen module.exports aan: registerCalendarFilters(eleventyConfig);");
}
if (!textFilterRegistered) {
  console.log("");
  console.log("Tekstfilters lines/paragraphs:");
  console.log("- de module staat na update in lwe/filters/text.cjs");
  console.log("- registreer hem in de 11ty config voordat je `tekst | lines` of `tekst | paragraphs` gebruikt");
  console.log("- CommonJS: const { registerTextFilters } = require(\"./lwe/filters/text.cjs\");");
  console.log("- ESM: import textFilters from \"./lwe/filters/text.cjs\";");
  console.log("- roep aan: registerTextFilters(eleventyConfig); of textFilters.registerTextFilters(eleventyConfig);");
}
