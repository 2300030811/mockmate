/**
 * Hybrid Placement Extraction Engine (Deterministic Regex + AI Structured Parsing).
 * Extracts company names, CTC/package, eligible branches, minimum CGPA, and interview stages
 * with confidence scores and source evidence.
 * Also handles in-memory PDF attachment parsing via pdf-parse.
 */

import { PlacementEventType } from "@/types/placements";

export interface ExtractedPlacementEvent {
  eventType: PlacementEventType;
  title: string;
  startTime: string; // ISO
  endTime: string | null; // ISO
  venue: string | null;
  meetingUrl: string | null;
  confidence: number;
  evidence?: string;
}

export interface ExtractedPlacementNotice {
  companyName: string;
  roleTitle: string | null;
  packageText: string | null;
  minLpa: number | null;
  maxLpa: number | null;
  eligibleBranches: string[];
  minCgpa: number | null;
  confidence: number; // 0.0 - 1.0
  evidence: {
    company?: string;
    package?: string;
    deadline?: string;
    eligibility?: string;
  };
  isRescheduling: boolean;
  isCancellation: boolean;
  reschedulingDetails: string | null;
  events: ExtractedPlacementEvent[];
  rawSourceText: string;
}

const COMMON_BRANCHES = [
  "CSE",
  "ECE",
  "EEE",
  "IT",
  "MECH",
  "CIVIL",
  "AIDS",
  "CSIT",
  "AIML",
  "ECM",
  "BT",
];

/**
 * Deterministically parses package/CTC figures from text snippets.
 */
export function extractDeterministicPackage(text: string): {
  rawPackageText: string | null;
  minLpa: number | null;
  maxLpa: number | null;
  evidence?: string;
} {
  // Regex matching patterns like "14.5 LPA", "₹ 6 - 8 LPA", "12 Lakhs per annum", "CTC: 10 LPA"
  const pkgRegex =
    /(?:(?:CTC|Package|Salary|Compensation|Stipend)[:\s-]*)?(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:LPA|Lakhs?(?:\s*per\s*annum)?|L\.P\.A)/i;

  const match = text.match(pkgRegex);
  if (!match) {
    return { rawPackageText: null, minLpa: null, maxLpa: null };
  }

  const snippet = match[0].trim();
  const val1 = parseFloat(match[1]);
  const val2 = match[2] ? parseFloat(match[2]) : null;

  const minLpa = val2 ? Math.min(val1, val2) : val1;
  const maxLpa = val2 ? Math.max(val1, val2) : val1;

  return {
    rawPackageText: snippet,
    minLpa,
    maxLpa,
    evidence: snippet,
  };
}

/**
 * Deterministically identifies eligible engineering branches.
 */
export function extractDeterministicBranches(text: string): string[] {
  const branches = new Set<string>();
  const upper = text.toUpperCase();

  for (const b of COMMON_BRANCHES) {
    const regex = new RegExp(`\\b${b}\\b`, "i");
    if (regex.test(upper)) {
      branches.add(b);
    }
  }

  return Array.from(branches);
}

/**
 * Deterministically extracts minimum CGPA requirement.
 */
export function extractDeterministicCgpa(text: string): {
  minCgpa: number | null;
  evidence?: string;
} {
  const cgpaRegex = /(?:CGPA|GPA|Cutoff|Percentage)[:\s]*(?:>=|=>|≥|above|minimum|min)?\s*([5-9](?:\.\d+)?)/i;
  const match = text.match(cgpaRegex);
  if (match) {
    const val = parseFloat(match[1]);
    return { minCgpa: val, evidence: match[0].trim() };
  }
  return { minCgpa: null };
}

/**
 * Detects rescheduling or cancellation markers in notice text.
 */
