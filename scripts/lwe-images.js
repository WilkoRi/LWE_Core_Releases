#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("LWE IMAGES BLOCKED");
  console.error("Sharp is niet geinstalleerd. Draai eerst: npm install");
  process.exit(1);
}

const root = process.cwd();
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const force = args.includes("--force");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const skippedExtensions = new Set([".svg", ".gif"]);

const defaultConfig = {
  sourceDir: "project-input/afbeeldingen",
  outputDir: "",
  defaultPreset: "general",
  maxInputBytesWarning: 5 * 1024 * 1024,
  presets: {
    general: {
      description: "Algemene website-afbeelding, zonder crop.",
      width: 1600,
      height: 1600,
      fit: "inside",
      format: "webp",
      quality: 82
    },
    hero: {
      description: "Grote header/hero-afbeelding, zonder crop.",
      width: 2200,
      height: 1400,
      fit: "inside",
      format: "webp",
      quality: 82
    },
    person: {
      description: "Persoonsfoto; bron mag verschillen, tonen gebeurt via CSS.",
      width: 1200,
      height: 1200,
      fit: "inside",
      format: "webp",
      quality: 84,
      includeNamePattern: "persoon|person|people|team|portrait|portret|profiel|profile|headshot|voorzitter|secretaris|penningmeester|bestuur|vertrouwens|mario|bouke|martijn",
      warnIfAspectRatioOutside: [0.75, 1.33]
    },
    logo: {
      description: "Logo; nooit croppen, verhouding behouden.",
      width: 1200,
      height: 500,
      fit: "inside",
      format: "png",
      quality: 90,
      includeNamePattern: "logo"
    }
  }
};

function argValue(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  } catch {
    return fallback;
  }
}

function mergeConfig(base, override) {
  return {
    ...base,
    ...override,
    presets: {
      ...base.presets,
      ...(override.presets || {})
    }
  };
}

function isInsidePath(baseDir, targetPath) {
  const relative = path.relative(baseDir, targetPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveInside(rel) {
  const target = path.resolve(root, rel || ".");
  if (!isInsidePath(root, target)) {
    throw new Error(`Pad valt buiten projectmap: ${rel}`);
  }
  return target;
}

function detectDefaultOutputDir() {
  if (fs.existsSync(path.join(root, "src", "assets"))) {
    return "src/assets/images/processed";
  }

  return "assets/images/processed";
}

function listFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }

  walk(dir);
  return out.sort();
}

function fileSizeLabel(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function outputExtension(format, sourceExt) {
  if (format === "keep") return sourceExt === ".jpeg" ? ".jpg" : sourceExt;
  if (format === "jpeg") return ".jpg";
  return `.${format}`;
}

function safeBaseName(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "image";
}

function compileMatch(pattern) {
  if (!pattern) return null;
  try {
    return new RegExp(pattern, "i");
  } catch {
    throw new Error(`Ongeldig --match patroon: ${pattern}`);
  }
}

async function imageInfo(filePath) {
  const stats = fs.statSync(filePath);
  const metadata = await sharp(filePath, { failOn: "none" }).metadata();
  return {
    bytes: stats.size,
    width: metadata.width || 0,
    height: metadata.height || 0,
    hasAlpha: Boolean(metadata.hasAlpha),
    format: metadata.format || ""
  };
}

function buildWarnings(rel, info, preset, config) {
  const warnings = [];
  if (info.bytes > config.maxInputBytesWarning) {
    warnings.push(`groot bronbestand (${fileSizeLabel(info.bytes)})`);
  }
  if (!info.width || !info.height) {
    warnings.push("afmetingen onbekend");
  }
  if (preset.warnIfAspectRatioOutside && info.width && info.height) {
    const ratio = info.width / info.height;
    const [min, max] = preset.warnIfAspectRatioOutside;
    if (ratio < min || ratio > max) {
      warnings.push(`verhouding ${ratio.toFixed(2)} past mogelijk niet bij dit slot`);
    }
  }
  if (preset.format === "jpeg" && info.hasAlpha) {
    warnings.push("bron heeft transparantie; jpeg verwijdert transparantie");
  }
  if (/logo/i.test(rel) && preset.fit !== "inside") {
    warnings.push("logo mag niet automatisch worden gecropt");
  }
  return warnings;
}

async function writeOptimized(source, target, preset) {
  let pipeline = sharp(source, { failOn: "none" }).rotate();
  pipeline = pipeline.resize({
    width: preset.width,
    height: preset.height,
    fit: preset.fit || "inside",
    withoutEnlargement: true
  });

  const format = preset.format || "webp";
  if (format === "webp") {
    pipeline = pipeline.webp({ quality: preset.quality || 82 });
  } else if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality: preset.quality || 82, mozjpeg: true });
  } else if (format === "png") {
    pipeline = pipeline.png({ quality: preset.quality || 90, compressionLevel: 9 });
  } else if (format === "avif") {
    pipeline = pipeline.avif({ quality: preset.quality || 60 });
  }

  await pipeline.toFile(target);
}

