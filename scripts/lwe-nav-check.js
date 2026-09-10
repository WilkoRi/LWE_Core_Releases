#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const args = process.argv.slice(2);
const contractArg = args.find((arg) => arg.startsWith("--contract="));
const required = args.includes("--required");
const contractRel = contractArg ? contractArg.slice("--contract=".length) : "project-input/navigation-contract.json";
const contractPath = path.resolve(root, contractRel);
const config = readJson("lcb.config.json", {});
const siteDirName = config.siteDir || "_site";
const siteDir = path.resolve(root, siteDirName);

function readJson(rel, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(root, rel), "utf8"));
  } catch {
    return fallback;
  }
}

function readDataFile(rel) {
  const candidates = rel.includes("/") || rel.includes("\\")
    ? [rel]
    : [`_data/${rel}`, `src/_data/${rel}`, rel];

  for (const candidate of candidates) {
    const filePath = path.resolve(root, candidate);
    if (!fs.existsSync(filePath)) continue;

    if (candidate.endsWith(".json")) {
      return { rel: candidate, data: JSON.parse(fs.readFileSync(filePath, "utf8")) };
    }

    if (candidate.endsWith(".js") || candidate.endsWith(".cjs")) {
      delete require.cache[require.resolve(filePath)];
      return { rel: candidate, data: require(filePath) };
    }
  }

  return { rel, data: null };
}

function getPathValue(value, dottedPath) {
  if (!dottedPath) return value;
  return dottedPath.split(".").reduce((current, part) => {
    if (current == null) return undefined;
    return current[part];
  }, value);
}

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".html")) {
        out.push(full);
      }
    }
  }

  walk(dir);
  return out;
}

function internalUrlToFile(url) {
  if (!url || /^(https?:|mailto:|tel:|#)/.test(url)) return "";
  const cleanUrl = url.split("#")[0].split("?")[0];
  if (!cleanUrl || cleanUrl === "/") return path.join(siteDir, "index.html");
  if (cleanUrl.endsWith("/")) return path.join(siteDir, cleanUrl, "index.html");
  return path.join(siteDir, cleanUrl);
}

function flattenItems(items, depth = 1) {
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    out.push({ item, depth });
    if (Array.isArray(item.children)) {
      out.push(...flattenItems(item.children, depth + 1));
    }
  }
  return out;
}

function maxDepth(items) {
  return flattenItems(items).reduce((max, entry) => Math.max(max, entry.depth), 0);
}

function findItem(items, expected) {
  const key = expected.key || expected.pageKey;
  if (!key) return null;
  return flattenItems(items).find(({ item }) => item.key === key || item.pageKey === key) || null;
}

function resolveLocalized(value, lang) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value[lang] || value.default || "";
  return "";
}

function resolveExpectedUrl(item, lang, siteData) {
  const explicit = resolveLocalized(item.url || item.href, lang);
  if (explicit) return explicit;

  const pageKey = item.pageKey || item.key;
  const pageUrl = pageKey ? siteData?.pages?.[pageKey]?.[lang] : "";
  return pageUrl || "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function htmlContainsHref(html, href) {
  return new RegExp(`\\bhref\\s*=\\s*["']${escapeRegExp(href)}["']`, "i").test(html);
}

const errors = [];
const warnings = [];

console.log("LWE NAV CHECK");
console.log("=============");
console.log("");

