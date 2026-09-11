#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const sourceRoot = __dirname;

function printHelp() {
  console.log(`
LWE Core installer voor de Local Website Editor

Gebruik:
  node install-lcb.js <project-map> --mode new
  node install-lcb.js <project-map> --mode existing

Opties:
  --force   Overschrijf bestaande Local Website Editor-bestanden.

Voorbeelden:
  node install-lcb.js ../Mijn_Website_Project --mode new
  node install-lcb.js ../wild_rabbit_11ty --mode existing
`);
}

function parseArgs(argv) {
  const targetArg = argv[2];
  const modeIndex = argv.indexOf("--mode");
  const mode = modeIndex >= 0 ? argv[modeIndex + 1] : "";
  const force = argv.includes("--force");

  if (!targetArg || !["new", "existing"].includes(mode)) {
    printHelp();
    process.exit(1);
  }

  return {
    targetDir: path.resolve(process.cwd(), targetArg),
    mode,
    force,
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function read(file) {
  return fs.readFileSync(path.join(sourceRoot, file), "utf8");
}

function writeSafe(filePath, content, force) {
  if (fs.existsSync(filePath) && !force) {
    console.log(`skip: ${path.relative(process.cwd(), filePath)} bestaat al`);
    return false;
  }

  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`write: ${path.relative(process.cwd(), filePath)}`);
  return true;
}

function copySafe(sourcePath, targetPath, force) {
  const absoluteSource = path.join(sourceRoot, sourcePath);

  if (fs.existsSync(targetPath) && !force) {
    console.log(`skip: ${path.relative(process.cwd(), targetPath)} bestaat al`);
    return false;
  }

  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(absoluteSource, targetPath);
  console.log(`copy: ${path.relative(process.cwd(), targetPath)}`);
  return true;
}

function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
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

function listSourceFiles(dirRel) {
  const dir = path.join(sourceRoot, dirRel);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dirRel, entry.name))
    .sort();
}

