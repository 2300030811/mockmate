// Deterministic Scoring Gates ported from Job Radar (seniority.py & relevance.py)
// Prevents LLM hallucinations and saves tokens by enforcing title & domain bounds in code.

const SENIOR_TOKENS = [
  "senior",
  "sr\\.?",
  "staff",
  "principal",
  "lead",
  "leads",
  "head of",
  "director",
  "vp",
  "vice president",
  "chief",
  "architect",
  "manager",
  "distinguished",
  "fellow",
  "iii",
  "iv",
];

const JUNIOR_TOKENS = [
  "intern",
  "internship",
  "junior",
  "jr\\.?",
  "new ?grad",
  "graduate",
  "entry[- ]level",
  "associate",
  "apprentice",
  "trainee",
  "early career",
  "university",
  "campus",
  "fresher",
];

const SENIOR_RE = new RegExp(`\\b(?:${SENIOR_TOKENS.join("|")})\\b`, "i");
const JUNIOR_RE = new RegExp(`\\b(?:${JUNIOR_TOKENS.join("|")})\\b`, "i");
const EXECUTIVE_RE = /\b(director|vp|head of|chief)\b/i;

export const SENIORITY_SCORE_CAP = 30; // 3/10 normalized to 0-100 scale
export const RELEVANCE_SCORE_CAP = 30;
export const SKILLS_FLOOR = 60;
export const DOMAIN_FLOOR = 60;

/**
 * Determines if a role title implies high seniority.
 * A junior marker wins (e.g., "Senior Engineer Intern" is an internship),
 * unless overridden by executive markers (e.g., "Associate Director" is senior).
 */
export function isSeniorRole(title: string): boolean {
  const cleanTitle = (title || "").trim();
  if (!cleanTitle) return false;

  // Junior marker wins unless title has an executive word
  if (JUNIOR_RE.test(cleanTitle) && !EXECUTIVE_RE.test(cleanTitle)) {
    return false;
  }

  return SENIOR_RE.test(cleanTitle);
}

/**
 * Checks if the candidate is irrelevant across both technical skills and domain.
 * If both are below the 60% floor, the role is outside the candidate's field.
 */
export function isIrrelevantRole(skillsScore?: number | null, domainScore?: number | null): boolean {
  if (skillsScore == null || domainScore == null) {
    return false;
  }

  // If both are 0, it may be un-evaluated/missing data rather than explicitly bad fit.
  if (skillsScore === 0 && domainScore === 0) {
    return false;
  }

  return skillsScore < SKILLS_FLOOR && domainScore < DOMAIN_FLOOR;
}

export interface GateEvaluationResult {
  score: number;
  reason: string;
  isCapped: boolean;
  cappedBy: "seniority" | "relevance" | null;
}

/**
 * Applies deterministic seniority and relevance gates to an incoming match score.
 * ponytail: fast regex & integer floor checks prevent burning LLM tokens on impossible fits.
 */
export function applyScoringGates(
  rawScore: number,
  title: string,
  options?: {
    skillsScore?: number | null;
    domainScore?: number | null;
    existingReason?: string;
  }
): GateEvaluationResult {
  let score = Math.max(0, Math.min(100, Math.round(rawScore)));
  let reason = options?.existingReason?.trim() || "";
  let isCapped = false;
  let cappedBy: "seniority" | "relevance" | null = null;

  // 1. Seniority Gate
  if (score > SENIORITY_SCORE_CAP && isSeniorRole(title)) {
    score = SENIORITY_SCORE_CAP;
    isCapped = true;
    cappedBy = "seniority";
    const note = `capped at ${SENIORITY_SCORE_CAP}%: senior role title`;
    reason = reason ? `${reason}; ${note}` : note;
  }

  // 2. Relevance Gate
  if (
    score > RELEVANCE_SCORE_CAP &&
    isIrrelevantRole(options?.skillsScore, options?.domainScore)
  ) {
    score = RELEVANCE_SCORE_CAP;
    isCapped = true;
    cappedBy = "relevance";
    const note = `capped at ${RELEVANCE_SCORE_CAP}%: weak skills & domain fit`;
    reason = reason ? `${reason}; ${note}` : note;
  }

  return {
    score,
    reason,
    isCapped,
    cappedBy,
  };
}