if (!fs.existsSync(contractPath)) {
  const message = `geen navigatie-contract gevonden: ${contractRel}`;
  if (required) {
    console.error(`LWE NAV CHECK BLOCKED: ${message}`);
    process.exit(1);
  }
  console.log(`- skipped: ${message}`);
  process.exit(0);
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const siteLoad = readDataFile(contract.siteDataFile || "site.js");
const siteData = siteLoad.data || {};
const languages = Array.isArray(contract.languages)
  ? contract.languages
  : Object.keys(siteData.languages || { nl: true });
const htmlFiles = listHtmlFiles(siteDir);
const htmlCache = new Map();

function htmlFileContent(filePath) {
  if (!htmlCache.has(filePath)) {
    htmlCache.set(filePath, fs.readFileSync(filePath, "utf8"));
  }
  return htmlCache.get(filePath);
}

function anyHtmlContainsHref(href) {
  for (const filePath of htmlFiles) {
    if (htmlContainsHref(htmlFileContent(filePath), href)) return true;
  }
  return false;
}

const menus = contract.menus || {};
const menuNames = Object.keys(menus);

if (!menuNames.length) {
  errors.push("contract bevat geen menus-object");
}

for (const menuName of menuNames) {
  const menu = menus[menuName] || {};
  const items = Array.isArray(menu.items) ? menu.items : [];
  const dataFile = menu.dataFile || contract.siteDataFile || "site.js";
  const sourcePath = menu.sourcePath || (menuName === "primary" ? "nav" : menuName);
  const dataLoad = readDataFile(dataFile);
  const sourceItems = getPathValue(dataLoad.data, sourcePath);

  console.log(`${menuName}:`);
  console.log(`- contract items: ${flattenItems(items).length}`);
  console.log(`- bron: ${dataLoad.rel} -> ${sourcePath}`);

  if (!items.length && menu.required !== false) {
    errors.push(`${menuName}: verplicht menu heeft geen contract-items`);
  }

  if (!Array.isArray(sourceItems)) {
    if (menu.required === false) {
      warnings.push(`${menuName}: bronmenu niet gevonden (${dataFile} -> ${sourcePath})`);
    } else {
      errors.push(`${menuName}: bronmenu niet gevonden (${dataFile} -> ${sourcePath})`);
    }
    console.log("");
    continue;
  }

  const sourceDepth = maxDepth(sourceItems);
  const contractDepth = maxDepth(items);
  const allowedDepth = Number(menu.maxDepth || contract.maxDepth || 10);
  if (contractDepth > allowedDepth) {
    errors.push(`${menuName}: contract gebruikt niveau ${contractDepth}, toegestaan is ${allowedDepth}`);
  }
  if (sourceDepth > allowedDepth) {
    errors.push(`${menuName}: bronmenu gebruikt niveau ${sourceDepth}, toegestaan is ${allowedDepth}`);
  }

  for (const entry of flattenItems(items)) {
    const item = entry.item;
    const label = item.key || item.pageKey || JSON.stringify(item.label || item.url || item.href || {});
    const sourceMatch = findItem(sourceItems, item);

    if (!sourceMatch && item.required !== false) {
      errors.push(`${menuName}: contract-item ontbreekt in bronmenu: ${label}`);
    }

    for (const lang of languages) {
      const expectedUrl = resolveExpectedUrl(item, lang, siteData);
      if (!expectedUrl) {
        if (item.required !== false) errors.push(`${menuName}: ${label} mist URL voor taal ${lang}`);
        continue;
      }

      const outputFile = internalUrlToFile(expectedUrl);
      if (outputFile && fs.existsSync(siteDir) && !fs.existsSync(outputFile)) {
        errors.push(`${menuName}: ${label} verwijst naar ontbrekende output: ${siteDirName}/${path.relative(siteDir, outputFile)}`);
      }

      if (htmlFiles.length && !anyHtmlContainsHref(expectedUrl)) {
        errors.push(`${menuName}: ${label} wordt niet als href gerenderd in ${siteDirName}/ (${expectedUrl})`);
      }
    }
  }

  console.log(`- bron items: ${flattenItems(sourceItems).length}`);
  console.log(`- max depth: contract ${contractDepth}, bron ${sourceDepth}, toegestaan ${allowedDepth}`);
  console.log("");
}

if (warnings.length) {
  console.log("Waarschuwingen:");
  for (const warning of warnings) console.log(`- ${warning}`);
  console.log("");
}

if (errors.length) {
  console.error("LWE NAV CHECK BLOCKED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("LWE NAV CHECK OK");
