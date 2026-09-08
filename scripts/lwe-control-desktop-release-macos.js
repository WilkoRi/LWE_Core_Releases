#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const desktopDir = path.join(rootDir, "desktop", "lwe-control");
const builtApp = path.join(
  desktopDir,
  "src-tauri",
  "target",
  "release",
  "bundle",
  "macos",
  "LWE Control.app"
);
const releaseDir = path.join(rootDir, "release-assets", "macos");
const releaseApp = path.join(releaseDir, "LWE Control.app");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

if (process.platform !== "darwin") {
  console.error("Deze macOS app-bundle kan alleen op macOS worden gebouwd.");
  process.exit(1);
}

console.log("LWE Control macOS release build");
console.log("==============================");
console.log("");

run("npm", ["--prefix", "desktop/lwe-control", "install"]);
run("npm", ["--prefix", "desktop/lwe-control", "run", "tauri:build"]);

if (!fs.existsSync(builtApp)) {
  console.error(`Gebouwde app niet gevonden: ${builtApp}`);
  process.exit(1);
}

fs.rmSync(releaseApp, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });
fs.cpSync(builtApp, releaseApp, { recursive: true });

console.log("");
console.log("LWE Control.app staat klaar:");
console.log(releaseApp);
console.log("");
console.log("Voor een projecttest: kopieer deze app naast package.json in de projectmap.");