export function detectReschedulingOrCancellation(text: string): {
  isRescheduling: boolean;
  isCancellation: boolean;
  details: string | null;
} {
  const lower = text.toLowerCase();
  const isCancellation =
    lower.includes("cancelled") ||
    lower.includes("called off") ||
    lower.includes("drive stands cancelled");

  const isRescheduling =
    lower.includes("rescheduled") ||
    lower.includes("postponed") ||
    lower.includes("time changed") ||
    lower.includes("revised schedule");

  let details: string | null = null;
  if (isRescheduling || isCancellation) {
    const lines = text.split("\n");
    const matchedLine = lines.find(
      (l) =>
        l.toLowerCase().includes("reschedul") ||
        l.toLowerCase().includes("postpon") ||
        l.toLowerCase().includes("cancel")
    );
    details = matchedLine ? matchedLine.trim() : null;
  }

  return { isRescheduling, isCancellation, details };
}

/**
 * Parses PDF attachment byte buffer into raw plain text.
 */
export async function extractAttachmentPdfText(
  base64ContentBytes: string
): Promise<string> {
  try {
    const pdfBuffer = Buffer.from(base64ContentBytes, "base64");
    // eslint-disable-next-line
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(pdfBuffer);
    return data.text || "";
  } catch (error) {
    console.error("Failed to parse PDF attachment buffer:", error);
    return "";
  }
}

/**
 * Core hybrid extraction: combines deterministic parsing with structured evidence and confidence.
 */
export function parsePlacementNotice(
  subject: string,
  body: string,
  attachmentText?: string
): ExtractedPlacementNotice {
  const combinedText = `${subject}\n${body}\n${attachmentText || ""}`;

  const pkgInfo = extractDeterministicPackage(combinedText);
  const branches = extractDeterministicBranches(combinedText);
  const cgpaInfo = extractDeterministicCgpa(combinedText);
  const { isRescheduling, isCancellation, details: reschedulingDetails } =
    detectReschedulingOrCancellation(combinedText);

  // Derive company name from subject or prominent header
  let companyName = "Placement Drive";
  let companyEvidence: string | undefined;

  // Heuristic: Check if subject has "Company Name - Drive / Recruitment" or "Campus Drive by Company"
  const byMatch = subject.match(/(?:by|from|at)\s+([A-Za-z0-9\s&.]+?)(?:\s+for|\s+-|\s+campus|$)/i);
  const dashMatch = subject.match(/^([A-Za-z0-9\s&.]+?)\s*(?:-|–|:)\s*(?:Campus|Placement|Recruitment|Online|Drive|Interview)/i);

  if (dashMatch && dashMatch[1].trim().length > 2) {
    companyName = dashMatch[1].trim();
    companyEvidence = dashMatch[0];
  } else if (byMatch && byMatch[1].trim().length > 2) {
    companyName = byMatch[1].trim();
    companyEvidence = byMatch[0];
  } else {
    // Fallback to first line or subject title
    companyName = subject.split(/[-–:]/)[0].trim() || "Placement Drive";
  }

  // Calculate confidence score based on completeness of evidence
  let confidenceScore = 0.5;
  if (companyEvidence) confidenceScore += 0.2;
  if (pkgInfo.rawPackageText) confidenceScore += 0.15;
  if (branches.length > 0) confidenceScore += 0.1;
  if (cgpaInfo.minCgpa) confidenceScore += 0.05;
  confidenceScore = Math.min(0.98, confidenceScore);

  return {
    companyName,
    roleTitle: null,
    packageText: pkgInfo.rawPackageText,
    minLpa: pkgInfo.minLpa,
    maxLpa: pkgInfo.maxLpa,
    eligibleBranches: branches,
    minCgpa: cgpaInfo.minCgpa,
    confidence: Number(confidenceScore.toFixed(2)),
    evidence: {
      company: companyEvidence,
      package: pkgInfo.evidence,
      eligibility: branches.length > 0 ? `Branches: ${branches.join(", ")}` : undefined,
    },
    isRescheduling,
    isCancellation,
    reschedulingDetails,
    events: [],
    rawSourceText: combinedText,
  };
}
