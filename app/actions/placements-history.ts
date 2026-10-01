"use server";

import { createClient } from "@/utils/supabase/server";
import { placementRepository } from "@/lib/db/placement-repository";
import { logger } from "@/lib/logger";
import {
  PlacementHistoryRecord,
  PlacementHistoryFilter,
  PlacementHistorySummary,
} from "@/types/placements";

/**
 * Server action: Fetches historical placement records (2016-2026 reference data).
 * Supports department filtering, academic year filtering, company name search,
 * and data quality status filtering.
 */
export async function getPlacementHistoryAction(
  filters?: PlacementHistoryFilter
): Promise<{
  success: boolean;
  data?: PlacementHistoryRecord[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const records = await placementRepository.getPlacementHistory(
      supabase,
      filters
    );
    return { success: true, data: records };
  } catch (error) {
    logger.error("Failed to fetch placement history", { error, filters });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch historical placement records.",
    };
  }
}

/**
 * Server action: Fetches historical placement records for a specific company.
 * Used by company detail modals and company profiles to display historical track record.
 */
export async function getCompanyPlacementHistoryAction(
  companyId?: string,
  companyName?: string
): Promise<{
  success: boolean;
  data?: PlacementHistoryRecord[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const records = await placementRepository.getCompanyPlacementHistory(
      supabase,
      companyId,
      companyName
    );
    return { success: true, data: records };
  } catch (error) {
    logger.error("Failed to fetch company placement history", {
      error,
      companyId,
      companyName,
    });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch company history.",
    };
  }
}

/**
 * Server action: Fetches dataset summary metadata (counts by department, academic years, unique companies, issues).
 */
export async function getPlacementHistorySummaryAction(): Promise<{
  success: boolean;
  data?: PlacementHistorySummary;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const summary = await placementRepository.getPlacementHistorySummary(
      supabase
    );
    return { success: true, data: summary };
  } catch (error) {
    logger.error("Failed to fetch placement history summary", { error });
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch placement history summary.",
    };
  }
}
