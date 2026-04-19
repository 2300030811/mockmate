import type { SkillGap } from "@/types/career";

export type CareerOpsRoleArchetype =
  | "fullstack"
  | "backend"
  | "frontend"
  | "data_ml"
  | "devops"
  | "mobile"
  | "security"
  | "qa"
  | "product"
  | "platform"
  | "unknown";

export type CareerOpsPrimaryBlocker =
  | "stack-mismatch"
  | "seniority-mismatch"
  | "domain-mismatch"
  | "delivery-gap"
  | "unknown";

export const CAREER_OPS_ROLE_ARCHETYPES: CareerOpsRoleArchetype[] = [
  "fullstack",
  "backend",
  "frontend",
  "data_ml",
  "devops",
  "mobile",
  "security",
  "qa",
  "product",
  "platform",
  "unknown",
];

export const CAREER_OPS_PRIMARY_BLOCKERS: CareerOpsPrimaryBlocker[] = [
  "stack-mismatch",
  "seniority-mismatch",
  "domain-mismatch",
  "delivery-gap",
  "unknown",
];

const ROLE_ARCHETYPE_SET = new Set<string>(CAREER_OPS_ROLE_ARCHETYPES);
const PRIMARY_BLOCKER_SET = new Set<string>(CAREER_OPS_PRIMARY_BLOCKERS);

const ROLE_ARCHETYPE_PATTERNS: Array<{ archetype: CareerOpsRoleArchetype; pattern: RegExp }> = [
  { archetype: "fullstack", pattern: /full\s*stack|fullstack/i },
  { archetype: "backend", pattern: /back\s*end|backend|api engineer|server[- ]side/i },
  { archetype: "frontend", pattern: /front\s*end|frontend|ui engineer|web engineer/i },
  { archetype: "data_ml", pattern: /data|ml|machine learning|ai engineer|analytics|scientist/i },
  { archetype: "devops", pattern: /devops|sre|site reliability|infra|infrastructure|cloud/i },
  { archetype: "mobile", pattern: /mobile|android|ios|react native|flutter/i },
  { archetype: "security", pattern: /security|application security|appsec|cyber/i },
  { archetype: "qa", pattern: /qa|quality|test engineer|sdet|automation/i },
  { archetype: "product", pattern: /product manager|product owner|pm\b/i },
  { archetype: "platform", pattern: /platform engineer|developer platform|internal tools/i },
];

function compactText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeTag(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function inferRoleArchetype(jobRole: string | null | undefined): CareerOpsRoleArchetype {
  const normalizedRole = compactText(jobRole).toLowerCase();
  if (!normalizedRole) return "unknown";

  for (const entry of ROLE_ARCHETYPE_PATTERNS) {
    if (entry.pattern.test(normalizedRole)) {
      return entry.archetype;
    }
  }

  return "unknown";
}

function hasAnyLevelHint(value: string, hints: string[]): boolean {
  return hints.some((hint) => value.includes(hint));
}

export function inferPrimaryBlocker(params: {
  missingSkills?: SkillGap[] | null;
  targetLevel?: string | null;
}): CareerOpsPrimaryBlocker {
  const skills = params.missingSkills ?? [];
  const highPriority = skills.filter((skill) => skill.importance === "high");

  const technicalHigh = highPriority.filter((skill) => skill.category === "technical").length;
  const domainHigh = highPriority.filter((skill) => skill.category === "domain").length;
  const softHigh = highPriority.filter((skill) => skill.category === "soft").length;

  const levelValue = compactText(params.targetLevel).toLowerCase();
  const seniorHint = hasAnyLevelHint(levelValue, ["senior", "lead", "staff", "principal", "manager"]);

  if (technicalHigh >= 2) return "stack-mismatch";
  if (seniorHint && highPriority.length >= 2) return "seniority-mismatch";
  if (domainHigh >= 1) return "domain-mismatch";
  if (softHigh >= 1) return "delivery-gap";

  return "unknown";
}

export function extractBlockerTags(missingSkills?: SkillGap[] | null): string[] {
  const skills = missingSkills ?? [];
  const tags = new Set<string>();

  for (const skill of skills) {
    if (skill.importance === "low") continue;
    const normalized = normalizeTag(skill.skill);
    if (!normalized) continue;
    tags.add(normalized);
    if (tags.size >= 8) break;
  }

  return Array.from(tags);
}

export function normalizeRoleArchetype(
  value: string | null | undefined,
  fallback: CareerOpsRoleArchetype = "unknown"
): CareerOpsRoleArchetype {
  const normalized = compactText(value).toLowerCase();
  if (!normalized) return fallback;
  if (ROLE_ARCHETYPE_SET.has(normalized)) return normalized as CareerOpsRoleArchetype;
  return fallback;
}

export function normalizePrimaryBlocker(
  value: string | null | undefined,
  fallback: CareerOpsPrimaryBlocker = "unknown"
): CareerOpsPrimaryBlocker {
  const normalized = compactText(value).toLowerCase();
  if (!normalized) return fallback;
  if (PRIMARY_BLOCKER_SET.has(normalized)) return normalized as CareerOpsPrimaryBlocker;
  return fallback;
}