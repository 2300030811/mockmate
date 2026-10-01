// Scanner service to fetch job postings from Greenhouse, Ashby, Lever,
// Workday, Workable, Oracle Cloud, Remotive, and Arbeitnow APIs.
// Ported & optimized from Job Radar and Career-Ops.

import { applyScoringGates } from "@/lib/career-ops/scoring-gates";

export type ScannerApiType =
  | "greenhouse"
  | "ashby"
  | "lever"
  | "workday"
  | "workable"
  | "oracle"
  | "remotive"
  | "arbeitnow";

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
  description?: string;
  postedAt?: string | null;
  isSenior?: boolean;
  gateReason?: string;
}

export interface CompanyTarget {
  name: string;
  apiType: ScannerApiType;
  apiUrl: string;
  slug?: string;
  domain?: string;
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

    const queryKeysToDrop = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gh_src",
      "ref",
    ];
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

export function toScannedJob(raw: {
  title: string;
  url: string;
  company: string;
  location: string;
  source: ScannerApiType;
  sourceJobId?: string | null;
  description?: string;
  postedAt?: string | null;
}): ScannedJob | null {
  const title = compactWhitespace(raw.title);
  const url = canonicalizeJobUrl(raw.url);
  const company = compactWhitespace(raw.company);
  const location = compactWhitespace(raw.location);

  if (!title || !url || !company) {
    return null;
  }

  // ponytail: deterministic scoring gate run in-memory; zero tokens used
  const gate = applyScoringGates(100, title);

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
    description: raw.description ? raw.description.slice(0, 4000) : undefined,
    postedAt: raw.postedAt ?? null,
    isSenior: gate.isCapped && gate.cappedBy === "seniority",
    gateReason: gate.isCapped ? gate.reason : undefined,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MockMate-Radar/1.0 (+https://mockmate.app)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPostJson(url: string, body: Record<string, unknown>): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "MockMate-Radar/1.0 (+https://mockmate.app)",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export function parseGreenhouse(json: unknown, companyName: string): ScannedJob[] {
  const payload = json as {
    jobs?: Array<{
      id?: string | number;
      title?: string;
      absolute_url?: string;
      location?: { name?: string };
      content?: string;
      updated_at?: string;
    }>;
  };
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
        description: asString(job.content),
        postedAt: asString(job.updated_at),
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

export function parseAshby(json: unknown, companyName: string): ScannedJob[] {
  const payload = json as {
    jobs?: Array<{
      id?: string | number;
      title?: string;
      jobUrl?: string;
      location?: string;
      descriptionPlain?: string;
      publishedAt?: string;
    }>;
  };
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
        description: asString(job.descriptionPlain),
        postedAt: asString(job.publishedAt),
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

export function parseLever(json: unknown, companyName: string): ScannedJob[] {
  if (!Array.isArray(json)) return [];

  const jobs = json as Array<{
    id?: string | number;
    text?: string;
    hostedUrl?: string;
    categories?: { location?: string };
    descriptionPlain?: string;
    createdAt?: number;
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
        description: asString(job.descriptionPlain),
        postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

export function parseWorkday(json: unknown, companyName: string, baseUrl: string): ScannedJob[] {
  const payload = json as {
    jobPostings?: Array<{
      title?: string;
      externalPath?: string;
      locationsText?: string;
      bulletFields?: string[];
      postedOn?: string;
    }>;
  };
  const postings = Array.isArray(payload.jobPostings) ? payload.jobPostings : [];

  // Extract site from CXS URL e.g. /wday/cxs/{tenant}/{site}/jobs
  const siteMatch = baseUrl.match(/\/wday\/cxs\/[^/]+\/([^/]+)/);
  const site = siteMatch ? siteMatch[1] : "";
  const hostBase = baseUrl.replace(/\/wday\/cxs\/.*$/, "");

  return postings
    .map((job) => {
      const path = asString(job.externalPath);
      let url = "";
      if (path) {
        if (site && !path.startsWith(`/${site}`)) {
          url = `${hostBase}/${site}${path}`;
        } else {
          url = `${hostBase}${path}`;
        }
      }
      return toScannedJob({
        title: asString(job.title),
        url,
        company: companyName,
        location: asString(job.locationsText),
        source: "workday",
        sourceJobId: path || null,
        description: Array.isArray(job.bulletFields) ? job.bulletFields.join(" ") : "",
        postedAt: asString(job.postedOn),
      });
    })
    .filter((job): job is ScannedJob => job !== null);
}

export function parseWorkable(json: unknown, companyName: string): ScannedJob[] {
  const payload = json as {
    jobs?: Array<{
      shortcode?: string;
      title?: string;
      url?: string;
      application_url?: string;
      location?: string | { city?: string; country?: string };
      description?: string;
      published_on?: string;
    }>;
  };
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];

  return jobs
    .map((job) => {
      let loc = "";
      if (typeof job.location === "string") {
        loc = job.location;
      } else if (job.location && typeof job.location === "object") {
        loc = [job.location.city, job.location.country].filter(Boolean).join(", ");
      }

      return toScannedJob({
        title: asString(job.title),
        url: asString(job.url || job.application_url),
        company: companyName,
        location: loc,
        source: "workable",
        sourceJobId: asString(job.shortcode) || null,
        description: asString(job.description),
        postedAt: asString(job.published_on),
      });
    })
    .filter((job): job is ScannedJob => job !== null);
}

export function parseOracle(json: unknown, companyName: string, host: string, site: string): ScannedJob[] {
  const payload = json as {
    items?: Array<{
      requisitionList?: Array<{
        Id?: string | number;
        Title?: string;
        PrimaryLocation?: string;
        ShortDescriptionStr?: string;
        PostedDate?: string;
      }>;
    }>;
  };
  const reqs = Array.isArray(payload.items?.[0]?.requisitionList) ? payload.items![0].requisitionList! : [];

  return reqs
    .map((item) => {
      const id = item.Id != null ? String(item.Id) : "";
      const url = id ? `https://${host}/hcmUI/CandidateExperience/en/sites/${site}/job/${id}` : "";
      return toScannedJob({
        title: asString(item.Title),
        url,
        company: companyName,
        location: asString(item.PrimaryLocation),
        source: "oracle",
        sourceJobId: id || null,
        description: asString(item.ShortDescriptionStr),
        postedAt: asString(item.PostedDate),
      });
    })
    .filter((job): job is ScannedJob => job !== null);
}

export function parseRemotive(json: unknown, fallbackCompany: string): ScannedJob[] {
  const payload = json as {
    jobs?: Array<{
      id?: string | number;
      title?: string;
      url?: string;
      company_name?: string;
      candidate_required_location?: string;
      description?: string;
      publication_date?: string;
    }>;
  };
  const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];

  return jobs
    .map((job) =>
      toScannedJob({
        title: asString(job.title),
        url: asString(job.url),
        company: asString(job.company_name) || fallbackCompany,
        location: asString(job.candidate_required_location) || "Remote",
        source: "remotive",
        sourceJobId: job.id != null ? String(job.id) : null,
        description: asString(job.description),
        postedAt: asString(job.publication_date),
      })
    )
    .filter((job): job is ScannedJob => job !== null);
}

export function parseArbeitnow(json: unknown, fallbackCompany: string): ScannedJob[] {
  const payload = json as {
    data?: Array<{
      slug?: string;
      title?: string;
      url?: string;
      company_name?: string;
      location?: string;
      description?: string;
      created_at?: number;
    }>;
  };
  const jobs = Array.isArray(payload.data) ? payload.data : [];

  return jobs
    .map((job) =>
      toScannedJob({
        title: asString(job.title),
        url: asString(job.url),
        company: asString(job.company_name) || fallbackCompany,
        location: asString(job.location),
        source: "arbeitnow",
        sourceJobId: asString(job.slug) || null,
        description: asString(job.description),
        postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
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
    const haystack = `${job.title} ${job.location}`.toLowerCase();
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
  switch (target.apiType) {
    case "greenhouse": {
      const json = await fetchJson(target.apiUrl);
      return parseGreenhouse(json, target.name);
    }
    case "ashby": {
      const json = await fetchJson(target.apiUrl);
      return parseAshby(json, target.name);
    }
    case "lever": {
      const json = await fetchJson(target.apiUrl);
      return parseLever(json, target.name);
    }
    case "workday": {
      // Workday CXS POST endpoint
      const json = await fetchPostJson(target.apiUrl, {
        appliedFacets: {},
        limit: 20,
        offset: 0,
        searchText: "",
      });
      return parseWorkday(json, target.name, target.apiUrl);
    }
    case "workable": {
      const json = await fetchJson(target.apiUrl);
      return parseWorkable(json, target.name);
    }
    case "oracle": {
      // Expects target.apiUrl or slug 'host/site'
      const parsedUrl = new URL(target.apiUrl);
      const host = parsedUrl.host;
      const siteMatch = target.apiUrl.match(/siteNumber=([^,&]+)/) || target.apiUrl.match(/sites\/([^/]+)/);
      const site = siteMatch ? siteMatch[1] : "CX_1";
      const json = await fetchJson(target.apiUrl);
      return parseOracle(json, target.name, host, site);
    }
    case "remotive": {
      const json = await fetchJson(target.apiUrl);
      return parseRemotive(json, target.name);
    }
    case "arbeitnow": {
      const json = await fetchJson(target.apiUrl);
      return parseArbeitnow(json, target.name);
    }
    default:
      return [];
  }
}