function installVsCodeSupport(targetDir, force) {
  const recommendation = "lwe-local.lwe-control";
  const extensionsJsonPath = path.join(targetDir, ".vscode", "extensions.json");
  const extensionsJson = readJsonSafe(extensionsJsonPath, {});
  const recommendations = Array.isArray(extensionsJson.recommendations)
    ? extensionsJson.recommendations
    : [];

  if (!recommendations.includes(recommendation)) {
    writeSafe(
      extensionsJsonPath,
      `${JSON.stringify({ ...extensionsJson, recommendations: [...recommendations, recommendation] }, null, 2)}\n`,
      true
    );
  } else {
    console.log(`skip: ${path.relative(process.cwd(), extensionsJsonPath)} bevat LWE Control al`);
  }

  const vsixFile = latestLweControlVsix();
  if (vsixFile) {
    copySafe(
      path.join("vscode-extension", "dist", vsixFile),
      path.join(targetDir, ".vscode", "extensions", vsixFile),
      force
    );
  }
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

function updatePackageJson(targetDir, mode) {
  const packagePath = path.join(targetDir, "package.json");
  let pkg = {
    name: path.basename(targetDir),
    version: "1.0.0",
    private: true,
    scripts: {},
    devDependencies: {},
  };

  if (fs.existsSync(packagePath)) {
    pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  }

  const runtime = runtimeFileNames(pkg);

  pkg.scripts = pkg.scripts || {};
  pkg.devDependencies = pkg.devDependencies || {};
  pkg.scripts.build = pkg.scripts.build || "eleventy";
  pkg.scripts.prebuild = `node ${runtime.next} --guard=build`;
  pkg.scripts.lcb = `node ${runtime.server}`;
  pkg.scripts["lcb:preview-only"] = `node ${runtime.server} --skip-build`;
  pkg.scripts["lwe:next"] = `node ${runtime.next}`;
  pkg.scripts["lwe:approve"] = `node ${runtime.approve}`;
  pkg.scripts["lwe:reset"] = `node ${runtime.reset} --to=intake`;
  pkg.scripts["lwe:unapprove"] = `node ${runtime.reset} --to=proposal`;
  pkg.scripts["lwe:images"] = `node ${runtime.images}`;
  pkg.scripts["lwe:publish-check"] = `node ${runtime.publishCheck}`;
  pkg.scripts["lwe:update"] = `node ${runtime.update}`;
  pkg.scripts["lwe:update-check"] = `node ${runtime.updateCheck}`;
  pkg.scripts["lwe:update-install"] = `node ${runtime.updateInstall}`;
  pkg.scripts["lwe:guard"] = `node ${runtime.next} --guard=build`;
  pkg.scripts["lwe:audit"] = `node ${runtime.next}`;

  if (mode === "new") {
    pkg.scripts.dev = pkg.scripts.dev || "eleventy --serve";
    pkg.devDependencies["markdown-it"] = pkg.devDependencies["markdown-it"] || "^14.3.1";
  }

  pkg.devDependencies["@11ty/eleventy"] = pkg.devDependencies["@11ty/eleventy"] || "^3.1.6";
  pkg.devDependencies.sharp = pkg.devDependencies.sharp || "^0.35.4";

  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`update: ${path.relative(process.cwd(), packagePath)}`);
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

function installRuntime(targetDir, force, mode) {
  const packagePath = path.join(targetDir, "package.json");
  const pkg = fs.existsSync(packagePath) ? JSON.parse(fs.readFileSync(packagePath, "utf8")) : {};
  const runtime = runtimeFileNames(pkg);

  copySafe("server.js", path.join(targetDir, runtime.server), force);
  copySafe("lcb/editor.js", path.join(targetDir, "lcb", "editor.js"), force);
  copySafe("lcb/lcb-editor.css", path.join(targetDir, "lcb", "lcb-editor.css"), force);
  const copiedNext = copySafe("scripts/lwe-next.js", path.join(targetDir, runtime.next), force);
  const copiedApprove = copySafe("scripts/lwe-approve-build.js", path.join(targetDir, runtime.approve), force);
  const copiedReset = copySafe("scripts/lwe-reset.js", path.join(targetDir, runtime.reset), force);
  const copiedImages = copySafe("scripts/lwe-images.js", path.join(targetDir, runtime.images), force);
  const copiedUpdate = copySafe("scripts/lwe-update.js", path.join(targetDir, runtime.update), force);
  const copiedUpdateCheck = copySafe("scripts/lwe-update-check.js", path.join(targetDir, runtime.updateCheck), force);
  const copiedUpdateInstall = copySafe("scripts/lwe-update-install.js", path.join(targetDir, runtime.updateInstall), force);
  copySafe("scripts/lwe-publish-check.js", path.join(targetDir, runtime.publishCheck), force);
  copySafe("scripts/lwe-rules.js", path.join(targetDir, runtime.rules), force);
  if (copiedNext) patchRuntimeRequires(path.join(targetDir, runtime.next), runtime);
  if (copiedApprove) patchRuntimeRequires(path.join(targetDir, runtime.approve), runtime);
  if (copiedReset) patchRuntimeRequires(path.join(targetDir, runtime.reset), runtime);
  if (copiedImages) patchRuntimeRequires(path.join(targetDir, runtime.images), runtime);
  if (copiedUpdate) patchRuntimeRequires(path.join(targetDir, runtime.update), runtime);
  if (copiedUpdateCheck) patchRuntimeRequires(path.join(targetDir, runtime.updateCheck), runtime);
  if (copiedUpdateInstall) patchRuntimeRequires(path.join(targetDir, runtime.updateInstall), runtime);
  copySafe("lwe-image.config.json", path.join(targetDir, "lwe-image.config.json"), force);
  copySafe("lwe-release-manifest.json", path.join(targetDir, "lwe-release-manifest.json"), force);
  copySafe("lwe-process/process.json", path.join(targetDir, "lwe-process", "process.json"), force);
  copySafe("lwe-process/version.json", path.join(targetDir, "lwe-process", "version.json"), force);
  copySafe("lwe/filters/calendar.js", path.join(targetDir, "lwe", "filters", "calendar.js"), force);
  copySafe("lwe/filters/text.cjs", path.join(targetDir, "lwe", "filters", "text.cjs"), force);
  writeSafe(
    path.join(targetDir, "lwe-process", "state.json"),
    `${JSON.stringify(initialLweState(), null, 2)}\n`,
    force
  );
  copySafe("LCB-AI-INSTRUCTIES.md", path.join(targetDir, "LCB-AI-INSTRUCTIES.md"), force);
  copySafe("AI_START_HERE.md", path.join(targetDir, "AI_START_HERE.md"), force);
  copySafe("MANUAL.md", path.join(targetDir, "MANUAL.md"), force);
  copySafe("MANUAL.en.md", path.join(targetDir, "MANUAL.en.md"), force);
  copySafe("MANUAL.de.md", path.join(targetDir, "MANUAL.de.md"), force);
  copySafe("start-lwe-windows.cmd", path.join(targetDir, "start-lwe-windows.cmd"), force);
  copySafe("preview-lwe-windows.cmd", path.join(targetDir, "preview-lwe-windows.cmd"), force);
  copySafe("start-lwe-mac.command", path.join(targetDir, "start-lwe-mac.command"), force);
  copySafe("preview-lwe-mac.command", path.join(targetDir, "preview-lwe-mac.command"), force);
  for (const file of listSourceFiles("manual_images")) {
    copySafe(file, path.join(targetDir, file), force);
  }
  installVsCodeSupport(targetDir, force);

  for (const file of fs.readdirSync(path.join(sourceRoot, "lcb-context"))) {
    copySafe(
      path.join("lcb-context", file),
      path.join(targetDir, "lcb-context", file),
      force
    );
  }

  writeSafe(
    path.join(targetDir, "lcb.config.json"),
    JSON.stringify(
      {
        siteDir: "_site",
        dataDir: "src/_data",
        lcbDir: "lcb",
        editPrefix: "/__lcb",
        assetPrefix: "/__lcb-assets",
        contentFiles: ["content.json"],
        buildCommand: "npm run build",
        port: 8082,
        startPath: mode === "new" ? "/manual/" : "/",
        demoPath: "/",
      },
      null,
      2
    ) + "\n",
    force
  );

  writeSafe(
    path.join(targetDir, "project-input", "README.md"),
    read("project-input/README.md"),
    force
  );
  writeSafe(
    path.join(targetDir, "project-input", "website-intake.json"),
    read("project-input/website-intake.json"),
    force
  );
  writeSafe(
    path.join(targetDir, "project-input", "online-bronnen.md"),
    read("project-input/online-bronnen.md"),
    force
  );
  writeSafe(
    path.join(targetDir, "project-input", "notities.md"),
    read("project-input/notities.md"),
    force
  );

  for (const dir of ["teksten", "afbeeldingen", "documenten", "oude-website"]) {
    writeSafe(path.join(targetDir, "project-input", dir, ".gitkeep"), "\n", force);
  }
}

function patchRuntimeRequires(filePath, runtime) {
  const requiredPath = `./${path.basename(runtime.rules)}`;
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(/require\("\.\/lwe-rules"\)/g, `require("${requiredPath}")`);
  fs.writeFileSync(filePath, content);
}

function installNewSite(targetDir, force) {
  ensureDir(targetDir);
  updatePackageJson(targetDir, "new");
  installRuntime(targetDir, force, "new");

  writeSafe(
    path.join(targetDir, ".eleventy.js"),
    `const fs = require("node:fs");
const path = require("node:path");
const markdownIt = require("markdown-it");
const { registerCalendarFilters } = require("./lwe/filters/calendar");
const { registerTextFilters } = require("./lwe/filters/text.cjs");

module.exports = function (eleventyConfig) {
  eleventyConfig.setFreezeReservedData(false);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ manual_images: "manual_images" });
  eleventyConfig.addWatchTarget("MANUAL.md");
  eleventyConfig.addWatchTarget("MANUAL.en.md");
  eleventyConfig.addWatchTarget("MANUAL.de.md");
  registerCalendarFilters(eleventyConfig);
  registerTextFilters(eleventyConfig);

  const markdown = markdownIt({
    html: false,
    linkify: true,
  });

  const manualSources = {
    nl: {
      file: "MANUAL.md",
      title: "LWE Manual",
      description: "Handleiding voor de Local Website Editor.",
    },
    en: {
      file: "MANUAL.en.md",
      title: "LWE Manual",
      description: "Manual for the Local Website Editor.",
    },
    de: {
      file: "MANUAL.de.md",
      title: "LWE Manual",
      description: "Handbuch fur den Local Website Editor.",
    },
  };

  eleventyConfig.addGlobalData("manualPages", () => {
    const fallbackPath = path.join(__dirname, manualSources.nl.file);
    const fallback = fs.readFileSync(fallbackPath, "utf8");

    return Object.fromEntries(
      Object.entries(manualSources).map(([lang, source]) => {
        const manualPath = path.join(__dirname, source.file);
        const markdownSource = fs.existsSync(manualPath)
          ? fs.readFileSync(manualPath, "utf8")
          : fallback;

        return [
          lang,
          {
            ...source,
            html: markdown.render(markdownSource),
          },
        ];
      })
    );
  });

  eleventyConfig.addFilter("t", function (value, lang) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.nl || "";
  });

  eleventyConfig.addFilter("manualPath", function (lang) {
    return lang === "nl" ? "/manual/" : \`/manual/\${lang}/\`;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
`,
    force
  );

  writeSafe(
    path.join(targetDir, "src", "_data", "content.json"),
    JSON.stringify(
      {
        languages: [
          { code: "nl", label: "NL", name: "Nederlands" },
          { code: "en", label: "EN", name: "English" },
          { code: "de", label: "DE", name: "Deutsch" },
        ],
        meta: {
          siteUrl: "https://www.example.nl",
          defaultImage: "/assets/social-preview.svg",
          title: {
            nl: "Nieuwe 11ty website",
            en: "New 11ty website",
            de: "Neue 11ty-Website",
          },
          description: {
            nl: "Een nieuwe website met 11ty, Bootstrap en Local Website Editor.",
            en: "A new website with 11ty, Bootstrap and Local Website Editor.",
            de: "Eine neue Website mit 11ty, Bootstrap und Local Website Editor.",
          },
        },
        nav: [
          {
            href: "#start",
            label: { nl: "Start", en: "Start", de: "Start" },
          },
          {
            href: "#aanpak",
            label: { nl: "Aanpak", en: "Approach", de: "Ansatz" },
          },
          {
            href: "#contact",
            label: { nl: "Contact", en: "Contact", de: "Kontakt" },
          },
          {
            href: "/manual/",
            label: { nl: "Manual", en: "Manual", de: "Manual" },
          },
        ],
        pages: {
          home: {
            hero: {
              eyebrow: {
                nl: "11ty + Bootstrap + LWE",
                en: "11ty + Bootstrap + LWE",
                de: "11ty + Bootstrap + LWE",
              },
              title: {
                nl: "Een eenvoudige website die direct bewerkbaar is.",
                en: "A simple website that is directly editable.",
                de: "Eine einfache Website, die direkt bearbeitbar ist.",
              },
              lead: {
                nl: "Deze starter gebruikt JSON als contentbron en Bootstrap voor een snelle responsive basis.",
                en: "This starter uses JSON as content source and Bootstrap for a quick responsive base.",
                de: "Dieser Starter nutzt JSON als Content-Quelle und Bootstrap als schnelle responsive Basis.",
              },
              cta: {
                nl: "Bekijk de aanpak",
                en: "View the approach",
                de: "Ansatz ansehen",
              },
            },
            sections: [
              {
                title: {
                  nl: "Content uit JSON",
                  en: "Content from JSON",
                  de: "Content aus JSON",
                },
                body: {
                  nl: "Alle zichtbare teksten staan per element in content.json.",
                  en: "All visible text lives per element in content.json.",
                  de: "Alle sichtbaren Texte stehen pro Element in content.json.",
                },
              },
              {
                title: {
                  nl: "Bootstrap als basis",
                  en: "Bootstrap as base",
                  de: "Bootstrap als Basis",
                },
                body: {
                  nl: "Layout, grid, knoppen en responsive gedrag starten vanuit Bootstrap.",
                  en: "Layout, grid, buttons and responsive behavior start from Bootstrap.",
                  de: "Layout, Grid, Buttons und responsives Verhalten starten mit Bootstrap.",
                },
              },
              {
                title: {
                  nl: "Local Website Editor voor beheer",
                  en: "Local Website Editor for editing",
                  de: "Local Website Editor zur Pflege",
                },
                body: {
                  nl: "Op /__lcb/ kun je teksten lokaal aanklikken en opslaan.",
                  en: "On /__lcb/ you can click and save text locally.",
                  de: "Auf /__lcb/ kannst du Texte lokal anklicken und speichern.",
                },
              },
            ],
          },
        },
        footer: {
          text: {
            nl: "Gebouwd met 11ty, Bootstrap en Local Website Editor.",
            en: "Built with 11ty, Bootstrap and Local Website Editor.",
            de: "Gebaut mit 11ty, Bootstrap und Local Website Editor.",
          },
          disclaimer: {
            nl: "Open source hulpmiddel. Gebruik op eigen risico; controleer zelf wat je bouwt en publiceert.",
            en: "Open source helper tool. Use at your own risk; always check what you build and publish.",
            de: "Open-Source-Hilfswerkzeug. Nutzung auf eigenes Risiko; prufe selbst, was du baust und veroffentlichst.",
          },
        },
      },
      null,
      2
    ) + "\n",
    force
  );

  writeSafe(
    path.join(targetDir, "src", "_data", "routes.json"),
    JSON.stringify(
      {
        defaultLanguage: "nl",
        pages: {
          home: {
            nl: "/",
            en: "/en/",
            de: "/de/",
          },
        },
      },
      null,
      2
    ) + "\n",
    force
  );

  writeSafe(
    path.join(targetDir, "src", "_includes", "nav.njk"),
    `{% set pageRoutes = routes.pages[pageKey] %}
<header class="site-header border-bottom bg-white">
  <nav class="navbar navbar-expand-lg container py-3">
    <a class="navbar-brand fw-black" href="{{ pageRoutes[currentLang.code] }}">LWE Site</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-controls="mobileMenu" aria-label="Menu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-end align-items-center gap-3">
      <ul class="navbar-nav gap-lg-2">
        {% for item in content.nav %}
          {% set navHref = item.href %}
          {% if item.href == "/manual/" %}
            {% set navHref = currentLang.code | manualPath %}
          {% endif %}
          <li class="nav-item">
            <a class="nav-link fw-bold" href="{{ navHref }}" data-edit-file="content.json" data-edit-path="nav.{{ loop.index0 }}.label.{{ currentLang.code }}">{{ item.label | t(currentLang.code) }}</a>
          </li>
        {% endfor %}
      </ul>
      <div class="dropdown language-switcher">
        <button class="btn btn-outline-dark btn-sm dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          {{ currentLang.label }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          {% for lang in content.languages %}
            <li>
              <a class="dropdown-item{% if lang.code == currentLang.code %} active{% endif %}" href="{{ pageRoutes[lang.code] }}">{{ lang.label }}</a>
            </li>
          {% endfor %}
        </ul>
      </div>
    </div>
  </nav>

  <div class="offcanvas offcanvas-end" tabindex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title fw-black" id="mobileMenuLabel">LWE Site</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Sluiten"></button>
    </div>
    <div class="offcanvas-body d-flex flex-column gap-4">
      <ul class="navbar-nav">
        {% for item in content.nav %}
          {% set navHref = item.href %}
          {% if item.href == "/manual/" %}
            {% set navHref = currentLang.code | manualPath %}
          {% endif %}
          <li class="nav-item">
            <a class="nav-link fw-bold" href="{{ navHref }}" data-edit-file="content.json" data-edit-path="nav.{{ loop.index0 }}.label.{{ currentLang.code }}">{{ item.label | t(currentLang.code) }}</a>
          </li>
        {% endfor %}
      </ul>
      <div class="language-switcher-mobile d-flex gap-2">
        {% for lang in content.languages %}
          <a class="btn btn-sm {% if lang.code == currentLang.code %}btn-dark{% else %}btn-outline-dark{% endif %}" href="{{ pageRoutes[lang.code] }}">{{ lang.label }}</a>
        {% endfor %}
      </div>
    </div>
  </div>
</header>
`,
    force
  );

  writeSafe(
    path.join(targetDir, "src", "_includes", "footer.njk"),
    `<footer class="site-footer bg-dark text-white py-4" id="contact">
  <div class="container d-flex flex-column flex-md-row justify-content-between gap-3">
    <strong>LWE Site</strong>
    <div>
      <p class="mb-1 text-white-50" data-edit-file="content.json" data-edit-path="footer.text.{{ currentLang.code }}">{{ content.footer.text | t(currentLang.code) }}</p>
      <p class="mb-0 small text-white-50" data-edit-file="content.json" data-edit-path="footer.disclaimer.{{ currentLang.code }}">{{ content.footer.disclaimer | t(currentLang.code) }}</p>
    </div>
  </div>
</footer>
`,
    force
  );

  writeSafe(
    path.join(targetDir, "src", "index.njk"),
    `---
pagination:
  data: content.languages
  size: 1
  alias: currentLang
pageKey: home
permalink: "{% if currentLang.code == 'nl' %}/{% else %}/{{ currentLang.code }}/{% endif %}"
---
{% set pageRoutes = routes.pages[pageKey] %}
{% set currentPath = pageRoutes[currentLang.code] %}
<!doctype html>
<html lang="{{ currentLang.code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ content.meta.title | t(currentLang.code) }}</title>
    <meta name="description" content="{{ content.meta.description | t(currentLang.code) }}">
    <link rel="canonical" href="{{ content.meta.siteUrl }}{{ currentPath }}">
    {% for lang in content.languages %}
      <link rel="alternate" hreflang="{{ lang.code }}" href="{{ content.meta.siteUrl }}{{ pageRoutes[lang.code] }}">
    {% endfor %}
    <link rel="alternate" hreflang="x-default" href="{{ content.meta.siteUrl }}/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ content.meta.title | t(currentLang.code) }}">
    <meta property="og:description" content="{{ content.meta.description | t(currentLang.code) }}">
    <meta property="og:url" content="{{ content.meta.siteUrl }}{{ currentPath }}">
    <meta property="og:image" content="{{ content.meta.siteUrl }}{{ content.meta.defaultImage }}">
    <meta name="twitter:card" content="summary_large_image">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/system.css">
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body>
    {% include "nav.njk" %}

    <main id="start">
      <section class="hero py-5 py-lg-6">
        <div class="container py-5">
          <div class="row align-items-center g-5">
            <div class="col-lg-8">
              <p class="eyebrow" data-edit-file="content.json" data-edit-path="pages.home.hero.eyebrow.{{ currentLang.code }}">{{ content.pages.home.hero.eyebrow | t(currentLang.code) }}</p>
              <h1 class="display-2 fw-black lh-1" data-edit-file="content.json" data-edit-path="pages.home.hero.title.{{ currentLang.code }}">{{ content.pages.home.hero.title | t(currentLang.code) }}</h1>
              <p class="lead mt-4 text-block" data-edit-file="content.json" data-edit-path="pages.home.hero.lead.{{ currentLang.code }}">{{ content.pages.home.hero.lead | t(currentLang.code) }}</p>
              <a class="btn btn-primary btn-lg fw-bold mt-3" href="#aanpak" data-edit-file="content.json" data-edit-path="pages.home.hero.cta.{{ currentLang.code }}">{{ content.pages.home.hero.cta | t(currentLang.code) }}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="container py-5" id="aanpak">
        <div class="row g-4">
          {% for section in content.pages.home.sections %}
            <div class="col-md-4">
              <article class="card h-100 shadow-sm">
                <div class="card-body">
                  <h2 class="h4 fw-black" data-edit-file="content.json" data-edit-path="pages.home.sections.{{ loop.index0 }}.title.{{ currentLang.code }}">{{ section.title | t(currentLang.code) }}</h2>
                  <p class="mb-0 text-secondary text-block" data-edit-file="content.json" data-edit-path="pages.home.sections.{{ loop.index0 }}.body.{{ currentLang.code }}">{{ section.body | t(currentLang.code) }}</p>
                </div>
              </article>
            </div>
          {% endfor %}
        </div>
      </section>
    </main>

    {% include "footer.njk" %}

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/assets/system-calendar.js" defer></script>
  </body>
</html>
`,
    force
  );

  writeSafe(
    path.join(targetDir, "src", "manual.njk"),
    `---
pagination:
  data: content.languages
  size: 1
  alias: currentLang
permalink: "{% if currentLang.code == 'nl' %}/manual/{% else %}/manual/{{ currentLang.code }}/{% endif %}"
---
{% set manual = manualPages[currentLang.code] or manualPages.nl %}
<!doctype html>
<html lang="{{ currentLang.code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ manual.title }}</title>
    <meta name="description" content="{{ manual.description }}">
    <link rel="canonical" href="{{ content.meta.siteUrl }}{{ currentLang.code | manualPath }}">
    {% for lang in content.languages %}
      <link rel="alternate" hreflang="{{ lang.code }}" href="{{ content.meta.siteUrl }}{{ lang.code | manualPath }}">
    {% endfor %}
    <link rel="alternate" hreflang="x-default" href="{{ content.meta.siteUrl }}/manual/">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/system.css">
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body>
    <header class="container-fluid border-bottom bg-light">
      <div class="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <a class="navbar-brand fw-black text-decoration-none" href="/">
          <span class="badge text-bg-dark me-2">LWE</span>
          Local Website Editor
        </a>
        <nav class="d-flex flex-wrap align-items-center gap-2" aria-label="Manual navigation">
          <a class="btn btn-sm btn-outline-dark" href="/">Demo</a>
          <a class="btn btn-sm btn-dark" href="{{ currentLang.code | manualPath }}">Manual</a>
          <span class="btn-group btn-group-sm" aria-label="Manual language choice">
            {% for lang in content.languages %}
              <a class="btn {% if lang.code == currentLang.code %}btn-dark{% else %}btn-outline-dark{% endif %}" href="{{ lang.code | manualPath }}">{{ lang.label }}</a>
            {% endfor %}
          </span>
        </nav>
      </div>
    </header>

    <main class="container py-5">
      <article class="manual-content mx-auto">
        {{ manual.html | safe }}
      </article>
    </main>

    {% include "footer.njk" %}
  </body>
</html>
`,
    force
  );

  writeSafe(
    path.join(targetDir, "src", "assets", "system.css"),
    read("src/assets/system.css"),
    force
  );

  writeSafe(
    path.join(targetDir, "src", "assets", "system-calendar.js"),
    read("src/assets/system-calendar.js"),
    force
  );

  writeSafe(
    path.join(targetDir, "src", "assets", "styles.css"),
    `:root {
  --bs-primary: #0f7dd6;
  --bs-primary-rgb: 15, 125, 214;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f6f2;
}

main {
  flex: 1 0 auto;
}

.fw-black {
  font-weight: 900;
}

.hero {
  background: linear-gradient(135deg, rgba(15, 125, 214, 0.12), rgba(255, 212, 61, 0.22));
}

.site-footer {
  margin-top: auto;
}

.eyebrow {
  color: #095b9f;
  font-size: 0.82rem;
  font-weight: 900;
  text-transform: uppercase;
}

.manual-content {
  max-width: 920px;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: #fff;
  border: 1px solid #dfe3e8;
  border-radius: 0.5rem;
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.08);
}

.manual-content h1 {
  margin-bottom: 1rem;
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  font-weight: 900;
}

.manual-content h2 {
  margin-top: 2.75rem;
  padding-top: 1.75rem;
  border-top: 1px solid #dfe3e8;
  font-weight: 900;
}

.manual-content pre {
  overflow-x: auto;
  padding: 1rem;
  background: #101214;
  color: #d7f7ff;
  border-radius: 0.5rem;
}

.manual-content :not(pre) > code {
  padding: 0.12rem 0.32rem;
  background: #eef2f6;
  border-radius: 0.3rem;
}
`,
    force
  );

  writeSafe(
    path.join(targetDir, "src", "assets", "social-preview.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Local Website Editor</title>
  <desc id="desc">Social preview placeholder.</desc>
  <rect width="1200" height="630" fill="#f7f6f2"/>
  <rect x="80" y="80" width="1040" height="470" rx="24" fill="#151617"/>
  <rect x="120" y="120" width="120" height="120" rx="16" fill="#ffd43d"/>
  <text x="180" y="192" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#151617">LWE</text>
  <text x="120" y="330" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="#ffffff">Local Website Editor</text>
  <text x="120" y="410" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#bfc7d2">11ty + JSON + Bootstrap</text>
</svg>
`,
    force
  );
}

function installExistingSite(targetDir, force) {
  if (!fs.existsSync(targetDir)) {
    console.error(`Projectmap bestaat niet: ${targetDir}`);
    process.exit(1);
  }

  updatePackageJson(targetDir, "existing");
  installRuntime(targetDir, force, "existing");
}

const { targetDir, mode, force } = parseArgs(process.argv);

if (mode === "new") {
  installNewSite(targetDir, force);
} else {
  installExistingSite(targetDir, force);
}

console.log("");
console.log("Klaar.");
console.log("Volgende stappen:");
console.log(`  cd ${targetDir}`);
console.log("  npm install");
console.log("  npm run lwe:next");
console.log("");
console.log("Daarna begeleidt LWE:next de intake, het voorstel en de buildfase.");
console.log("Na akkoord en build start de AI of gebruiker npm run lcb.");
if (mode === "new") {
  console.log("Start hier: http://127.0.0.1:8082/manual/");
  console.log("Demo:       http://127.0.0.1:8082/");
} else {
  console.log("Website:    http://127.0.0.1:8082/");
}
console.log("Editor:  http://127.0.0.1:8082/__lcb/");
