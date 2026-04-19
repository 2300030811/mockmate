import { 
  extractAndMatchKeywords, 
  detectSections, 
  detectQuantifiedAchievements,
  SectionPresence,
  MetricDetectionResult
} from "@/utils/ats-keywords";
import { computeWeightedAtsScore, deriveAtsMatchRating, AtsScoreResult } from "@/types/ats-score";

const CORE_ATS_SECTIONS = ["summary", "experience", "education", "skills", "projects", "contact"];

import { clampScore } from "@/utils/math";

export interface AtsEngineResult {
  atsScore: number;
  formatScore: number;
  contentScore: number;
  keywordScore: number;
  matchRating: 'High' | 'Medium' | 'Low';
  presentKeywords: string[];
  missingKeywords: string[];
  sections: SectionPresence;
  metrics: MetricDetectionResult;
}

/**
 * Unified ATS Scoring Engine.
 * Calculates deterministic scores based on keywords, metrics, and sections.
 */
export function computeAtsEngineScores(params: {
  resumeText: string;
  jobDescription?: string;
  jobRole?: string;
}): AtsEngineResult {
  const hasJD = !!params.jobDescription && params.jobDescription.trim().length > 20;
  
  // Effective JD: use provided JD, or role-based proxy if missing
  const effectiveJD = hasJD 
    ? params.jobDescription! 
    : params.jobRole 
      ? `Looking for a ${params.jobRole}. Skills: ${params.jobRole} development systems engineering professional experience.`
      : null;

  // 1. Keyword analysis
  const kwResult = effectiveJD 
    ? extractAndMatchKeywords(params.resumeText, effectiveJD) 
    : null;
  
  const sections = kwResult ? kwResult.sections : detectSections(params.resumeText);
  const metrics = kwResult ? kwResult.metrics : detectQuantifiedAchievements(params.resumeText);

  const SECTION_WEIGHTS: Record<string, number> = {
    contact: 1.5,
    experience: 2.0,
    skills: 1.5,
    education: 1.0,
    summary: 0.75,
    projects: 0.75,
  };

  const totalWeight = Object.values(SECTION_WEIGHTS).reduce((a, b) => a + b, 0);
  const earnedWeight = CORE_ATS_SECTIONS.reduce((sum, s) => {
    return sum + (sections.present.includes(s) ? (SECTION_WEIGHTS[s] ?? 1) : 0);
  }, 0);

  const formatScore = clampScore((earnedWeight / totalWeight) * 100);

  // 3. Content Score (Metric density)
  // Weighted for high reward on quantified impact signals.
  const contentScore = clampScore(metrics.metricSignals * 22);

  // 4. Keyword Score (JD match or role-based estimate)
  const keywordScore = hasJD
    ? clampScore(kwResult?.matchPercent ?? 0)
    : Math.min(70, clampScore(formatScore * 0.4 + contentScore * 0.6));

  // 5. Final Weighted Score
  const atsScore = computeWeightedAtsScore({
    formatScore,
    contentScore,
    keywordScore,
  });

  return {
    atsScore,
    formatScore,
    contentScore,
    keywordScore,
    matchRating: deriveAtsMatchRating(atsScore),
    presentKeywords: kwResult?.matched || [],
    missingKeywords: kwResult?.missing || [],
    sections,
    metrics,
  };
}
