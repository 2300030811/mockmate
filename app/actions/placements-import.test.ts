import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  analyzePlacementTextAction,
  confirmPlacementImportAction,
  submitNoticeForAdminReviewAction,
  getPlacementAdminStatusAction,
} from "./placements-import";

// Mock Supabase server client
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-session-123", email: "student@kluniversity.in" } },
        error: null,
      }),
    },
  }),
}));

// Mock Supabase admin client
vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

// Mock resolver
vi.mock("@/lib/services/placement-import-resolver", () => ({
  analyzeImportDraft: vi.fn(),
  confirmAndPersistImport: vi.fn(),
  computeContentHash: vi.fn().mockReturnValue("hash-abc"),
}));

// Mock Next.js cache revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  ADMIN_EMAIL: "2300030811cser@gmail.com",
  PLACEMENTS_NOTIFICATION_EMAIL: "2300030811@kluniversity.in",
}));

// Mock auth utils
vi.mock("@/lib/auth-utils", () => ({
  requireAdmin: vi.fn(),
}));

// Mock Resend as a constructable class
vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: vi.fn().mockResolvedValue({
          data: { id: "resend-msg-123" },
          error: null,
        }),
      };
    },
  };
});

// Mock env
vi.mock("@/lib/env", () => ({
  env: {
    RESEND_API_KEY: "re_mock_key",
  },
}));

import {
  analyzeImportDraft,
  confirmAndPersistImport,
} from "@/lib/services/placement-import-resolver";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";

describe("Placements Import Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlacementAdminStatusAction", () => {
    it("returns correct admin status, admin email, and notification inbox", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(true);
      const res = await getPlacementAdminStatusAction();
      expect(res.isAdmin).toBe(true);
      expect(res.adminEmail).toBe("2300030811cser@gmail.com");
      expect(res.notificationEmail).toBe("2300030811@kluniversity.in");
    });
  });

  describe("analyzePlacementTextAction", () => {
    it("rejects inputs shorter than 10 characters", async () => {
      const res = await analyzePlacementTextAction("too short");
      expect(res.success).toBe(false);
      expect(res.error).toContain("minimum 10 characters");
      expect(analyzeImportDraft).not.toHaveBeenCalled();
    });

    it("rejects inputs exceeding 30,000 characters", async () => {
      const giantText = "a".repeat(30005);
      const res = await analyzePlacementTextAction(giantText);
      expect(res.success).toBe(false);
      expect(res.error).toContain("30,000 character limit");
      expect(analyzeImportDraft).not.toHaveBeenCalled();
    });

    it("successfully delegates to analyzeImportDraft using session user ID", async () => {
      vi.mocked(analyzeImportDraft).mockResolvedValue({
        submissionId: "sub-123",
        items: [],
        extractedTableCount: 1,
        extractedProseCount: 0,
      });

      const validNotice = "| Company | Role |\n|---|---|\n| Google | Intern |";
      const res = await analyzePlacementTextAction(validNotice);

      expect(res.success).toBe(true);
      expect(res.draft?.submissionId).toBe("sub-123");
      expect(analyzeImportDraft).toHaveBeenCalledWith(
        expect.any(Object),
        "user-session-123",
        validNotice
      );
    });
  });

  describe("submitNoticeForAdminReviewAction", () => {
    it("dispatches notice via Resend to 2300030811@kluniversity.in", async () => {
      const notice = "Amazon WOW Assessment scheduled on 30 Sep 2026 for CSE/ECE.";
      const res = await submitNoticeForAdminReviewAction(notice, "Amazon: SDE Intern");

      expect(res.success).toBe(true);
      expect(res.emailDispatched).toBe(true);
      expect(res.mailtoUrl).toContain("2300030811@kluniversity.in");
      expect(res.message).toContain("Only authorized administrators have direct permission");
    });
  });

  describe("confirmPlacementImportAction", () => {
    it("blocks non-admin users from directly publishing drives", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(false);

      const res = await confirmPlacementImportAction("sub-123", [
        {
          tempId: "t1",
          noticeType: "NEW_DRIVE",
          companyName: "Google",
          roleTitle: "Intern",
          packageText: "1.14 Lakh/mo",
          minLpa: null,
          maxLpa: null,
          eligibleBranches: ["CSE"],
          minCgpa: 7.0,
          deadlineIso: "2026-09-24",
          eventDateIso: null,
          eventLocation: null,
          registrationUrl: null,
        },
      ]);

      expect(res.success).toBe(false);
      expect(res.error).toContain("Only authorized administrators have direct permission");
      expect(confirmAndPersistImport).not.toHaveBeenCalled();
    });

    it("rejects empty confirmed items for admins", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(true);
      const res = await confirmPlacementImportAction("sub-123", []);
      expect(res.success).toBe(false);
      expect(res.error).toContain("no items selected");
    });

    it("sanitizes javascript: links and confirms import when caller is admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(true);
      vi.mocked(confirmAndPersistImport).mockResolvedValue({
        success: true,
        submissionId: "sub-123",
        createdDrivesCount: 1,
        updatedDrivesCount: 0,
        createdEventsCount: 1,
        publishedAnnouncementsCount: 0,
        warnings: [],
      });

      const res = await confirmPlacementImportAction("sub-123", [
        {
          tempId: "t1",
          noticeType: "NEW_DRIVE",
          companyName: "Google",
          roleTitle: "Intern",
          packageText: "1.14 Lakh/mo",
          minLpa: null,
          maxLpa: null,
          eligibleBranches: ["CSE"],
          minCgpa: 7.0,
          deadlineIso: "2026-09-24",
          eventDateIso: null,
          eventLocation: null,
          registrationUrl: "javascript:alert(1)", // Malicious URL to sanitize
        },
      ]);

      expect(res.success).toBe(true);
      expect(res.summary?.createdDrivesCount).toBe(1);
      expect(confirmAndPersistImport).toHaveBeenCalledWith(
        expect.any(Object),
        "user-session-123",
        "sub-123",
        expect.arrayContaining([
          expect.objectContaining({
            companyName: "Google",
            registrationUrl: null, // Sanitized to null!
          }),
        ])
      );
      expect(revalidatePath).toHaveBeenCalledWith("/placements");
    });
  });
});
