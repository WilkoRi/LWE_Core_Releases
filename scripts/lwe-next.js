#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  flattenStrings,
  getPathValue,
  hasAffirmativeAnswer,
  hasSurpriseAnswer,
  intakeGroups,
  isAnswered,
  requiredIntakeFields,
  verifyStateSignature,
  withStateSignature,
} = require("./lwe-rules");

const root = process.cwd();
const statePath = path.join(root, "lwe-process", "state.json");
const intakePath = "project-input/website-intake.json";
const guardArg = process.argv.find((arg) => arg === "--guard" || arg.startsWith("--guard="));
const guardTarget = guardArg?.includes("=") ? guardArg.split("=")[1] : guardArg ? "build" : "";

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  } catch {
    return fallback;
  }
}

function readJsData(rel, fallback) {
  try {
    const abs = path.join(root, rel);
    delete require.cache[require.resolve(abs)];
    return require(abs);
  } catch {
    return fallback;
  }
}

function readDataFile(rel, fallback) {
  const ext = path.extname(rel).toLowerCase();
  if (ext === ".js" || ext === ".cjs") return readJsData(rel, fallback);
  return readJson(rel, fallback);
}

function listFiles(dir, depth = 2) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  function walk(current, level) {
    if (level > depth) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "_site") continue;
      const full = path.join(current, entry.name);
      const rel = path.relative(root, full);
      if (entry.isDirectory()) walk(full, level + 1);
      else out.push(rel);
    }
  }
  walk(abs, 0);
  return out;
}

function isIgnoredSitePath(rel) {
  return (
    rel.startsWith("node_modules/") ||
    rel.startsWith("_site/") ||
    rel.startsWith(".lwe-backups/") ||
    rel.startsWith("lcb/") ||
    rel.startsWith("lcb-context/") ||
    rel.startsWith("lwe/") ||
    rel.startsWith("lwe-process/") ||
    rel.startsWith("project-input/") ||
    rel.startsWith("scripts/")
  );
}

function isSiteSourcePath(rel) {
  if (!rel || rel === ".") return false;
  if (isIgnoredSitePath(rel)) return false;
  if (/^(LCB-AI-INSTRUCTIES|AI_START_HERE|MANUAL)(\.|$)/.test(rel)) return false;
  if (/^(src\/)?assets\/images\/processed\/manifest\.json$/.test(rel)) return false;
  return /\.(njk|html|md|css|js|json|svg)$/i.test(rel);
}

function listSiteSourceFiles(depth = 8) {
  if (exists("src")) return listFiles("src", depth).filter(isSiteSourcePath);
  return listFiles(".", depth).filter(isSiteSourcePath);
}

function readExistingFiles(files) {
  return files
    .filter(exists)
    .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
    .join("\n");
}

function allowedSecurityPattern(file, label, line) {
  if (
    label === "Nunjucks safe filter" &&
    line.includes("manual.html | safe") &&
    (file === "src/manual.njk" || file === "install-lcb.js")
  ) {
    return "allowed: manual.html komt uit MANUAL*.md en markdown-it rendert met html:false";
  }

  if (
    label === "Nunjucks safe filter" &&
    /\bcontent\s*\|\s*safe\b/.test(line) &&
    /(^|\/)_includes\/(?:layouts\/)?[A-Za-z0-9_-]+\.njk$/.test(file)
  ) {
    return "allowed: 11ty layout-slot rendert pagina-content, geen JSON/editor-input";
  }

  return "";
}

function collectSecurityPatternFindings(files) {
  const patterns = [
    {
      label: "Nunjucks safe filter",
      regex: /\|\s*safe\b/,
      rule: "gebruik | safe niet op JSON-content, intake-content, editorcontent of user input",
    },
    {
      label: "innerHTML",
      regex: /\.innerHTML\b/,
      rule: "gebruik textContent of veilige DOM APIs voor content uit JSON/user input",
    },
    {
      label: "dangerouslySetInnerHTML",
      regex: /\bdangerouslySetInnerHTML\b/,
      rule: "gebruik geen raw HTML-rendering zonder expliciete security review",
    },
    {
      label: "eval()",
      regex: /\beval\s*\(/,
      rule: "voer geen code uit vanuit strings",
    },
    {
      label: "new Function",
      regex: /\bnew\s+Function\b/,
      rule: "voer geen code uit vanuit strings",
    },
  ];
  const findings = [];

  for (const file of files.filter(exists)) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        if (!pattern.regex.test(line)) continue;
        const allowReason = allowedSecurityPattern(file, pattern.label, line);
        findings.push({
          file,
          line: index + 1,
          label: pattern.label,
          rule: pattern.rule,
          status: allowReason ? "allowed" : "review_required",
          reason: allowReason,
          code: line.trim(),
        });
      }
    });
  }

  return findings;
}

const publicContentPatterns = [
  {
    label: "migratie- of brontekst",
    regex: /\b(de oude (site|website|pagina)|oude clubracepagina|originele pagina|migratie|samengevoegd|bronmateriaal)\b/i,
    rule: "maak hier gewone bezoekerstekst van of verplaats het naar projectnotities",
  },
  {
    label: "placeholder of onafgeronde tekst",
    regex: /\b(todo|tbd|placeholder|lorem ipsum|wordt nog|moet nog|coming soon|under construction)\b/i,
    rule: "vervang placeholdertekst of noteer bewust waarom dit publiek mag blijven staan",
  },
  {
    label: "AI/interne werktekst",
    regex: /\b(chatgpt|copilot|ai-achtige|interne|redactionele werktekst|moet worden uitgewerkt)\b/i,
    rule: "laat interne AI- of redactietekst niet op de publieke website staan",
  },
];

function collectJsonStringEntries(value, prefix = "") {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectJsonStringEntries(item, `${prefix}.${index}`.replace(/^\./, "")));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      collectJsonStringEntries(item, `${prefix}.${key}`.replace(/^\./, ""))
    );
  }
  if (typeof value === "string") {
    return [{ path: prefix, value }];
  }
  return [];
}

function findPublicContentIssue(value) {
  for (const pattern of publicContentPatterns) {
    if (pattern.regex.test(value)) {
      return {
        label: pattern.label,
        rule: pattern.rule,
      };
    }
  }
  return null;
}

