#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const {
  getPathValue,
  hasSurpriseAnswer,
  isAnswered,
  requiredIntakeFields,
  verifyStateSignature,
  withStateSignature,
} = require("./lwe-rules");

const root = process.cwd();
const statePath = path.join(root, "lwe-process", "state.json");
const intakePath = path.join(root, "project-input", "website-intake.json");

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

const intake = readJson(intakePath, null);
const missing = intake
  ? requiredIntakeFields.filter(({ field }) => !isAnswered(getPathValue(intake, field)))
  : requiredIntakeFields;
const surpriseFields = intake
  ? requiredIntakeFields.filter(({ field }) => hasSurpriseAnswer(getPathValue(intake, field)))
  : [];

console.log("LWE APPROVE");
console.log("Gebruik dit commando alleen als de gebruiker expliciet akkoord heeft gegeven op het voorstel.");
console.log("Een AI-assistent mag dit commando niet namens de gebruiker uitvoeren.");
console.log("");

if (missing.length) {
  console.error("LWE APPROVE BLOCKED");
  console.error("De intake is nog niet compleet. Draai npm run lwe:next voor de eerstvolgende intakevraag.");
  for (const item of missing) console.error(`- ${item.field}`);
  process.exit(1);
}

const state = readJson(statePath, {});
const stateSignatureStatus = verifyStateSignature(state);

if (stateSignatureStatus.status === "invalid") {
  console.error("LWE APPROVE BLOCKED");
  console.error("lwe-process/state.json lijkt handmatig of buiten LWE-commando's aangepast.");
  console.error("Gebruik npm run lwe:reset om de processtatus veilig opnieuw te zetten.");
  process.exit(1);
}

const nextState = {
  ...state,
  phase: "build",
  projectType: getPathValue(intake, "project.type") || state.projectType || "unknown",
  languageMode: getPathValue(intake, "language.mode") || state.languageMode || "unknown",
  userApprovedBuild: true,
  websiteIntakeChecked: true,
  approvedAt: new Date().toISOString(),
};

fs.mkdirSync(path.dirname(statePath), { recursive: true });
fs.writeFileSync(statePath, `${JSON.stringify(withStateSignature(nextState, "lwe:approve"), null, 2)}\n`);

console.log("LWE APPROVE OK");
console.log("Phase is nu build.");
if (surpriseFields.length) {
  console.log(`Let op: gebruiker gaf vrije keuze voor: ${surpriseFields.map((item) => item.label).join(", ")}.`);
  console.log("De AI moet de gemaakte keuzes zichtbaar verwerken of bewust verklaren.");
}
console.log("npm run build en npm run lcb zijn nu toegestaan door de LWE guard.");
