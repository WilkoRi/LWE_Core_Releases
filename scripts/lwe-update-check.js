#!/usr/bin/env node
const fs = require("node:fs");
const https = require("node:https");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "lwe-update.config.json");
const versionPath = path.join(root, "lwe-process", "version.json");
const packagePath = path.join(root, "package.json");

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
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

function updateConfig() {
  const config = readJson(configPath, {});
  const pkg = readJson(packagePath, {});
  const repository = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url || "";
  const match = repository.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/);
  const repo = config.github?.repo || (match ? match[1] : "");

  return {
    repo,
    manifestAssetName: config.github?.manifestAssetName || "lwe-release-manifest.json",
    releaseAssetName: config.github?.releaseAssetName || "",
  };
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "User-Agent": "LWE-Update-Check",
        },
      },
      (response) => {
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
      }
    );

    request.on("error", reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error("Timeout bij GitHub update-check"));
    });
  });
}

async function main() {
  const version = readJson(versionPath, { lwe: {} });
  const current = version.lwe?.runtimeVersion || version.lwe?.coreVersion || "unknown";
  const config = updateConfig();

  console.log("LWE UPDATE CHECK");
  console.log("================");
  console.log("");
  console.log(`Huidige runtime: ${current}`);

  if (!config.repo) {
    console.log("GitHub repository: niet ingesteld");
    console.log("");
    console.log("Maak een lwe-update.config.json met bijvoorbeeld:");
    console.log(JSON.stringify({ github: { repo: "jouw-account/LWE_Core_02" } }, null, 2));
    process.exit(0);
  }

  console.log(`GitHub repository: ${config.repo}`);

  const release = await requestJson(`https://api.github.com/repos/${config.repo}/releases/latest`);
  const latest = release.tag_name || release.name || "unknown";
  const newer = current === "unknown" ? true : compareVersions(latest, current) > 0;
  const manifestAsset = Array.isArray(release.assets)
    ? release.assets.find((asset) => asset.name === config.manifestAssetName)
    : null;
  const packageAsset = config.releaseAssetName && Array.isArray(release.assets)
    ? release.assets.find((asset) => asset.name === config.releaseAssetName)
    : null;

  console.log(`Nieuwste release: ${latest}`);
  console.log(`Update beschikbaar: ${newer ? "ja" : "nee"}`);
  console.log(`Manifest asset: ${manifestAsset ? manifestAsset.name : "niet gevonden"}`);
  if (config.releaseAssetName) {
    console.log(`Release pakket: ${packageAsset ? packageAsset.name : "niet gevonden"}`);
  } else {
    console.log("Release pakket: GitHub tarball");
  }

  if (release.body) {
    console.log("");
    console.log("Changelog:");
    console.log(release.body.trim());
  }

  console.log("");
  console.log("Installeren kan alleen expliciet met:");
  console.log("npm run lwe:update-install");
}

main().catch((error) => {
  console.error("LWE UPDATE CHECK FAILED");
  console.error(error.message);
  process.exit(1);
});