function normalizeLiteral(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isLikelySystemLiteral(value) {
  const clean = normalizeLiteral(value).toLowerCase();
  return (
    clean.length < 3 ||
    clean.includes("{{") ||
    clean.includes("{%") ||
    /^(x|nl|en|de|menu|sluiten|close|demo|manual|lwe|local website editor|zet aan|zet uit)$/.test(clean)
  );
}

function collectContentSystemFindings(templateFiles, contentFiles, dataDir) {
  const warnings = [];
  const templateLiteralReviewItems = [];

  for (const file of contentFiles) {
    const rel = path.join(dataDir, file);
    const data = readDataFile(rel, null);
    if (!data) continue;
    for (const entry of collectJsonStringEntries(data)) {
      const issue = findPublicContentIssue(entry.value);
      if (!issue) continue;
      warnings.push({
        source: "json",
        file: rel,
        path: entry.path,
        label: issue.label,
        rule: issue.rule,
        text: normalizeLiteral(entry.value).slice(0, 160),
      });
    }
  }

  const textNodeRegex = />\s*([^<>{][^<]*?[A-Za-zÀ-ÿ][^<]*?)\s*</g;
  for (const file of templateFiles.filter((item) => exists(item) && item !== "src/manual.njk")) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
    let insideSystemBlock = false;
    lines.forEach((line, index) => {
      const systemTagMatch = line.match(/<([a-z0-9-]+)\b[^>]*\bdata-lwe-system\b/i);
      const opensSystemBlock = Boolean(systemTagMatch);
      const singleLineSystem = opensSystemBlock && new RegExp(`</${systemTagMatch[1]}>`, "i").test(line);
      const lineIsSystem = insideSystemBlock || opensSystemBlock;
      if (opensSystemBlock && !singleLineSystem) insideSystemBlock = true;
      const closesSystemBlock = insideSystemBlock && /<\/(aside|section|article|div|footer|header|nav|main)>/.test(line);
      const lineHasEditPath = /\bdata-edit-path\s*=/.test(line);
      let match;
      while ((match = textNodeRegex.exec(line))) {
        const text = normalizeLiteral(match[1]);
        if (isLikelySystemLiteral(text)) continue;
        const issue = findPublicContentIssue(text);
        if (issue && !lineIsSystem) {
          warnings.push({
            source: "template",
            file,
            line: index + 1,
            label: issue.label,
            rule: issue.rule,
            text: text.slice(0, 160),
          });
          continue;
        }
        if (!lineHasEditPath && !lineIsSystem) {
          templateLiteralReviewItems.push({
            file,
            line: index + 1,
            text: text.slice(0, 120),
          });
        }
      }
      if (closesSystemBlock) insideSystemBlock = false;
    });
  }

  return {
    warnings,
    templateLiteralReviewItems,
  };
}

function writeJson(rel, value, command = "lwe:next") {
  const output = rel === "lwe-process/state.json" ? withStateSignature(value, command) : value;
  fs.writeFileSync(path.join(root, rel), `${JSON.stringify(output, null, 2)}\n`);
}

function shouldSkipProtectedPath(rel) {
  return (
    rel.startsWith("node_modules/") ||
    rel.startsWith("_site/") ||
    rel.startsWith(".lwe-backups/") ||
    rel.startsWith("project-input/") ||
    rel.startsWith("lwe-process/") ||
    rel === "package-lock.json"
  );
}

function listProtectedFiles() {
  const siteFiles = listSiteSourceFiles(8);
  const candidates = [
    ".eleventy.js",
    "eleventy.config.js",
    "eleventy.config.cjs",
    "lcb.config.json",
    "lcb-server.js",
    "server.js",
    "package.json",
    ...siteFiles,
    ...listFiles("lcb", 8),
    ...listFiles("scripts", 2),
  ];

  return [...new Set(candidates)]
    .filter((file) => exists(file) && !shouldSkipProtectedPath(file))
    .sort();
}

function hashFile(rel) {
  const buffer = fs.readFileSync(path.join(root, rel));
  return crypto.createHash("sha1").update(buffer).digest("hex");
}

function createProtectedSnapshot() {
  const files = {};
  for (const file of listProtectedFiles()) {
    const stats = fs.statSync(path.join(root, file));
    files[file] = {
      size: stats.size,
      hash: hashFile(file),
    };
  }
  return files;
}

function compareSnapshots(previous, current) {
  const changed = [];
  const allFiles = new Set([...Object.keys(previous || {}), ...Object.keys(current || {})]);

  for (const file of [...allFiles].sort()) {
    if (!previous?.[file]) changed.push({ file, change: "added" });
    else if (!current?.[file]) changed.push({ file, change: "deleted" });
    else if (previous[file].hash !== current[file].hash) changed.push({ file, change: "modified" });
  }

  return changed;
}

const processDef = readJson("lwe-process/process.json", { phases: {} });
const versionInfo = readJson("lwe-process/version.json", { lwe: {} });
const lcbConfig = readJson("lcb.config.json", {});
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, "utf8"))
  : { phase: "intake", projectType: "unknown", languageMode: "unknown", userApprovedBuild: false };
const stateSignatureStatus = verifyStateSignature(state);
const intake = readJson(intakePath, null);
const missingIntakeFields = intake
  ? requiredIntakeFields.filter(({ field }) => !isAnswered(getPathValue(intake, field)))
  : requiredIntakeFields;
const surpriseIntakeFields = intake
  ? requiredIntakeFields.filter(({ field }) => hasSurpriseAnswer(getPathValue(intake, field)))
  : [];
const intakeComplete = Boolean(intake && missingIntakeFields.length === 0);
const answeredIntakeCount = intake ? requiredIntakeFields.length - missingIntakeFields.length : 0;
const nextMissingGroup = intakeGroups.find((group) =>
  missingIntakeFields.some((item) => item.group === group)
);
const nextMissingFields = nextMissingGroup
  ? missingIntakeFields.filter((item) => item.group === nextMissingGroup)
  : [];
const nextMissingField = nextMissingFields[0] || null;
const laterMissingGroups = intakeGroups.filter((group) =>
  group !== nextMissingGroup && missingIntakeFields.some((item) => item.group === group)
);

