const ROLE_ALIAS_MAP: Record<string, string> = {
  sde: "software engineer",
  "sde 1": "software engineer",
  "sde 2": "software engineer",
  "sde i": "software engineer",
  "sde ii": "software engineer",
  swe: "software engineer",
  "fullstack developer": "full stack developer",
  "full stack engineer": "full stack developer",
  "frontend engineer": "frontend developer",
  "front end engineer": "frontend developer",
  "front end developer": "frontend developer",
  "backend engineer": "backend developer",
  "back end engineer": "backend developer",
  "back end developer": "backend developer",
  "ml engineer": "machine learning engineer",
  "gen ai engineer": "generative ai engineer",
  "genai engineer": "generative ai engineer",
  sre: "site reliability engineer",
};

const SENIORITY_TOKENS = new Set([
  "senior",
  "sr",
  "junior",
  "jr",
  "lead",
  "principal",
  "staff",
  "associate",
  "intern",
  "trainee",
]);

function normalizeSeparators(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/\bnode\.?\s*js\b/g, "node js")
    .replace(/\.net\b/g, "dotnet")
    .replace(/\bgen\s*ai\b/g, "generative ai")
    .replace(/[|/()]+/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpacing(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeRoleTitleForMatching(value: string): string {
  if (!value) return "";
  return normalizeSpacing(normalizeSeparators(value));
}

export function stripRoleSeniority(normalizedTitle: string): string {
  if (!normalizedTitle) return "";

  const words = normalizedTitle
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);

  const stripped = words.filter((word, idx) => {
    if (!SENIORITY_TOKENS.has(word)) return true;
    return idx > 0 && words.length <= 2;
  });

  return normalizeSpacing(stripped.join(" "));
}

function swapRoleKeyword(normalizedTitle: string): string[] {
  const variants: string[] = [];
  if (normalizedTitle.includes("engineer")) {
    variants.push(normalizeSpacing(normalizedTitle.replace(/\bengineer\b/g, "developer")));
  }
  if (normalizedTitle.includes("developer")) {
    variants.push(normalizeSpacing(normalizedTitle.replace(/\bdeveloper\b/g, "engineer")));
  }
  return variants;
}

export function resolveRoleAlias(normalizedTitle: string): string | null {
  const directAlias = ROLE_ALIAS_MAP[normalizedTitle];
  if (directAlias) {
    return normalizeRoleTitleForMatching(directAlias);
  }
  return null;
}

export function buildRoleMatchCandidates(inputRole: string): string[] {
  const normalized = normalizeRoleTitleForMatching(inputRole);
  if (!normalized) return [];

  const candidates = new Set<string>([normalized]);

  const alias = resolveRoleAlias(normalized);
  if (alias) candidates.add(alias);

  const stripped = stripRoleSeniority(normalized);
  if (stripped && stripped !== normalized) {
    candidates.add(stripped);
    const strippedAlias = resolveRoleAlias(stripped);
    if (strippedAlias) candidates.add(strippedAlias);
  }

  for (const candidate of Array.from(candidates)) {
    for (const variant of swapRoleKeyword(candidate)) {
      if (variant) candidates.add(variant);
    }
  }

  return Array.from(candidates).filter(Boolean);
}
