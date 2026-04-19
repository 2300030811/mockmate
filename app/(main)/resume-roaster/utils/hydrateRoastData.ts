import { deriveAtsMatchRating } from "@/types/ats-score";
import { RoastData, roastDataSchema } from "../types";

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function hydrateRoastData(serialized: string | null): RoastData | null {
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized);
    const validated = roastDataSchema.safeParse(parsed);
    if (!validated.success) return null;

    const baseData = validated.data;
    const atsScore = clampScore(baseData.atsAnalysis.atsScore);

    return {
      ...baseData,
      atsAnalysis: {
        ...baseData.atsAnalysis,
        atsScore,
        matchRating: deriveAtsMatchRating(atsScore),
        jobDescriptionProvided: Boolean(baseData.atsAnalysis.jobDescriptionProvided),
      },
    };
  } catch {
    return null;
  }
}
