import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  syncPlacementEmailsDelta,
  isPlacementRelatedEmail,
  GraphDeltaResponse,
} from "./outlook-email-sync";
import * as clientModule from "./outlook-client";

describe("Outlook Email Delta Synchronization", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Keyword Relevance Heuristics", () => {
    it("identifies placement keywords in subjects or previews", () => {
      expect(isPlacementRelatedEmail("Infosys Campus Recruitment Drive")).toBe(true);
      expect(isPlacementRelatedEmail("Technical Interview Shortlist Round 1")).toBe(true);
      expect(isPlacementRelatedEmail("Registration Deadline - TCS Digital")).toBe(true);
      expect(isPlacementRelatedEmail("Library fine reminder", "Please pay books")).toBe(false);
      expect(isPlacementRelatedEmail("Hostel mess meeting", "Food committee")).toBe(false);
    });
  });

  describe("Delta Sync & Pagination", () => {
    it("pages through @odata.nextLink and captures final @odata.deltaLink", async () => {
      const page1: GraphDeltaResponse = {
        value: [
          {
            id: "msg-1",
            subject: "Deloitte Campus Recruitment",
            bodyPreview: "Deloitte is visiting campus for 2026 batch",
          },
        ],
        "@odata.nextLink": "https://graph.microsoft.com/v1.0/messages/delta?$skiptoken=page2",
      };

      const page2: GraphDeltaResponse = {
        value: [
          {
            id: "msg-2",
            subject: "Library circular", // non-placement
            bodyPreview: "Library closed tomorrow",
          },
          {
            id: "msg-3",
            subject: "Amazon AWS Hiring Assessment",
            bodyPreview: "Coding round scheduled for Saturday",
          },
        ],
        "@odata.deltaLink": "https://graph.microsoft.com/v1.0/messages/delta?$deltatoken=final-token",
      };

      const callSpy = vi
        .spyOn(clientModule, "callGraphApi")
        .mockImplementation(async (url) => {
          if (url.includes("page2")) return page2;
          return page1;
        });

      const result = await syncPlacementEmailsDelta({
        mailboxId: "placement@klu.ac.in",
        folderId: "Inbox",
      });

      expect(callSpy).toHaveBeenCalledTimes(2);
      expect(result.newOrUpdatedMessages.length).toBe(2);
      expect(result.newOrUpdatedMessages[0].id).toBe("msg-1");
      expect(result.newOrUpdatedMessages[1].id).toBe("msg-3");
      expect(result.newDeltaLink).toBe(
        "https://graph.microsoft.com/v1.0/messages/delta?$deltatoken=final-token"
      );
      expect(result.resyncRequired).toBe(false);
    });

    it("captures @removed messages without crashing and separates them", async () => {
      const deltaResponse: GraphDeltaResponse = {
        value: [
          {
            id: "msg-active",
            subject: "TCS Campus Placement Drive",
            bodyPreview: "Eligible students register",
          },
          {
            id: "msg-deleted-123",
            "@removed": { reason: "deleted" },
          },
        ],
        "@odata.deltaLink": "https://graph.microsoft.com/delta-link-2",
      };

      vi.spyOn(clientModule, "callGraphApi").mockResolvedValue(deltaResponse);

      const result = await syncPlacementEmailsDelta({
        mailboxId: "placement@klu.ac.in",
        deltaLink: "https://graph.microsoft.com/prev-delta",
      });

      expect(result.newOrUpdatedMessages.length).toBe(1);
      expect(result.newOrUpdatedMessages[0].id).toBe("msg-active");
      expect(result.removedMessageIds).toEqual(["msg-deleted-123"]);
      expect(result.newDeltaLink).toBe("https://graph.microsoft.com/delta-link-2");
    });

    it("signals resyncRequired when HTTP 410 Gone is received", async () => {
      vi.spyOn(clientModule, "callGraphApi").mockRejectedValue(
        new clientModule.OutlookApiError("Delta token expired", 410, "ResyncRequired")
      );

      const result = await syncPlacementEmailsDelta({
        mailboxId: "placement@klu.ac.in",
        deltaLink: "https://graph.microsoft.com/expired-delta",
      });

      expect(result.resyncRequired).toBe(true);
      expect(result.newDeltaLink).toBeNull();
      expect(result.newOrUpdatedMessages).toEqual([]);
    });
  });
});