async function main() {
  const config = mergeConfig(defaultConfig, readJson("lwe-image.config.json", {}));
  const presetName = argValue("preset", config.defaultPreset || "general");
  const preset = config.presets[presetName];
  const matchPattern = argValue("match", preset?.includeNamePattern || "");
  const match = compileMatch(matchPattern);

  if (!preset) {
    console.error(`Onbekende image preset: ${presetName}`);
    console.error(`Beschikbaar: ${Object.keys(config.presets).join(", ")}`);
    process.exit(1);
  }

  const sourceDirRel = argValue("source", config.sourceDir);
  const outputDirRel = argValue("output", config.outputDir || detectDefaultOutputDir());
  const sourceDir = resolveInside(sourceDirRel);
  const outputDir = resolveInside(outputDirRel);

  if (isInsidePath(sourceDir, outputDir) || isInsidePath(outputDir, sourceDir)) {
    console.error("LWE IMAGES BLOCKED");
    console.error("Gebruik gescheiden input- en outputmappen.");
    console.error(`Input:  ${sourceDirRel}`);
    console.error(`Output: ${outputDirRel}`);
    process.exit(1);
  }

  const files = listFiles(sourceDir);
  const plans = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const rel = path.relative(root, file);
    const baseName = path.basename(file);

    if (baseName.startsWith(".")) {
      continue;
    }

    if (match && !match.test(baseName)) {
      continue;
    }

    if (skippedExtensions.has(ext)) {
      plans.push({ rel, status: "skip", reason: "vector/animatie wordt niet automatisch gecomprimeerd" });
      continue;
    }

    if (!supportedExtensions.has(ext)) {
      plans.push({ rel, status: "skip", reason: "geen ondersteund afbeeldingsformaat" });
      continue;
    }

    const info = await imageInfo(file);
    const targetExt = outputExtension(preset.format || "webp", ext);
    const targetName = `${safeBaseName(file)}-${presetName}${targetExt}`;
    const target = path.join(outputDir, targetName);
    const targetRel = path.relative(root, target);
    const exists = fs.existsSync(target);
    const warnings = buildWarnings(rel, info, preset, config);

    plans.push({
      rel,
      targetRel,
      status: exists && !force ? "skip" : apply ? "write" : "plan",
      reason: exists && !force ? "output bestaat al; gebruik --force om generated output te vernieuwen" : "",
      info,
      warnings
    });
  }

  console.log("LWE IMAGES");
  console.log("==========");
  console.log("");
  console.log(`Mode: ${apply ? "apply" : "dry-run"}`);
  console.log(`Preset: ${presetName} - ${preset.description}`);
  if (matchPattern) console.log(`Match: ${matchPattern}`);
  console.log(`Input:  ${sourceDirRel}`);
  console.log(`Output: ${outputDirRel}`);
  console.log("");
  console.log("Veiligheidsregels:");
  console.log("- originelen worden nooit overschreven");
  console.log("- output gaat naar een aparte generated/processed map");
  console.log("- standaard wordt niet gecropt; verhouding blijft behouden");
  console.log("- bestaande output wordt niet overschreven zonder --force");
  console.log("");

  if (!plans.length) {
    console.log("Geen afbeeldingen gevonden.");
    return;
  }

  const manifest = [];
  for (const plan of plans) {
    if (plan.status === "skip") {
      console.log(`skip: ${plan.rel}${plan.reason ? ` (${plan.reason})` : ""}`);
      continue;
    }

    const size = `${plan.info.width}x${plan.info.height}, ${fileSizeLabel(plan.info.bytes)}`;
    console.log(`${plan.status}: ${plan.rel} -> ${plan.targetRel} (${size})`);
    for (const warning of plan.warnings) {
      console.log(`  warning: ${warning}`);
    }

    if (apply && plan.status === "write") {
      fs.mkdirSync(path.dirname(path.join(root, plan.targetRel)), { recursive: true });
      await writeOptimized(path.join(root, plan.rel), path.join(root, plan.targetRel), preset);
      const output = await imageInfo(path.join(root, plan.targetRel));
      manifest.push({
        source: plan.rel,
        output: plan.targetRel,
        preset: presetName,
        sourceWidth: plan.info.width,
        sourceHeight: plan.info.height,
        sourceBytes: plan.info.bytes,
        outputWidth: output.width,
        outputHeight: output.height,
        outputBytes: output.bytes
      });
    }
  }

  if (apply && manifest.length) {
    const manifestPath = path.join(outputDir, "manifest.json");
    fs.writeFileSync(manifestPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), items: manifest }, null, 2)}\n`);
    console.log("");
    console.log(`Manifest: ${path.relative(root, manifestPath)}`);
  }

  if (!apply) {
    console.log("");
    console.log("Voer uit met --apply als dit plan klopt.");
  }
}

main().catch((error) => {
  console.error("LWE IMAGES BLOCKED");
  console.error(error.message);
  process.exit(1);
});
