// Scanner service to fetch job postings from Greenhouse, Ashby, and Lever APIs.

export type ScannerApiType = "greenhouse" | "ashby" | "lever";

export interface ScannedJob {
  title: string;
  url: string;
  company: string;
  location: string;
  source: ScannerApiType;
  sourceJobId: string | null;
  normalizedCompany: string;
  normalizedTitle: string;
  fingerprint: string;
}

export interface CompanyTarget {
  name: string;
  apiType: ScannerApiType;
  apiUrl: string;
}

const FETCH_TIMEOUT_MS = 10000;
const COMPANY_SUFFIXES = [
  " inc.",
  " inc",
  " llc",
  " ltd",
  " corp",
  " corporation",
  " technologies",
  " technology",
  " group",
  " co.",
];

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function canonicalizeJobUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";

    const queryKeysToDrop = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    for (const key of queryKeysToDrop) {
      parsed.searchParams.delete(key);
    }

    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return trimmed;
  }
}

export function normalizeCompanyName(name: string): string {
  let normalized = compactWhitespace(name.toLowerCase()).replace(/[^a-z0-9\s]/g, "");

  for (const suffix of COMPANY_SUFFIXES) {
    if (normalized.endsWith(suffix.trim())) {
      normalized = normalized.slice(0, normalized.length - suffix.trim().length).trim();
      break;
    }
  }

  return normalized;
}

export function normalizeRoleTitle(title: string): string {
  const normalized = compactWhitespace(title.toLowerCase())
    .replace(/[|/]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "");

  return compactWhitespace(normalized);
}

export function buildJobFingerprint(company: string, title: string): string {
  return `${normalizeCompanyName(company)}::${normalizeRoleTitle(title)}`;
}

function toScannedJob(raw: {
  title: string;
  url: string;
  company: string;
  location: string;
  source: ScannerApiType;
  sourceJobId?: string | null;
}): ScannedJob | null {
  const title = compactWhitespace(raw.title);
  const url = canonicalizeJobUrl(raw.url);
  const company = compactWhitespace(raw.company);
  const location = compactWhitespace(raw.location);

  if (!title || !url || !company) {
    return null;
  }

  return {
    title,
    url,
    company,
    location,
    source: raw.source,
    sourceJobId: raw.sourceJobId ?? null,
    normalizedCompany: normalizeCompanyName(company),
    normalizedTitle: normalizeRoleTitle(title),
    fingerprint: buildJobFingerprint(company, title),
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function parseGreenhouse(json: unknown, companyName: string): ScannedJob[] {
  const payload = json as { jobs?: Array<{ id?: string | number; title?: string; absolute_url?: string; location?: { name?: string } }> };
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];

  return jobs
    .map((job) =>
      toScannedJob({
        title: asString(job.title),
        url: asString(job.absolute_url),
        company: companyName,
        location: asString(job.location?.name),
        source: "greenhouse",
        sourceJobId: job.id != null ? String(job.id) : null,
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

function parseAshby(json: unknown, companyName: string): ScannedJob[] {
  const payload = json as { jobs?: Array<{ id?: string | number; title?: string; jobUrl?: string; location?: string }> };
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];

  return jobs
    .map((job) =>
      toScannedJob({
        title: asString(job.title),
        url: asString(job.jobUrl),
        company: companyName,
        location: asString(job.location),
        source: "ashby",
        sourceJobId: job.id != null ? String(job.id) : null,
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

function parseLever(json: unknown, companyName: string): ScannedJob[] {
  if (!Array.isArray(json)) return [];

  const jobs = json as Array<{
    id?: string | number;
    text?: string;
    hostedUrl?: string;
    categories?: { location?: string };
  }>;

  return jobs
    .map((job) =>
      toScannedJob({
        title: asString(job.text),
        url: asString(job.hostedUrl),
        company: companyName,
        location: asString(job.categories?.location),
        source: "lever",
        sourceJobId: job.id != null ? String(job.id) : null,
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

export function filterJobsByKeywords(
  jobs: ScannedJob[],
  positiveKeywords: string[],
  negativeKeywords: string[]
): ScannedJob[] {
  const positive = positiveKeywords.map((keyword) => keyword.trim().toLowerCase()).filter(Boolean);
  const negative = negativeKeywords.map((keyword) => keyword.trim().toLowerCase()).filter(Boolean);

  return jobs.filter((job) => {
    const haystack = job.title.toLowerCase();
    const hasPositive = positive.length === 0 || positive.some((keyword) => haystack.includes(keyword));
    const hasNegative = negative.some((keyword) => haystack.includes(keyword));
    return hasPositive && !hasNegative;
  });
}

export function dedupeScannedJobs(jobs: ScannedJob[]): ScannedJob[] {
  const seenUrls = new Set<string>();
  const seenFingerprints = new Set<string>();
  const deduped: ScannedJob[] = [];

  for (const job of jobs) {
    if (seenUrls.has(job.url) || seenFingerprints.has(job.fingerprint)) {
      continue;
    }

    seenUrls.add(job.url);
    seenFingerprints.add(job.fingerprint);
    deduped.push(job);
  }

  return deduped;
}

export async function scanCompany(target: CompanyTarget): Promise<ScannedJob[]> {
  const json = await fetchJson(target.apiUrl);

  switch (target.apiType) {
    case "greenhouse":
      return parseGreenhouse(json, target.name);
    case "ashby":
      return parseAshby(json, target.name);
    case "lever":
      return parseLever(json, target.name);
    default:
      return [];
  }
}
