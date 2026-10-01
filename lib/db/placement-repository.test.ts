import { describe, expect, it, vi } from "vitest";
import { placementRepository, getTodayISTDate, getISTDayRange, getISTUpcomingRange } from "./placement-repository";

describe("placementRepository Unit Tests", () => {
  describe("IST Timezone and Range Utilities", () => {
    it("returns correct IST date string", () => {
      const fixedDate = new Date("2026-09-17T06:00:00.000Z");
      expect(getTodayISTDate(fixedDate)).toBe("2026-09-17");
    });

    it("generates exact start and end ISO timestamps for an IST calendar day", () => {
      const { startIso, endIso } = getISTDayRange("2026-09-17");
      // 00:00:00 IST = 18:30:00 UTC previous day
      expect(startIso).toBe("2026-09-16T18:30:00.000Z");
      // 23:59:59.999 IST = 18:29:59.999 UTC same day
      expect(endIso).toBe("2026-09-17T18:29:59.999Z");
    });

    it("generates upcoming range for 30 days starting after target date", () => {
      const { startIso, endIso } = getISTUpcomingRange("2026-09-17", 30);
      expect(startIso).toBe("2026-09-17T18:29:59.999Z");
      // 2026-09-17 + 30 days = 2026-10-17 23:59:59.999 IST
      expect(endIso).toContain("2026-10-17");
    });
  });

  describe("Query Construction", () => {
    it("getTodayEvents constructs query with IST gte/lte bounds and joins", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [{ id: "evt-1" }], error: null });
      const mockLte = vi.fn().mockReturnValue({ order: mockOrder });
      const mockGte = vi.fn().mockReturnValue({ lte: mockLte });
      const mockSelect = vi.fn().mockReturnValue({ gte: mockGte });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getTodayEvents(mockDb, "2026-09-17");
      expect(mockDb.from).toHaveBeenCalledWith("placement_events");
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("placement_drives!inner"));
      expect(mockGte).toHaveBeenCalledWith("start_time", "2026-09-16T18:30:00.000Z");
      expect(mockLte).toHaveBeenCalledWith("start_time", "2026-09-17T18:29:59.999Z");
      expect(mockOrder).toHaveBeenCalledWith("start_time", { ascending: true });
      expect(res).toEqual([{ id: "evt-1" }]);
    });

    it("getUpcomingEvents constructs query with gt start and lte future bound", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [{ id: "evt-2" }], error: null });
      const mockLte = vi.fn().mockReturnValue({ order: mockOrder });
      const mockGt = vi.fn().mockReturnValue({ lte: mockLte });
      const mockSelect = vi.fn().mockReturnValue({ gt: mockGt });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getUpcomingEvents(mockDb, "2026-09-17", 14);
      expect(mockDb.from).toHaveBeenCalledWith("placement_events");
      expect(mockGt).toHaveBeenCalledWith("start_time", "2026-09-17T18:29:59.999Z");
      expect(res).toEqual([{ id: "evt-2" }]);
    });

    it("getUpcomingDeadlines filters exclusively by REGISTRATION_DEADLINE", async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [{ id: "dl-1" }], error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockGte = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq = vi.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getUpcomingDeadlines(mockDb, "2026-09-17T06:00:00Z");
      expect(mockDb.from).toHaveBeenCalledWith("placement_events");
      expect(mockEq).toHaveBeenCalledWith("event_type", "REGISTRATION_DEADLINE");
      expect(mockGte).toHaveBeenCalledWith("start_time", "2026-09-17T06:00:00Z");
      expect(res).toEqual([{ id: "dl-1" }]);
    });

    it("getDrives applies filters and pagination range", async () => {
      const mockRange = vi.fn().mockResolvedValue({ data: [{ id: "drive-1" }], error: null });
      const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getDrives(mockDb, { limit: 10, offset: 20 });
      expect(mockDb.from).toHaveBeenCalledWith("placement_drives");
      expect(mockRange).toHaveBeenCalledWith(20, 29);
      expect(res).toEqual([{ id: "drive-1" }]);
    });

    it("getRecentAnnouncements queries the public view and omits raw_body", async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [{ id: "ann-1" }], error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getRecentAnnouncements(mockDb, 5);
      // Ensures public-safe view is queried
      expect(mockDb.from).toHaveBeenCalledWith("placement_announcements_public");
      // Ensures raw_body is NOT requested
      expect(mockSelect).not.toHaveBeenCalledWith(expect.stringContaining("raw_body"));
      expect(mockLimit).toHaveBeenCalledWith(5);
      expect(res).toEqual([{ id: "ann-1" }]);
    });

    it("getUserApplications enforces user_id filter", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [{ id: "app-1" }], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getUserApplications(mockDb, "user-123");
      expect(mockDb.from).toHaveBeenCalledWith("placement_applications");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(res).toEqual([{ id: "app-1" }]);
    });

    it("upsertCompany normalizes name and reuses existing ID", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: "company-existing" }, error: null });
      const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const id = await placementRepository.upsertCompany(mockDb, "HCL Tech Ltd.");
      expect(mockDb.from).toHaveBeenCalledWith("placement_companies");
      expect(mockEq).toHaveBeenCalledWith("normalized_name", "hcltechltd");
      expect(id).toBe("company-existing");
    });

    it("throws when Supabase returns an error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: new Error("DB Connection Lost") });
      const mockLte = vi.fn().mockReturnValue({ order: mockOrder });
      const mockGte = vi.fn().mockReturnValue({ lte: mockLte });
      const mockSelect = vi.fn().mockReturnValue({ gte: mockGte });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      await expect(placementRepository.getTodayEvents(mockDb)).rejects.toThrow("DB Connection Lost");
    });

    it("getPlacementHistory applies department, year, company, and quality filters", async () => {
      const mockRange = vi.fn().mockResolvedValue({ data: [{ id: "ece-2024-2025-001" }], error: null });
      const mockContains = vi.fn().mockReturnValue({ range: mockRange });
      const mockIlike = vi.fn().mockReturnValue({ contains: mockContains });
      const mockEqYear = vi.fn().mockReturnValue({ ilike: mockIlike });
      const mockEqDept = vi.fn().mockReturnValue({ eq: mockEqYear });
      const mockOrderComp = vi.fn().mockReturnValue({ eq: mockEqDept });
      const mockOrderYear = vi.fn().mockReturnValue({ order: mockOrderComp });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrderYear });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getPlacementHistory(mockDb, {
        department: "ECE",
        academicYear: "2024-2025",
        companyName: "Siemens",
        qualityStatus: "clean",
        limit: 10,
        offset: 0,
      });

      expect(mockDb.from).toHaveBeenCalledWith("placement_history");
      expect(mockEqDept).toHaveBeenCalledWith("department", "ECE");
      expect(mockEqYear).toHaveBeenCalledWith("academic_year", "2024-2025");
      expect(mockIlike).toHaveBeenCalledWith("company_name", "%Siemens%");
      expect(mockContains).toHaveBeenCalledWith("data_quality_status", ["clean"]);
      expect(mockRange).toHaveBeenCalledWith(0, 9);
      expect(res).toEqual([{ id: "ece-2024-2025-001" }]);
    });

    it("getCompanyPlacementHistory queries by companyId or companyName", async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: [{ id: "ece-1", company_name: "Google" }], error: null });
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getCompanyPlacementHistory(mockDb, "google-uuid");
      expect(mockDb.from).toHaveBeenCalledWith("placement_history");
      expect(mockEq).toHaveBeenCalledWith("company_id", "google-uuid");
      expect(res).toEqual([{ id: "ece-1", company_name: "Google" }]);
    });

    it("getCompanyPlacementHistory uses or filter when both companyId and companyName provided", async () => {
      const mockOr = vi.fn().mockResolvedValue({ data: [{ id: "ece-2", company_name: "TCS-Digital" }], error: null });
      const mockOrder = vi.fn().mockReturnValue({ or: mockOr });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockDb = {
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as any;

      const res = await placementRepository.getCompanyPlacementHistory(mockDb, "tcs-uuid", "TCS");
      expect(mockDb.from).toHaveBeenCalledWith("placement_history");
      expect(mockOr).toHaveBeenCalledWith("company_id.eq.tcs-uuid,company_name.ilike.%TCS%");
      expect(res).toEqual([{ id: "ece-2", company_name: "TCS-Digital" }]);
    });
  });
});
