/**
 * Microsoft Graph Email Delta Synchronization Service.
 * Implements folder-scoped incremental delta sync, pagination, and @removed message tracking.
 * Pure native fetch via callGraphApi.
 */

import { callGraphApi, OutlookApiError, GraphRequestOptions } from "./outlook-client";

export interface GraphEmailRecipient {
  emailAddress?: {
    name?: string;
    address?: string;
  };
}

export interface GraphMessageItem {
  id: string;
  subject?: string;
  bodyPreview?: string;
  body?: {
    contentType?: "text" | "html";
    content?: string;
  };
  from?: GraphEmailRecipient;
  receivedDateTime?: string;
  hasAttachments?: boolean;
  importance?: "low" | "normal" | "high";
  conversationId?: string;
  "@removed"?: {
    reason: "deleted" | "moved";
  };
}

export interface GraphDeltaResponse {
  value: GraphMessageItem[];
  "@odata.nextLink"?: string;
  "@odata.deltaLink"?: string;
}

export interface EmailDeltaSyncResult {
  newOrUpdatedMessages: GraphMessageItem[];
  removedMessageIds: string[];
  newDeltaLink: string | null;
  resyncRequired: boolean;
}

const PLACEMENT_KEYWORDS = [
  "placement",
  "campus drive",
  "recruitment",
  "shortlist",
  "shortlisted",
  "assessment",
  "interview",
  "aptitude",
  "package",
  "ctc",
  "registration deadline",
  "offer",
  "hiring",
  "internship",
  "selection process",
];

/**
 * Checks if an email is placement related based on keywords in subject or body preview.
 */
export function isPlacementRelatedEmail(
  subject?: string,
  bodyPreview?: string
): boolean {
  const combined = `${subject || ""} ${bodyPreview || ""}`.toLowerCase();
  return PLACEMENT_KEYWORDS.some((kw) => combined.includes(kw));
}

/**
 * Performs full or incremental delta sync for placement emails.
 */
export async function syncPlacementEmailsDelta(params: {
  mailboxId: string;
  folderId?: string | null;
  deltaLink?: string | null;
  filterByKeywords?: boolean;
  customOptions?: GraphRequestOptions;
}): Promise<EmailDeltaSyncResult> {
  const {
    mailboxId,
    folderId = "Inbox",
    deltaLink,
    filterByKeywords = true,
    customOptions,
  } = params;

  let requestUrl: string =
    deltaLink ||
    `/users/${encodeURIComponent(mailboxId)}/mailFolders/${encodeURIComponent(
      folderId || "Inbox"
    )}/messages/delta?$top=50&$select=id,subject,bodyPreview,body,from,receivedDateTime,hasAttachments,importance,conversationId`;

  const newOrUpdatedMessages: GraphMessageItem[] = [];
  const removedMessageIds: string[] = [];
  let capturedDeltaLink: string | null = null;

  try {
    while (requestUrl) {
      const response: GraphDeltaResponse = await callGraphApi<GraphDeltaResponse>(
        requestUrl,
        customOptions
      );

      for (const item of response.value || []) {
        if (item["@removed"]) {
          removedMessageIds.push(item.id);
        } else {
          // If keyword filtering is requested, apply relevance check
          if (!filterByKeywords || isPlacementRelatedEmail(item.subject, item.bodyPreview)) {
            newOrUpdatedMessages.push(item);
          }
        }
      }

      if (response["@odata.nextLink"]) {
        requestUrl = response["@odata.nextLink"];
      } else {
        capturedDeltaLink = response["@odata.deltaLink"] || null;
        break;
      }
    }

    return {
      newOrUpdatedMessages,
      removedMessageIds,
      newDeltaLink: capturedDeltaLink,
      resyncRequired: false,
    };
  } catch (err) {
    // If delta token expired (HTTP 410 Gone), signal that a fresh resync is required
    if (err instanceof OutlookApiError && err.is410) {
      return {
        newOrUpdatedMessages: [],
        removedMessageIds: [],
        newDeltaLink: null,
        resyncRequired: true,
      };
    }
    throw err;
  }
}
