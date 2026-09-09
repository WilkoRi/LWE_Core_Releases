#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const config = readJson("lcb.config.json", {});
const siteDirName = config.siteDir || "_site";
const siteDir = path.resolve(root, siteDirName);

const forbiddenPublishNames = new Set([
  ".env",
  "AI_START_HERE.md",
  "LCB-AI-INSTRUCTIES.md",
  "MANUAL.md",
  "MANUAL.en.md",
  "MANUAL.de.md",
  "lwe-image.config.json",
  ".lwe-backups",
  "lcb",
  "lcb-context",
  "lwe",
  "lwe-process",
  "node_modules",
  "project-input",
  "scripts",
  "server.js",
  "lcb-server.js",
]);

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

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = path.relative(siteDir, full);
      out.push(rel);
      if (entry.isDirectory()) walk(full);
    }
  }

  walk(dir);
  return out.sort();
}

function isForbiddenPublishPath(rel) {
  const parts = rel.split(path.sep);
  return parts.some((part) => forbiddenPublishNames.has(part) || part.endsWith(".bak"));
}

const localOnlyPaths = [
  "project-input",
  "lcb",
  "lwe-process",
  "lcb-context",
  "lwe",
  "node_modules",
  "scripts",
  "server.js",
  "lcb-server.js",
  "LCB-AI-INSTRUCTIES.md",
  "AI_START_HERE.md",
  "MANUAL.md",
  "MANUAL.en.md",
  "MANUAL.de.md",
  "lwe-image.config.json",
  "manual_images",
  ".lwe-backups",
  ".env",
].filter(exists);

const siteFiles = listFiles(siteDir);
const forbiddenInSite = siteFiles.filter(isForbiddenPublishPath);
const editorOnlyButtonPattern = /<button\b(?=[^>]*\bdata-edit-(?:path|href-path|src-path)=)[\s\S]*?<\/button>/i;
const editorOnlyButtonsInSite = siteFiles.filter((rel) => {
  if (!rel.endsWith(".html")) return false;
  const filePath = path.join(siteDir, rel);
  return editorOnlyButtonPattern.test(fs.readFileSync(filePath, "utf8"));
});

console.log("LWE PUBLISH CHECK");
console.log("=================");
console.log("");
console.log("PUBLICATIE WAARSCHUWING:");
console.log(`Upload naar webserver / ftp / hosting ALLEEN de inhoud van ${siteDirName}/.`);
console.log("Upload niet de hele projectmap naar public_html.");
console.log("");
console.log("Wat normaal online mag:");
console.log(`- de inhoud van ${siteDirName}/`);
console.log("");
console.log("Wat normaal lokaal blijft:");
for (const item of localOnlyPaths) {
  console.log(`- ${item}`);
}
if (!localOnlyPaths.length) {
  console.log("- geen bekende lokale LWE-bestanden gevonden");
}
console.log("");

if (!fs.existsSync(siteDir)) {
  console.error(`LWE PUBLISH CHECK BLOCKED: ${siteDirName}/ bestaat nog niet.`);
  console.error("Draai eerst npm run build nadat LWE de buildfase toestaat.");
  process.exit(1);
}

if (!siteFiles.length) {
  console.error(`LWE PUBLISH CHECK BLOCKED: ${siteDirName}/ is leeg.`);
  console.error("Draai eerst npm run build en controleer de output.");
  process.exit(1);
}

console.log(`${siteDirName}/ check:`);
console.log(`- gevonden items: ${siteFiles.length}`);

if (forbiddenInSite.length) {
  console.error("- violation: lokale LWE-bestanden aangetroffen in de publicatie-output");
  for (const item of forbiddenInSite.slice(0, 20)) {
    console.error(`- niet publiceren: ${siteDirName}/${item}`);
  }
  if (forbiddenInSite.length > 20) {
    console.error(`- plus ${forbiddenInSite.length - 20} extra item(s)`);
  }
  console.error("");
  console.error("LWE PUBLISH CHECK BLOCKED");
  process.exit(1);
}

if (editorOnlyButtonsInSite.length) {
  console.error("- violation: editor-only knoppen aangetroffen in de publicatie-output");
  for (const item of editorOnlyButtonsInSite.slice(0, 20)) {
    console.error(`- bevat editor-knop: ${siteDirName}/${item}`);
  }
  if (editorOnlyButtonsInSite.length > 20) {
    console.error(`- plus ${editorOnlyButtonsInSite.length - 20} extra item(s)`);
  }
  console.error("");
  console.error("LWE PUBLISH CHECK BLOCKED");
  process.exit(1);
}

console.log("- ok: geen bekende lokale LWE-bestanden in de publicatie-output");
console.log("- ok: geen editor-only knoppen in de publicatie-output");
console.log("");
console.log("Als je FTP of hosting gebruikt:");
console.log(`- open ${siteDirName}/`);
console.log("- upload de inhoud van die map naar public_html of de webroot van je hostingprovider");
console.log("- upload niet de projectmap zelf");
console.log("");
console.log("LWE PUBLISH CHECK OK");