const configuredDataDir = typeof lcbConfig.dataDir === "string" && lcbConfig.dataDir.trim()
  ? lcbConfig.dataDir.trim()
  : "src/_data";
const dataDir = configuredDataDir.replace(/[\\/]+$/g, "");
const includesDir = exists("src/_includes") ? "src/_includes" : exists("_includes") ? "_includes" : "src/_includes";
const content = readJson(path.join(dataDir, "content.json"), {});
const languagesJsonPath = path.join(dataDir, "languages.json");
const languagesJson = exists(languagesJsonPath) ? readJson(languagesJsonPath, null) : null;
const siteData = readJsData(path.join(dataDir, "site.js"), {});
const languages = Array.isArray(content.languages)
  ? content.languages
  : Array.isArray(languagesJson)
    ? languagesJson
    : siteData.languages && typeof siteData.languages === "object"
      ? Object.values(siteData.languages)
      : [];
const configuredContentFiles = Array.isArray(lcbConfig.contentFiles) ? lcbConfig.contentFiles : ["content.json"];
const configuredContentFilesFound = configuredContentFiles.filter((file) => exists(path.join(dataDir, file)));
const sourceFiles = listSiteSourceFiles(4);
const sourceText = readExistingFiles(sourceFiles);
const navFiles = [
  path.join(includesDir, "nav.njk"),
  path.join(includesDir, "navigation.njk"),
  path.join(includesDir, "site-header.njk"),
  path.join(includesDir, "header.njk"),
].filter(exists);
const footerFiles = [path.join(includesDir, "footer.njk"), path.join(includesDir, "site-footer.njk")].filter(exists);
const navText = navFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const navTemplateText = navText || sourceText;
const hasLanguageSelector = /language|taal|currentLang\.label|content\.languages/.test(navTemplateText);
const navItems = Array.isArray(content.nav) ? content.nav : Array.isArray(siteData.nav) ? siteData.nav : [];
const navUsesSlug = navItems.some((item) => item && Object.prototype.hasOwnProperty.call(item, "slug"));
const navUsesHref = navItems.some((item) => item && Object.prototype.hasOwnProperty.call(item, "href"));
const navUsesKey = navItems.some((item) => item && Object.prototype.hasOwnProperty.call(item, "key"));
const navHrefTemplateItems = navItems
  .map((item, index) => ({
    index,
    href: item && typeof item.href === "string" ? item.href : "",
  }))
  .filter(({ href }) => /\{[{%#]/.test(href));
const navTemplateUsesItemHref = /\bitem\.href\b/.test(navTemplateText);
const navTemplateUsesItemSlug = /\bitem\.slug\b/.test(navTemplateText);
const navContractWarnings = [];

if (navHrefTemplateItems.length) {
  navContractWarnings.push(
    "content.nav.href bevat template-code; bouw taal-URLs in nav.njk, niet in content.json"
  );
}

if (navUsesSlug && navTemplateUsesItemHref) {
  navContractWarnings.push("content.nav gebruikt slug, maar nav template gebruikt nog item.href");
}

if (navUsesSlug && !navTemplateUsesItemSlug) {
  navContractWarnings.push("content.nav gebruikt slug, maar nav template gebruikt item.slug niet");
}

if (navUsesHref && !navUsesSlug && !navTemplateUsesItemHref) {
  navContractWarnings.push("content.nav gebruikt href, maar nav template gebruikt item.href niet");
}

const projectInputFiles = listFiles("project-input", 3);
const imageFiles = projectInputFiles.filter((file) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(file));
const processedImageManifestFiles = [
  "src/assets/images/processed/manifest.json",
  "assets/images/processed/manifest.json",
].filter((file) => exists(file));
const routesData = readJson(path.join(dataDir, "routes.json"), content.routes || null);
const routePages =
  routesData && typeof routesData === "object" && routesData.pages && typeof routesData.pages === "object"
    ? routesData.pages
    : siteData.pages && typeof siteData.pages === "object"
      ? siteData.pages
    : null;
const contentPageKeys =
  content.pages && typeof content.pages === "object" && !Array.isArray(content.pages)
    ? Object.keys(content.pages)
    : [];
const navSlugKeys = navItems
  .map((item) => (item && typeof item.slug === "string" ? item.slug.trim() : ""))
  .filter((value) => value && !value.startsWith("#"));
const navKeyKeys = navItems.flatMap((item) => {
  const keys = [];
  if (item && typeof item.key === "string") keys.push(item.key.trim());
  if (Array.isArray(item?.children)) {
    for (const child of item.children) {
      if (child && typeof child.key === "string") keys.push(child.key.trim());
    }
  }
  return keys.filter(Boolean);
});
const pageTemplateFiles = sourceFiles.filter(
  (file) => !file.includes("/_includes/") && /\.(njk|md|html)$/i.test(file)
);
const pageIdentityKeys = [...new Set([...contentPageKeys, ...navSlugKeys, ...navKeyKeys])];
const multilingualDetected =
  languages.length > 1 ||
  /multi/i.test(
    [
      state.languageMode,
      getPathValue(intake, "language.mode"),
      getPathValue(intake, "functionality.multilingual"),
    ]
      .filter(Boolean)
      .join(" ")
  );
const hasMultiplePageIdentities = pageIdentityKeys.length > 1 || pageTemplateFiles.length > 1;
const routeTemplateText = `${sourceText}\n${navText}`;
const routeTemplateUsesRelation = /(?:routes|content\.routes|site)\.pages|pageRoutes|localizedPath|languageUrl/.test(
  routeTemplateText
);
const languageRouteWarnings = [];

if (multilingualDetected && hasMultiplePageIdentities) {
  if (!routePages && !routeTemplateUsesRelation) {
    languageRouteWarnings.push(
      `meertalige meerpagina-site heeft geen ${path.join(dataDir, "routes.json")}, content.routes.pages, site.pages of gelijkwaardige languageUrl/localizedPath route-logica`
    );
  } else if (routePages) {
    const missingRoutePages = pageIdentityKeys.filter((key) => !routePages[key]);
    if (missingRoutePages.length) {
      languageRouteWarnings.push(`routes.pages mist pagina-relaties voor: ${missingRoutePages.join(", ")}`);
    }

    const missingRouteLangs = [];
    for (const key of pageIdentityKeys) {
      if (!routePages[key]) continue;
      for (const lang of languages) {
        if (!routePages[key][lang.code]) missingRouteLangs.push(`${key}.${lang.code}`);
      }
    }
    if (missingRouteLangs.length) {
      languageRouteWarnings.push(`routes.pages mist taalroutes voor: ${missingRouteLangs.join(", ")}`);
    }

    if (hasLanguageSelector && !routeTemplateUsesRelation) {
      languageRouteWarnings.push(
        "taalselector gebruikt geen routes.pages/pageRoutes; taalwissel kan naar homepage of verkeerde pagina springen"
      );
    }
  }
}
const styleFiles = [...listFiles("src/assets", 4), ...listFiles("assets", 4), ...listFiles("lcb", 4)].filter((file) =>
  /\.css$/i.test(file)
);
const styleText = readExistingFiles([...new Set(styleFiles)]);
const intakeStrings = flattenStrings(intake);
const requestedHexColors = intakeStrings.flatMap((value) => value.match(/#[0-9a-f]{3,8}\b/gi) || []);
const requestedLogoFiles = imageFiles.filter((file) => /logo/i.test(file));
const nonLogoImageFiles = imageFiles.filter((file) => !/logo/i.test(path.basename(file)));
const implementedInputImages = imageFiles.filter((file) =>
  sourceText.includes(file) || sourceText.includes(path.basename(file))
);
const implementedNonLogoInputImages = nonLogoImageFiles.filter((file) =>
  sourceText.includes(file) || sourceText.includes(path.basename(file))
);
const likelyPersonImageFiles = nonLogoImageFiles.filter((file) =>
  /(persoon|personen|person|people|team|portrait|portret|profiel|profile|headshot|mario|bouke|martijn)/i.test(
    path.basename(file)
  )
);
const likelyScreenshotImageFiles = nonLogoImageFiles.filter((file) =>
  /(screenshot|screen|scherm|capture|browser|website)/i.test(path.basename(file))
);
const usedLikelyPersonImages = likelyPersonImageFiles.filter((file) =>
  sourceText.includes(file) || sourceText.includes(path.basename(file))
);
const usedLikelyScreenshotImages = likelyScreenshotImageFiles.filter((file) =>
  sourceText.includes(file) || sourceText.includes(path.basename(file))
);
const imageSelectionNotes = getPathValue(intake, "assets.imageSelectionNotes");
const peoplePhotoApproval = hasAffirmativeAnswer(getPathValue(intake, "assets.peoplePhotoApproval"));
const screenshotApproval = hasAffirmativeAnswer(getPathValue(intake, "assets.screenshotApproval"));
const placeholderImageSignals = sourceText.match(
  /(placeholder image|image placeholder|demo image|demo-afbeelding|voorbeeldafbeelding|via\.placeholder|placehold\.co|picsum\.photos|dummyimage)/gi
) || [];
const imgTags = sourceText.match(/<img\b[^>]*>/gi) || [];
const imageTagsWithoutAlt = imgTags.filter((tag) => !/\salt\s*=/.test(tag));
const assetSelectionWarnings = [];

if (intakeComplete && nonLogoImageFiles.length > 0 && implementedNonLogoInputImages.length === 0 && !isAnswered(imageSelectionNotes)) {
  assetSelectionWarnings.push(
    "project-input bevat niet-logo afbeeldingen, maar er is geen gekozen afbeelding of bewuste keuze genoteerd"
  );
}

if (usedLikelyPersonImages.length && !peoplePhotoApproval) {
  assetSelectionWarnings.push(
    `mogelijke personenfoto gebruikt zonder expliciet akkoord: ${usedLikelyPersonImages.join(", ")}`
  );
}

if (usedLikelyScreenshotImages.length && !screenshotApproval) {
  assetSelectionWarnings.push(
    `mogelijke screenshot gebruikt zonder expliciet akkoord: ${usedLikelyScreenshotImages.join(", ")}`
  );
}

if (nonLogoImageFiles.length > 0 && placeholderImageSignals.length) {
  assetSelectionWarnings.push("project-input bevat afbeeldingen, maar bronbestanden bevatten nog placeholder/demo/stock image signalen");
}

if (imageTagsWithoutAlt.length) {
  assetSelectionWarnings.push(`${imageTagsWithoutAlt.length} img-tag(s) zonder betekenisvolle alt-tekst`);
}

const requestedSocialNames = flattenStrings(intake?.socialMedia?.accounts || [])
  .filter((value) => value.trim().length > 1);
const implementedHexColors = requestedHexColors.filter((color) =>
  styleText.toLowerCase().includes(color.toLowerCase()) || sourceText.toLowerCase().includes(color.toLowerCase())
);
const implementedLogoFiles = requestedLogoFiles.filter((file) =>
  sourceText.includes(file) || sourceText.includes(path.basename(file))
);
const implementedSocialNames = requestedSocialNames.filter((value) =>
  sourceText.toLowerCase().includes(value.toLowerCase())
);
const hidePastEventsRequested = hasAffirmativeAnswer(getPathValue(intake, "functionality.hidePastEvents"));
const calendarHideImplemented =
  /\b(upcomingEvents|isUpcomingEvent)\b/.test(sourceText) ||
  (/data-calendar-event/.test(sourceText) && /system-calendar\.js/.test(sourceText));
const calendarHideImplementationDetail = /\b(upcomingEvents|isUpcomingEvent)\b/.test(sourceText)
  ? "upcomingEvents/isUpcomingEvent"
  : /data-calendar-event/.test(sourceText) && /system-calendar\.js/.test(sourceText)
    ? "data-calendar-event/system-calendar.js"
    : "none";
const intakeImplementationChecks = [
  {
    label: "kleurvoorkeur uit intake zichtbaar verwerkt",
    requested: requestedHexColors.length,
    implemented: implementedHexColors.length,
    detail: implementedHexColors.length ? implementedHexColors.join(", ") : "none",
  },
  {
    label: "logo uit project-input gebruikt",
    requested: requestedLogoFiles.length,
    implemented: implementedLogoFiles.length,
    detail: implementedLogoFiles.length ? implementedLogoFiles.join(", ") : "none",
  },
  {
    label: "social media uit intake verwerkt",
    requested: requestedSocialNames.length,
    implemented: implementedSocialNames.length,
    detail: implementedSocialNames.length ? implementedSocialNames.join(", ") : "none",
  },
  {
    label: "verlopen kalenderitems automatisch verborgen",
    requested: hidePastEventsRequested ? 1 : 0,
    implemented: calendarHideImplemented ? 1 : 0,
    detail: calendarHideImplementationDetail,
  },
];
const missingImplementationChecks = intakeComplete
  ? intakeImplementationChecks.filter((item) => item.requested > 0 && item.implemented === 0)
  : [];
const securityScanFiles = [
  ".eleventy.js",
  "eleventy.config.js",
  "eleventy.config.cjs",
  "server.js",
  "lcb-server.js",
  "install-lcb.js",
  ...sourceFiles,
  ...listFiles("lcb", 8),
];
const securityPatternFindings = collectSecurityPatternFindings([...new Set(securityScanFiles)].sort());
const securityPatternWarnings = securityPatternFindings.filter((item) => item.status !== "allowed");
const contentSystemFindings = collectContentSystemFindings(pageTemplateFiles, configuredContentFilesFound, dataDir);
const contentSystemWarnings = contentSystemFindings.warnings;
const templateLiteralReviewItems = contentSystemFindings.templateLiteralReviewItems;
const demoSignals = [];
for (const file of [path.join(dataDir, "content.json"), "src/index.njk", "index.html", "README.md"]) {
  if (!exists(file)) continue;
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/example\.nl|Nieuwe 11ty website|LWE Site|placeholder|demo/i.test(text)) demoSignals.push(file);
}

let phase = state.phase || "intake";
if (state.userApprovedBuild === true && phase === "proposal") phase = "build";
const phaseDef = processDef.phases?.[phase] || processDef.phases?.intake || {};
const editsAllowed = phase === "build" || phase === "review";
const effectiveBlockedActions = [...(phaseDef.blockedActions || [])];
if (!intakeComplete) {
  effectiveBlockedActions.push(
    "build_from_unchecked_or_incomplete_intake",
    "assume_language_color_style_without_user_answer"
  );
}
if (navContractWarnings.length) {
  effectiveBlockedActions.push("break_nav_data_template_contract");
}
if (languageRouteWarnings.length) {
  effectiveBlockedActions.push("break_language_route_relation");
}
if (assetSelectionWarnings.length) {
  effectiveBlockedActions.push("use_unchecked_or_unapproved_images");
}
if (securityPatternWarnings.length) {
  effectiveBlockedActions.push("use_unreviewed_security_risk_pattern");
}
if (contentSystemWarnings.length) {
  effectiveBlockedActions.push("publish_public_placeholder_or_migration_text");
}
const stateOwnershipWarnings = stateSignatureStatus.status === "invalid" ? [stateSignatureStatus.message] : [];
if (stateOwnershipWarnings.length) {
  effectiveBlockedActions.push("direct_state_file_edit_detected");
}
const currentProtectedSnapshot = createProtectedSnapshot();
const previousProtectedSnapshot = state.lweGuardSnapshot?.files || null;
const protectedChanges = previousProtectedSnapshot
  ? compareSnapshots(previousProtectedSnapshot, currentProtectedSnapshot)
  : [];
const unauthorizedProtectedChanges = !editsAllowed ? protectedChanges : [];
const snapshotInitialized = !previousProtectedSnapshot;

if ((snapshotInitialized || editsAllowed) && !stateOwnershipWarnings.length) {
  const nextState = {
    ...state,
    lweGuardSnapshot: {
      createdAt: new Date().toISOString(),
      phase,
      files: currentProtectedSnapshot,
    },
  };
  writeJson("lwe-process/state.json", nextState);
}

const inferred = {
  lweCoreVersion: versionInfo.lwe?.coreVersion || "unknown",
  lweRuntimeVersion: versionInfo.lwe?.runtimeVersion || "unknown",
  hasPackageJson: exists("package.json"),
  hasEleventyConfig: exists(".eleventy.js") || exists("eleventy.config.js") || exists("eleventy.config.cjs"),
  dataDir,
  siteSourceMode: exists("src") ? "src" : "root",
  hasContentJson: exists(path.join(dataDir, "content.json")),
  configuredContentFiles: configuredContentFiles.length ? configuredContentFiles.join(", ") : "none",
  configuredContentFilesFound: `${configuredContentFilesFound.length}/${configuredContentFiles.length}`,
  navComponent: navFiles[0] || null,
  footerComponent: footerFiles[0] || null,
  navDataShape: navUsesSlug ? "slug" : navUsesHref ? "href" : navUsesKey ? "key" : navItems.length ? "unknown" : "none",
  navTemplateUses: navTemplateUsesItemSlug ? "item.slug" : navTemplateUsesItemHref ? "item.href" : "unknown",
  navContractWarnings,
  routeRelationFile: exists(path.join(dataDir, "routes.json"))
    ? path.join(dataDir, "routes.json")
    : content.routes
      ? "content.routes"
      : siteData.pages
        ? path.join(dataDir, "site.js:site.pages")
        : "none",
  routeRelationPageCount: routePages ? Object.keys(routePages).length : 0,
  languageRouteWarnings,
  languageCount: languages.length,
  hasLanguageSelector,
  projectInputFileCount: projectInputFiles.length,
  projectInputImageCount: imageFiles.length,
  processedImageManifest: processedImageManifestFiles.length ? processedImageManifestFiles.join(", ") : "none",
  intakeFile: exists(intakePath) ? intakePath : "missing",
  intakeComplete,
  intakeProgress: `${answeredIntakeCount}/${requiredIntakeFields.length}`,
  nextIntakeGroup: nextMissingGroup || "none",
  nextIntakeQuestion: nextMissingField?.label || "none",
  missingIntakeFieldCount: missingIntakeFields.length,
  requestedHexColors: requestedHexColors.length ? requestedHexColors.join(", ") : "none",
  requestedLogoFiles: requestedLogoFiles.length ? requestedLogoFiles.join(", ") : "none",
  availableNonLogoImages: nonLogoImageFiles.length,
  implementedProjectInputImages: implementedInputImages.length ? implementedInputImages.join(", ") : "none",
  likelyPersonImages: likelyPersonImageFiles.length ? likelyPersonImageFiles.join(", ") : "none",
  likelyScreenshotImages: likelyScreenshotImageFiles.length ? likelyScreenshotImageFiles.join(", ") : "none",
  assetSelectionWarnings,
  intakeImplementationWarnings: missingImplementationChecks.map((item) => item.label),
  surpriseIntakeFields: surpriseIntakeFields.length ? surpriseIntakeFields.map((item) => item.label).join(", ") : "none",
  stateSignature: stateSignatureStatus.status,
  securityPatternWarnings: securityPatternWarnings.length,
  contentSystemWarnings: contentSystemWarnings.length,
  templateLiteralReviewItems: templateLiteralReviewItems.length,
  protectedFileChanges: protectedChanges.length,
  unauthorizedProtectedChanges: unauthorizedProtectedChanges.length,
  demoSignals,
};

console.log("LWE PROCESS NEXT");
console.log("================");
console.log("AI statuscheck: LWE controleert nu de procesfase voordat de AI verdergaat.");
console.log("AI/Copilot handshake: plak of lees deze output in de AI-chat of VS Code Chat.");
console.log("Engine control: LWE bepaalt allowed/blocked actions; de AI voert die niet zelf vrij in.");
console.log("Als actions geblokkeerd zijn, moet de AI stoppen en eerst akkoord vragen.");
console.log("Gebruik deze check als bewijs dat LWE:next actief meekijkt voordat er gebouwd wordt.");
console.log("");
console.log(`Phase: ${phase}`);
console.log(`Project type: ${state.projectType || "unknown"}`);
console.log(`Language mode: ${state.languageMode || "unknown"}`);
console.log("");
console.log("LWE process gates:");
console.log(`1. Intake form: ${intakePath} ${intakeComplete ? "(complete)" : "(required now)"}`);
console.log("2. Proposal: AI vat intake/context samen en vraagt expliciet: \"Zal ik beginnen?\"");
console.log("3. Build: pas na akkoord en build-fase mogen websitebestanden worden aangepast");
console.log("   Let op: alleen de gebruiker draait npm run lwe:approve; de AI doet dit niet namens de gebruiker.");
console.log("4. Review: build controleren, feedback verwerken en opnieuw valideren");
console.log("Terug? Gebruik npm run lwe:unapprove voor terug naar voorstel of npm run lwe:reset voor terug naar intake.");
console.log("");
console.log("Build phase required:");
console.log("- run npm run build");
console.log("- start npm run lcb");
console.log("- show Website URL: http://127.0.0.1:8082/");
console.log("- show Editor URL: http://127.0.0.1:8082/__lcb/");
console.log("- open of bied de preview aan in VS Code als dat beschikbaar is");
console.log("- ask user to review");
console.log("- before publishing: run npm run lwe:publish-check");
console.log("- publish only the contents of _site/, never the whole LWE project folder");
console.log("");
console.log("Allowed actions:");
for (const item of phaseDef.allowedActions || []) console.log(`- ${item}`);
console.log("");
console.log("Blocked actions:");
for (const item of [...new Set(effectiveBlockedActions)]) console.log(`- ${item}`);
console.log("");
console.log("Detected project state:");
for (const [key, value] of Object.entries(inferred)) {
  console.log(`- ${key}: ${Array.isArray(value) ? (value.length ? value.join(", ") : "none") : value}`);
}
console.log("");
console.log("Intake file check:");
if (!intake) {
  console.log(`- missing: ${intakePath}`);
  console.log("- maak of vul dit bestand voordat je een nieuwe website ontwerpt");
} else if (intakeComplete) {
  console.log(`- complete: ${intakePath}`);
  console.log("- 'ik weet het niet, verras me' telt als geldig antwoord als de gebruiker geen voorkeur heeft");
  if (surpriseIntakeFields.length) {
    console.log(`- vrije keuze door gebruiker: ${surpriseIntakeFields.map((item) => item.label).join(", ")}`);
  console.log("- AI moet eigen keuzes expliciet in het voorstel benoemen en zichtbaar verwerken of bewust verklaren");
  }
} else {
  console.log(`- incomplete: ${intakePath}`);
  console.log(`- progress: ${answeredIntakeCount}/${requiredIntakeFields.length} verplichte antwoorden ingevuld`);
  console.log(`- huidige groep: ${nextMissingGroup}`);
  console.log(`- vraag nu maar 1 intakevraag: ${nextMissingField.label}`);
  if (nextMissingFields.length > 1) {
    console.log(`- daarna nog in deze groep: ${nextMissingFields.length - 1}`);
  }
  if (laterMissingGroups.length) {
    console.log(`- later nog: ${laterMissingGroups.join(", ")}`);
  }
  console.log("- korte antwoorden zijn goed: ja, nee, niet nodig, onbekend of 'ik weet het niet, verras me'");
  if (surpriseIntakeFields.length) {
    console.log(`- al bewust vrijgegeven aan AI: ${surpriseIntakeFields.map((item) => item.label).join(", ")}`);
  }
}
console.log("");
console.log("Intake-to-result check:");
if (!intakeComplete) {
  console.log("- skipped: intake is nog niet compleet");
} else {
  for (const item of intakeImplementationChecks) {
    if (item.requested === 0) {
      console.log(`- not requested: ${item.label}`);
    } else if (item.implemented > 0) {
      console.log(`- ok: ${item.label} (${item.detail})`);
    } else {
      console.log(`- warning: ${item.label} nog niet aangetroffen in bronbestanden`);
    }
  }
  if (missingImplementationChecks.length) {
    console.log("- AI moet dit herstellen of expliciet uitleggen waarom het bewust niet is toegepast");
  }
}
console.log("");
console.log("Navigation contract check:");
if (!navFiles.length) {
  console.log("- skipped: geen nav/header template gevonden");
} else if (!navItems.length) {
  console.log("- skipped: content.nav ontbreekt of is leeg");
} else if (!navContractWarnings.length) {
  console.log("- ok: content.nav en nav template gebruiken hetzelfde data-contract");
} else {
  for (const warning of navContractWarnings) console.log(`- warning: ${warning}`);
  console.log("- AI moet dit herstellen voordat build/review als klaar wordt gemeld");
}
console.log("");
console.log("Language route relation check:");
if (!multilingualDetected) {
  console.log("- skipped: project is niet meertalig");
} else if (!hasMultiplePageIdentities) {
  console.log("- ok: meertalige site heeft maar 1 pagina-identiteit");
} else if (!languageRouteWarnings.length) {
  console.log("- ok: taalroutes zijn per pagina-identiteit gekoppeld");
} else {
  for (const warning of languageRouteWarnings) console.log(`- warning: ${warning}`);
  console.log("- AI moet dit herstellen zodat taalwissel op dezelfde pagina blijft");
}
console.log("");
console.log("Asset selection check:");
if (!imageFiles.length) {
  console.log("- no project-input images found");
} else {
  console.log(`- found: ${imageFiles.length} project-input image(s), ${nonLogoImageFiles.length} non-logo image(s)`);
  console.log("- image tool: npm run lwe:images toont eerst een veilig dry-run plan");
  if (processedImageManifestFiles.length) {
    console.log(`- processed manifest: ${processedImageManifestFiles.join(", ")}`);
  } else {
    console.log("- processed manifest: none; gebruik --apply pas als het image-plan klopt");
  }
  if (implementedInputImages.length) {
    console.log(`- used from project-input: ${implementedInputImages.join(", ")}`);
  } else {
    console.log("- used from project-input: none detected in bronbestanden");
  }
  if (likelyPersonImageFiles.length) {
    console.log(`- attention: possible person image(s): ${likelyPersonImageFiles.join(", ")}`);
  }
  if (likelyScreenshotImageFiles.length) {
    console.log(`- attention: possible screenshot image(s): ${likelyScreenshotImageFiles.join(", ")}`);
  }
  if (!assetSelectionWarnings.length) {
    console.log("- ok: geen asset-selectie waarschuwingen");
  } else {
    for (const warning of assetSelectionWarnings) console.log(`- warning: ${warning}`);
    console.log("- AI moet beeldkeuze uitleggen of expliciet akkoord vragen voordat dit klaar is");
  }
}
console.log("");
console.log("Security pattern check:");
if (!securityPatternFindings.length) {
  console.log("- ok: geen bekende risicopatronen gevonden in templates/editor/server");
} else {
  for (const item of securityPatternFindings) {
    const prefix = item.status === "allowed" ? "allowed" : "review required";
    console.log(`- ${prefix}: ${item.label} in ${item.file}:${item.line}`);
    console.log(`  code: ${item.code}`);
    if (item.reason) {
      console.log(`  reden: ${item.reason}`);
    } else {
      console.log(`  regel: ${item.rule}`);
    }
  }
  if (securityPatternWarnings.length) {
    console.log("- AI moet risicopatronen verwijderen of expliciet uitleggen waarom ze veilig en nodig zijn");
  }
}
console.log("");
console.log("Content/System check:");
if (!contentSystemWarnings.length && !templateLiteralReviewItems.length) {
  console.log("- ok: geen verdachte publieke content of template-literals zonder editpad gevonden");
} else {
  if (contentSystemWarnings.length) {
    for (const item of contentSystemWarnings.slice(0, 12)) {
      const location = item.source === "json" ? `${item.file} -> ${item.path}` : `${item.file}:${item.line}`;
      console.log(`- warning: ${item.label} in ${location}`);
      console.log(`  tekst: ${item.text}`);
      console.log(`  regel: ${item.rule}`);
    }
    if (contentSystemWarnings.length > 12) {
      console.log(`- plus ${contentSystemWarnings.length - 12} extra verdachte contentmelding(en)`);
    }
    console.log("- AI moet dit omzetten naar bezoekerstekst, verplaatsen naar notities of expliciet laten goedkeuren");
  }
  if (templateLiteralReviewItems.length) {
    console.log(`- review: ${templateLiteralReviewItems.length} publieke template-tekst(en) zonder data-edit-path`);
    for (const item of templateLiteralReviewItems.slice(0, 8)) {
      console.log(`  - ${item.file}:${item.line} -> ${item.text}`);
    }
    if (templateLiteralReviewItems.length > 8) {
      console.log(`  - plus ${templateLiteralReviewItems.length - 8} extra review-item(s)`);
    }
    console.log("- controleer of dit System is; bezoekerstekst hoort in JSON met data-edit-path");
  }
}
console.log("");
console.log("State ownership check:");
if (stateSignatureStatus.status === "ok") {
  console.log(`- ok: ${stateSignatureStatus.message}`);
} else if (stateSignatureStatus.status === "missing") {
  console.log(`- initialized: ${stateSignatureStatus.message}`);
  console.log("- LWE schrijft bij de volgende state-update een machine-owned signature");
} else {
  for (const warning of stateOwnershipWarnings) console.log(`- violation: ${warning}`);
  console.log("- pas lwe-process/state.json niet handmatig aan; gebruik LWE-commando's zoals lwe:next, lwe:approve of lwe:reset");
  console.log("");
  console.log("LWE GUARD BLOCKED STATE OWNERSHIP");
  process.exit(1);
}
console.log("");
console.log("Execution audit:");
if (snapshotInitialized) {
  console.log("- baseline saved: beschermde websitebestanden worden vanaf nu gecontroleerd");
} else if (!protectedChanges.length) {
  console.log("- ok: geen wijzigingen in beschermde websitebestanden sinds laatste LWE-baseline");
} else if (unauthorizedProtectedChanges.length) {
  console.log("- violation: beschermde websitebestanden zijn gewijzigd terwijl edit_files/build_site geblokkeerd is");
  for (const item of unauthorizedProtectedChanges.slice(0, 12)) {
    console.log(`- ${item.change}: ${item.file}`);
  }
  if (unauthorizedProtectedChanges.length > 12) {
    console.log(`- plus ${unauthorizedProtectedChanges.length - 12} extra wijziging(en)`);
  }
  console.log("- dit is geen codefout maar een LWE-processtop");
  console.log("- stop met bouwen en informeer de gebruiker, zodat de human kan de-escaleren");
  console.log("- herstel deze wijzigingen of vraag expliciet akkoord en draai npm run lwe:approve");
  console.log("");
  console.log("LWE GUARD BLOCKED EXECUTION AUDIT");
  process.exit(1);
} else {
  console.log("- ok: beschermde wijzigingen passen bij build/reviewfase");
}
console.log("");
console.log("Required AI response now:");
console.log("LWE:next is geen interactieve wizard; gebruik deze output als opdracht voor de AI-chat.");
console.log(`Lees eerst LCB-AI-INSTRUCTIES.md en alle bestanden in lcb-context/. Inventariseer project-input/.`);
console.log(`Controleer ${intakePath}; vraag maximaal 1 ontbrekend intake-antwoord per AI-reactie.`);
if (!intakeComplete && nextMissingField) {
  console.log(`Stel nu precies deze ene vraag aan de gebruiker: ${nextMissingField.label}`);
}
console.log(`Geef daarna een voorstel volgens het verplichte LWE-overlegmoment.`);
console.log(`Vraag expliciet akkoord met: "Zal ik beginnen?"`);
console.log("De AI mag npm run lwe:approve niet zelf uitvoeren; alleen de gebruiker opent de buildfase.");
if (phase !== "build") {
  console.log(`Pas geen bestanden aan voordat de gebruiker akkoord heeft gegeven en de process state build toestaat.`);
}
console.log("");
console.log("Checklist focus:");
console.log("- context gelezen en benoemd");
console.log("- project-input geinventariseerd");
console.log("- taalkeuze bevestigd; bij multi-language ook taalselector");
console.log("- demo/placeholder-content gecontroleerd");
console.log("- centraal nav-component en footercomponent gebruikt");
console.log("- nav data/template contract gecontroleerd");
console.log("- taalroute-relaties gecontroleerd bij meertalige websites");
console.log("- sticky footer meegenomen");
console.log("- Content versus System benoemd");
console.log("- SEO per pagina meegenomen");
console.log("- afbeeldingen/logo's inhoudelijk gecontroleerd");
console.log("- beeldkeuze, alt-teksten en gevoelige beelden expliciet gecontroleerd");
console.log("- logo na build/review expliciet laten controleren: plek, scherpte, verhouding, hoogte, breedte, mobiel");
console.log("- kleuren, logo en social media uit intake zichtbaar verwerkt of bewust verklaard");
console.log("- security pattern check bekeken; risicopatronen verwijderd of bewust verantwoord");
console.log("- Content/System check bekeken; publieke tekst zonder editpad of migratietekst beoordeeld");

if (guardTarget) {
  const failures = [];
  if (!intakeComplete) failures.push("intake is niet compleet");
  if (phase !== "build") failures.push(`phase is ${phase}, niet build`);
  if (state.userApprovedBuild !== true) failures.push("userApprovedBuild is niet true");
  if (navContractWarnings.length) failures.push("navigation data/template contract is inconsistent");
  if (languageRouteWarnings.length) failures.push("language route relation is incomplete");
  if (assetSelectionWarnings.length) failures.push("image asset selection is unchecked or unapproved");
  if (securityPatternWarnings.length) failures.push("security pattern warnings require review");
  if (contentSystemWarnings.length) failures.push("public content contains placeholder, migration or internal text");
  if (stateOwnershipWarnings.length) failures.push("state.json ownership/signature is invalid");

  if (failures.length) {
    console.error("");
    console.error(`LWE GUARD BLOCKED ${guardTarget.toUpperCase()}`);
    console.error("Dit is geen buildfout of codefout. Dit is een bewuste LWE-processtop.");
    console.error("Stop met bouwen en informeer de gebruiker, zodat de human kan de-escaleren.");
    console.error("");
    console.error("Reden:");
    for (const failure of failures) console.error(`- ${failure}`);
    if (navContractWarnings.length) {
      console.error("");
      console.error("Navigation contract warnings:");
      for (const warning of navContractWarnings) console.error(`- ${warning}`);
    }
    if (languageRouteWarnings.length) {
      console.error("");
      console.error("Language route relation warnings:");
      for (const warning of languageRouteWarnings) console.error(`- ${warning}`);
    }
    if (assetSelectionWarnings.length) {
      console.error("");
      console.error("Asset selection warnings:");
      for (const warning of assetSelectionWarnings) console.error(`- ${warning}`);
    }
    if (securityPatternWarnings.length) {
      console.error("");
      console.error("Security pattern warnings:");
      for (const item of securityPatternWarnings) {
        console.error(`- ${item.label} in ${item.file}:${item.line} (${item.rule})`);
      }
    }
    if (contentSystemWarnings.length) {
      console.error("");
      console.error("Content/System warnings:");
      for (const item of contentSystemWarnings.slice(0, 12)) {
        const location = item.source === "json" ? `${item.file} -> ${item.path}` : `${item.file}:${item.line}`;
        console.error(`- ${item.label} in ${location} (${item.rule})`);
      }
    }
    if (stateOwnershipWarnings.length) {
      console.error("");
      console.error("State ownership warnings:");
      for (const warning of stateOwnershipWarnings) console.error(`- ${warning}`);
    }
    console.error("");
    console.error("Wat nu:");
    console.error("1. Run npm run lwe:next en volg de eerstvolgende processtap.");
    console.error(`2. Vul ${intakePath} aan als de intake nog niet compleet is.`);
    console.error("3. Laat de AI een voorstel maken en expliciet vragen: \"Zal ik beginnen?\"");
    console.error("4. Laat de gebruiker daarna zelf goedkeuren met npm run lwe:approve.");
    console.error("5. Draai daarna pas npm run build of npm run lcb.");
    console.error("6. Wil je terug in het proces? Gebruik npm run lwe:unapprove of npm run lwe:reset.");
    process.exit(1);
  }

  console.log("");
  console.log(`LWE GUARD OK: ${guardTarget} toegestaan.`);
}
