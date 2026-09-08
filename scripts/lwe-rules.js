const crypto = require("node:crypto");

const intakeGroups = [
  "Basis",
  "Doelgroep en taal",
  "Stijl en content",
  "Functionaliteit en kanalen",
  "Organisatie en akkoord",
];

const requiredIntakeFields = [
  { field: "project.name", label: "projectnaam of werknaam", group: "Basis" },
  { field: "project.type", label: "type website", group: "Basis" },
  { field: "project.goal", label: "doel van de website", group: "Basis" },
  { field: "project.visitorAction", label: "wat een bezoeker uiteindelijk moet doen", group: "Basis" },
  { field: "audience.primary", label: "primaire doelgroep", group: "Doelgroep en taal" },
  { field: "language.mode", label: "single-language of multi-language", group: "Doelgroep en taal" },
  { field: "language.primary", label: "hoofdtaal", group: "Doelgroep en taal" },
  { field: "style.colorPreference", label: "kleurvoorkeur of 'ik weet het niet, verras me'", group: "Stijl en content" },
  { field: "style.visualDirection", label: "gewenste uitstraling of 'ik weet het niet, verras me'", group: "Stijl en content" },
  { field: "content.desiredPages", label: "gewenste pagina's of 'ik weet het niet, verras me'", group: "Stijl en content" },
  { field: "functionality.contactForm", label: "contactformulier: ja/nee/onbekend", group: "Functionaliteit en kanalen" },
  { field: "functionality.eventCalendar", label: "evenementenkalender nodig: ja/nee/onbekend", group: "Functionaliteit en kanalen" },
  { field: "functionality.hidePastEvents", label: "verlopen kalenderitems automatisch verbergen: ja/nee/onbekend", group: "Functionaliteit en kanalen" },
  { field: "functionality.multilingual", label: "meertaligheid: ja/nee/onbekend", group: "Functionaliteit en kanalen" },
  { field: "socialMedia.accountsStatus", label: "social media accounts: aanwezig/niet aanwezig/onbekend", group: "Functionaliteit en kanalen" },
  { field: "assets.logoStatus", label: "logo-status", group: "Functionaliteit en kanalen" },
  { field: "legalAndOrganization.privacyStatement", label: "privacyverklaring: aanwezig/nodig/niet nodig/onbekend", group: "Organisatie en akkoord" },
  { field: "legalAndOrganization.contentResponsibility", label: "wie verantwoordelijk is voor teksten/foto's", group: "Organisatie en akkoord" },
  { field: "aiFreedom.creativeFreedom", label: "hoeveel vrijheid de AI heeft", group: "Organisatie en akkoord" },
];

const unknownAnswers = new Set(["unknown", "onbekend", "todo", "tbd", "...", "-"]);
const surprisePattern = /\b(ik weet het niet,\s*)?verras me\b|\bsurprise me\b|\bkeuze aan (de )?ai\b/i;

function getPathValue(source, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) return value[key];
    return undefined;
  }, source);
}

function flattenStrings(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.flatMap(flattenStrings);
  if (typeof value === "object") return Object.values(value).flatMap(flattenStrings);
  return [String(value)];
}

function isSurpriseAnswer(value) {
  return typeof value === "string" && surprisePattern.test(value.trim());
}

function hasSurpriseAnswer(value) {
  return flattenStrings(value).some(isSurpriseAnswer);
}

function isAnswered(value) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.some(isAnswered);
  if (typeof value === "string") {
    const clean = value.trim().toLowerCase();
    if (!clean) return false;
    if (unknownAnswers.has(clean)) return false;
    return true;
  }
  if (typeof value === "object") return Object.values(value).some(isAnswered);
  return true;
}

function hasAffirmativeAnswer(value) {
  return flattenStrings(value).some((item) =>
    /^(ja|yes|akkoord|toegestaan|goedgekeurd|approved|allow|allowed)\b/i.test(item.trim())
  );
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function stateWithoutSignature(state) {
  const clone = JSON.parse(JSON.stringify(state || {}));
  if (clone._lwe) {
    delete clone._lwe.signature;
  }
  return clone;
}

function createStateSignature(state) {
  return crypto
    .createHash("sha256")
    .update(`lwe-state-v1:${stableStringify(stateWithoutSignature(state))}`)
    .digest("hex");
}

function withStateSignature(state, command) {
  const nextState = {
    ...state,
    _lwe: {
      ...(state && state._lwe ? state._lwe : {}),
      owner: "LWE process engine",
      machineOwned: true,
      updatedBy: command,
      updatedAt: new Date().toISOString(),
    },
  };

  nextState._lwe.signature = createStateSignature(nextState);
  return nextState;
}

function verifyStateSignature(state) {
  if (!state || typeof state !== "object") {
    return { status: "missing", message: "state ontbreekt" };
  }

  if (!state._lwe?.signature) {
    return { status: "missing", message: "state heeft nog geen LWE machine-owned signature" };
  }

  const expected = createStateSignature(state);
  if (state._lwe.signature !== expected) {
    return { status: "invalid", message: "state.json lijkt buiten LWE-commando's aangepast" };
  }

  return { status: "ok", message: "state.json is machine-owned en signature klopt" };
}

module.exports = {
  flattenStrings,
  getPathValue,
  hasAffirmativeAnswer,
  hasSurpriseAnswer,
  intakeGroups,
  isAnswered,
  requiredIntakeFields,
  verifyStateSignature,
  withStateSignature,
};
