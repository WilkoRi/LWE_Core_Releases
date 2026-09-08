#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { withStateSignature } = require("./lwe-rules");

const root = process.cwd();
const statePath = path.join(root, "lwe-process", "state.json");
const targetArg = process.argv.find((arg) => arg.startsWith("--to="));
const targetPhase = targetArg ? targetArg.split("=")[1] : "intake";
const allowedTargets = new Set(["intake", "proposal"]);

if (!allowedTargets.has(targetPhase)) {
  console.error("LWE RESET BLOCKED");
  console.error("Gebruik --to=intake of --to=proposal.");
  process.exit(1);
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

const state = readJson(statePath, {});
const nextState = {
  ...state,
  phase: targetPhase,
  userApprovedBuild: false,
  websiteIntakeChecked: targetPhase !== "intake" ? state.websiteIntakeChecked === true : false,
  resetAt: new Date().toISOString(),
  resetReason: targetPhase === "intake"
    ? "Gebruiker wil intake of scope opnieuw bekijken."
    : "Gebruiker wil akkoord intrekken en terug naar voorstel.",
};

delete nextState.approvedAt;

fs.mkdirSync(path.dirname(statePath), { recursive: true });
fs.writeFileSync(statePath, `${JSON.stringify(withStateSignature(nextState, targetPhase === "intake" ? "lwe:reset" : "lwe:unapprove"), null, 2)}\n`);

console.log("LWE RESET OK");
console.log(`Phase is nu ${targetPhase}.`);
console.log("userApprovedBuild is nu false.");
console.log("Draai npm run lwe:next voor de volgende processtap.");
