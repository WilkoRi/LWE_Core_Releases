#!/usr/bin/env node
const fs = require("node:fs");
const https = require("node:https");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "lwe-update.config.json");
const versionPath = path.join(root, "lwe-process", "version.json");
const manifestName = "lwe-release-manifest.json";

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function updateConfig() {
  const config = readJson(configPath, {});
  const pkg = readJson(path.join(root, "package.json"), {});
  const repository = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url || "";
  const match = repository.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/);

  return {
    repo: config.github?.repo || (match ? match[1] : ""),
  };
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "LWE-Update-Install",
      },
    }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`GitHub gaf HTTP ${response.statusCode}`));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error("Timeout bij GitHub release-info"));
    });
  });
}

function downloadFile(url, targetPath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: { "User-Agent": "LWE-Update-Install" },
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, targetPath).then(resolve, reject);
        return;
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Download gaf HTTP ${response.statusCode}`));
        return;
      }

      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      const output = fs.createWriteStream(targetPath);
      response.pipe(output);
      output.on("finish", () => {
        output.close(resolve);
      });
      output.on("error", reject);
    });

    request.on("error", reject);
    request.setTimeout(60000, () => {
      request.destroy(new Error("Timeout bij release-download"));
    });
  });
}

function assertManifest(extractedRoot) {
  const manifestPath = path.join(extractedRoot, manifestName);
  const manifest = readJson(manifestPath, null);

  if (!manifest || !Array.isArray(manifest.managedFiles) || !Array.isArray(manifest.neverOverwrite)) {
    throw new Error(`Release bevat geen geldig ${manifestName}`);
  }

  if (!manifest.neverOverwrite.includes(".htaccess")) {
    throw new Error("Release-manifest mist .htaccess in neverOverwrite");
  }
}

function normalizeVersion(value) {
  return String(value || "0.0.0").replace(/^v/i, "");
}

function compareVersions(a, b) {
  const left = normalizeVersion(a).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = normalizeVersion(b).split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const force = process.argv.includes("--force");
  const config = updateConfig();
  const version = readJson(versionPath, { lwe: {} });
  const current = version.lwe?.runtimeVersion || version.lwe?.coreVersion || "unknown";

  console.log("LWE UPDATE INSTALL");
  console.log("==================");
  console.log("");

  if (!apply) {
    console.log("Dry-run. Er wordt niets geinstalleerd.");
    console.log("Gebruik alleen na akkoord:");
    console.log("npm run lwe:update-install -- --apply");
    console.log("");
  }

  if (!config.repo) {
    console.log("GitHub repository is niet ingesteld.");
    console.log("Maak een lwe-update.config.json met bijvoorbeeld:");
    console.log(JSON.stringify({ github: { repo: "jouw-account/LWE_Core_02" } }, null, 2));
    process.exit(0);
  }

  const release = await requestJson(`https://api.github.com/repos/${config.repo}/releases/latest`);
  const latest = release.tag_name || release.name || "unknown";
  const hasNewerRelease = current === "unknown" ? true : compareVersions(latest, current) > 0;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lwe-release-"));
  const tarPath = path.join(tmpDir, "release.tar.gz");

  console.log(`Huidige runtime: ${current}`);
  console.log(`Release: ${latest}`);
  console.log(`Bron: ${release.tarball_url}`);

  if (!hasNewerRelease && !force) {
    console.log("");
    console.log("Je bent al up-to-date. Er hoeft niets geinstalleerd te worden.");
    console.log("Wil je dezelfde release bewust opnieuw installeren, gebruik dan:");
    console.log("npm run lwe:update-install -- --apply --force");
    return;
  }

  if (!apply) {
    console.log("");
    console.log("Installatieplan:");
    console.log("- download de GitHub release tarball");
    console.log(`- controleer ${manifestName}`);
    console.log("- draai de release-updater tegen dit project met --apply");
    return;
  }

  await downloadFile(release.tarball_url, tarPath);

  const extract = spawnSync("tar", ["-xzf", tarPath, "-C", tmpDir], { stdio: "inherit" });
  if (extract.status !== 0) {
    throw new Error("Uitpakken van release tarball is mislukt");
  }

  const extracted = fs.readdirSync(tmpDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(tmpDir, entry.name))
    .find((dir) => fs.existsSync(path.join(dir, manifestName)));

  if (!extracted) {
    throw new Error(`Geen uitgepakte release met ${manifestName} gevonden`);
  }

  assertManifest(extracted);

  const updater = path.join(extracted, "scripts", "lwe-update.js");
  if (!fs.existsSync(updater)) {
    throw new Error("Release bevat geen scripts/lwe-update.js");
  }

  const result = spawnSync(process.execPath, [updater, root, "--apply"], {
    cwd: extracted,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("Release updater is mislukt");
  }
}

main().catch((error) => {
  console.error("LWE UPDATE INSTALL FAILED");
  console.error(error.message);
  process.exit(1);
});
