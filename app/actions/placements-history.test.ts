import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getPlacementHistoryAction,
  getCompanyPlacementHistoryAction,
  getPlacementHistorySummaryAction,
} from "./placements-history";
import { placementRepository } from "@/lib/db/placement-repository";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn().mockReturnValue({}),
}));

vi.mock("@/lib/db/placement-repository", () => ({
  placementRepository: {
    getPlacementHistory: vi.fn(),
    getCompanyPlacementHistory: vi.fn(),
    getPlacementHistorySummary: vi.fn(),
  },
}));

describe("app/actions/placements-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlacementHistoryAction", () => {
    it("returns data on success", async () => {
      const mockRecords = [{ id: "ece-1", company_name: "Siemens" }];
      vi.mocked(placementRepository.getPlacementHistory).mockResolvedValueOnce(
        mockRecords as any
      );

      const res = await getPlacementHistoryAction({ department: "ECE" });
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockRecords);
    });

    it("handles errors gracefully", async () => {
      vi.mocked(placementRepository.getPlacementHistory).mockRejectedValueOnce(
        new Error("Database offline")
      );

      const res = await getPlacementHistoryAction();
      expect(res.success).toBe(false);
      expect(res.error).toBe("Database offline");
    });
  });

  describe("getCompanyPlacementHistoryAction", () => {
    it("returns company historical records", async () => {
      const mockRecords = [{ id: "ece-2", company_name: "Google" }];
      vi.mocked(
        placementRepository.getCompanyPlacementHistory
      ).mockResolvedValueOnce(mockRecords as any);

      const res = await getCompanyPlacementHistoryAction("comp-1", "Google");
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockRecords);
    });
  });

  describe("getPlacementHistorySummaryAction", () => {
    it("returns summary metrics", async () => {
      const mockSummary = {
        totalRecords: 1106,
        recordsByDepartment: { ECE: 446, CSE: 660 },
        academicYears: ["2026-2027", "2025-2026"],
        totalUniqueCompanies: 400,
        qualityIssuesCount: 71,
      };
      vi.mocked(
        placementRepository.getPlacementHistorySummary
      ).mockResolvedValueOnce(mockSummary as any);

      const res = await getPlacementHistorySummaryAction();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(mockSummary);
    });
  });
});
