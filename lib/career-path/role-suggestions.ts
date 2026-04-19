import indiaSalaries from "@/data/salaries.india.json";
import {
  buildRoleMatchCandidates,
  normalizeRoleTitleForMatching,
} from "@/lib/career-path/role-normalization";

export interface RoleSuggestionOption {
  value: string;
  normalized: string;
}

const salaryRoles = Object.keys(indiaSalaries).map((role) => role.trim()).filter(Boolean);

const ROLE_SUGGESTIONS: RoleSuggestionOption[] = Array.from(new Set(salaryRoles))
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({
    value,
    normalized: normalizeRoleTitleForMatching(value),
  }));

function scoreSuggestion(option: RoleSuggestionOption, query: string, candidateSet: Set<string>): number {
  if (!query) return 1;

  if (candidateSet.has(option.normalized)) return 100;
  if (option.normalized === query) return 95;
  if (option.normalized.startsWith(query)) return 75;
  if (option.normalized.includes(query)) return 55;

  const queryWords = query.split(" ").filter((word) => word.length >= 2);
  if (queryWords.length === 0) return 0;

  let score = 0;
  for (const word of queryWords) {
    if (option.normalized.includes(` ${word} `) || option.normalized.startsWith(`${word} `) || option.normalized.endsWith(` ${word}`)) {
      score += 8;
      continue;
    }
    if (option.normalized.includes(word)) {
      score += 4;
    }
  }

  return score;
}

export function getRoleSuggestions(input: string, limit = 10): RoleSuggestionOption[] {
  const normalizedInput = normalizeRoleTitleForMatching(input);
  if (!normalizedInput) {
    return ROLE_SUGGESTIONS.slice(0, limit);
  }

  const candidateSet = new Set(buildRoleMatchCandidates(input));

  return ROLE_SUGGESTIONS
    .map((option) => ({
      option,
      score: scoreSuggestion(option, normalizedInput, candidateSet),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.option.value.localeCompare(b.option.value);
    })
    .slice(0, limit)
    .map((entry) => entry.option);
}

export function getAllRoleSuggestions(): RoleSuggestionOption[] {
  return ROLE_SUGGESTIONS;
}
