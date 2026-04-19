import { describe, expect, it } from "vitest";
import {
  ScannedJob,
  buildJobFingerprint,
  dedupeScannedJobs,
  filterJobsByKeywords,
  normalizeCompanyName,
  normalizeRoleTitle,
} from "./scanner";

function makeJob(overrides: Partial<ScannedJob>): ScannedJob {
  return {
    title: "Senior Software Engineer",
    url: "https://jobs.example.com/123",
    company: "Example Inc",
    location: "Remote",
    source: "lever",
    sourceJobId: "123",
    normalizedCompany: "example",
    normalizedTitle: "senior software engineer",
    fingerprint: "example::senior software engineer",
    ...overrides,
  };
}

describe("scanner helpers", () => {
  it("normalizes company names and strips common suffixes", () => {
    expect(normalizeCompanyName("Acme Technologies")).toBe("acme");
    expect(normalizeCompanyName("  Planetary   LLC ")).toBe("planetary");
  });

  it("normalizes role titles", () => {
    expect(normalizeRoleTitle("Senior / Platform Engineer (AI) ")).toBe("senior platform engineer ai");
  });

  it("builds stable fingerprints", () => {
    expect(buildJobFingerprint("Acme Inc", "Staff Engineer")).toBe("acme::staff engineer");
  });

  it("dedupes jobs by URL and fingerprint", () => {
    const jobs = [
      makeJob({ url: "https://jobs.example.com/1", fingerprint: "acme::staff engineer" }),
      makeJob({ url: "https://jobs.example.com/1", fingerprint: "acme::staff engineer v2" }),
      makeJob({ url: "https://jobs.example.com/2", fingerprint: "acme::staff engineer" }),
      makeJob({
        url: "https://jobs.example.com/3",
        title: "Machine Learning Engineer",
        normalizedTitle: "machine learning engineer",
        fingerprint: "acme::machine learning engineer",
      }),
    ];

    const deduped = dedupeScannedJobs(jobs);

    expect(deduped).toHaveLength(2);
    expect(deduped[0].url).toBe("https://jobs.example.com/1");
    expect(deduped[1].url).toBe("https://jobs.example.com/3");
  });

  it("filters by positive and negative keywords", () => {
    const jobs = [
      makeJob({ title: "Senior Software Engineer" }),
      makeJob({
        title: "Junior Software Engineer",
        url: "https://jobs.example.com/2",
        fingerprint: "example::junior software engineer",
        normalizedTitle: "junior software engineer",
      }),
      makeJob({
        title: "Machine Learning Engineer",
        url: "https://jobs.example.com/3",
        fingerprint: "example::machine learning engineer",
        normalizedTitle: "machine learning engineer",
      }),
    ];

    const filtered = filterJobsByKeywords(jobs, ["engineer", "machine learning"], ["junior"]);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((job) => job.title)).toEqual([
      "Senior Software Engineer",
      "Machine Learning Engineer",
    ]);
  });
});
