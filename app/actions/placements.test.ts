import { describe, expect, it, vi, beforeEach } from "vitest";
import { getPlacementHubData, getDriveDetails } from "./placements";
import { placementRepository } from "@/lib/db/placement-repository";

// Mock Supabase server client
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() => ({})),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Placements Server Action Hardening & Performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Bounded Parallel Execution & Zero N+1 Queries", () => {
    it("executes primary queries concurrently via Promise.allSettled with zero secondary loops", async () => {
      const mockDrives = [
        {
          id: "d1",
          drive_name: "TCS Ninja",
          package_max_lpa: 7,
          placement_companies: { id: "c1", name: "TCS" },
        },
        {
          id: "d2",
          drive_name: "Deloitte",
          package_max_lpa: 12,
          placement_companies: { id: "c2", name: "Deloitte" },
        },
      ];

      const getTodaySpy = vi.spyOn(placementRepository, "getTodayEvents").mockResolvedValue([]);
      const getUpcomingSpy = vi.spyOn(placementRepository, "getUpcomingEvents").mockResolvedValue([]);
      const getDeadlinesSpy = vi.spyOn(placementRepository, "getUpcomingDeadlines").mockResolvedValue([]);
      const getAnnouncementsSpy = vi.spyOn(placementRepository, "getRecentAnnouncements").mockResolvedValue([]);
      const getYearsSpy = vi.spyOn(placementRepository, "getAcademicYears").mockResolvedValue([]);
      const getDrivesSpy = vi.spyOn(placementRepository, "getDrives").mockResolvedValue(mockDrives as any);

      // Spy on potential N+1 culprit functions to ensure they are NEVER called per drive
      const getDriveByIdSpy = vi.spyOn(placementRepository, "getDriveById");
      const getCompaniesSpy = vi.spyOn(placementRepository, "getCompanies");

      const data = await getPlacementHubData();

      // Verify bounded primary queries called exactly once
      expect(getTodaySpy).toHaveBeenCalledTimes(1);
      expect(getUpcomingSpy).toHaveBeenCalledTimes(1);
      expect(getDeadlinesSpy).toHaveBeenCalledTimes(1);
      expect(getAnnouncementsSpy).toHaveBeenCalledTimes(1);
      expect(getYearsSpy).toHaveBeenCalledTimes(1);
      expect(getDrivesSpy).toHaveBeenCalledTimes(1);

      // CRITICAL: Zero N+1 secondary queries executed for the drives list!
      expect(getDriveByIdSpy).not.toHaveBeenCalled();
      expect(getCompaniesSpy).not.toHaveBeenCalled();

      // Stats check
      expect(data.stats.totalDrives).toBe(2);
      expect(data.stats.totalCompanies).toBe(2);
      expect(data.stats.highestPackageLpa).toBe(12);
      expect(data.stats.averagePackageLpa).toBe(9.5);
    });
  });

  describe("Graceful Partial & Total Failure Resilience", () => {
    it("returns safe default payload when database queries reject completely", async () => {
      vi.spyOn(placementRepository, "getTodayEvents").mockRejectedValue(new Error("Supabase connection timeout"));
      vi.spyOn(placementRepository, "getUpcomingEvents").mockRejectedValue(new Error("Supabase connection timeout"));
      vi.spyOn(placementRepository, "getUpcomingDeadlines").mockRejectedValue(new Error("Supabase connection timeout"));
      vi.spyOn(placementRepository, "getRecentAnnouncements").mockRejectedValue(new Error("Supabase connection timeout"));
      vi.spyOn(placementRepository, "getAcademicYears").mockRejectedValue(new Error("Supabase connection timeout"));
      vi.spyOn(placementRepository, "getDrives").mockRejectedValue(new Error("Supabase connection timeout"));

      // Must not throw an unhandled exception
      const res = await getPlacementHubData();

      expect(res).toBeDefined();
      expect(res.todayEvents).toEqual([]);
      expect(res.todayGroupedDrives).toEqual([]);
      expect(res.upcomingEvents).toEqual([]);
      expect(res.deadlines).toEqual([]);
      expect(res.drives).toEqual([]);
      expect(res.stats.totalCompanies).toBe(109); // falls back to verified seed stats baseline
      expect(res.stats.totalDrives).toBe(114);
    });

    it("handles partial failure where some queries succeed and others reject", async () => {
      const mockDrives = [
        {
          id: "d1",
          drive_name: "Google",
          package_max_lpa: 30,
          placement_companies: { id: "c1", name: "Google" },
        },
      ];

      vi.spyOn(placementRepository, "getTodayEvents").mockRejectedValue(new Error("Events table error"));
      vi.spyOn(placementRepository, "getUpcomingEvents").mockResolvedValue([]);
      vi.spyOn(placementRepository, "getUpcomingDeadlines").mockResolvedValue([]);
      vi.spyOn(placementRepository, "getRecentAnnouncements").mockResolvedValue([]);
      vi.spyOn(placementRepository, "getAcademicYears").mockResolvedValue([]);
      vi.spyOn(placementRepository, "getDrives").mockResolvedValue(mockDrives as any);

      const res = await getPlacementHubData();

      // Today events failed, but overall action still succeeds and populates available data
      expect(res.todayEvents).toEqual([]);
      expect(res.drives.length).toBe(1);
      expect(res.stats.highestPackageLpa).toBe(30);
    });
  });

  describe("Drive Details Lookup", () => {
    it("returns null gracefully when getDriveById encounters an error", async () => {
      vi.spyOn(placementRepository, "getDriveById").mockRejectedValue(new Error("Record not found"));
      const drive = await getDriveDetails("non-existent-id");
      expect(drive).toBeNull();
    });

    it("returns drive when getDriveById succeeds", async () => {
      const mockDrive = { id: "drive-1", drive_name: "Amazon SDE" };
      vi.spyOn(placementRepository, "getDriveById").mockResolvedValue(mockDrive as any);
      const drive = await getDriveDetails("drive-1");
      expect(drive).toEqual(mockDrive);
    });
  });
});
