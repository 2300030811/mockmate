import { describe, expect, it } from "vitest";
import {
  ScannedJob,
  buildJobFingerprint,
  dedupeScannedJobs,
  filterJobsByKeywords,
  normalizeCompanyName,
  normalizeRoleTitle,
  parseGreenhouse,
  parseAshby,
  parseLever,
  parseWorkday,
  parseWorkable,
  parseOracle,
  parseRemotive,
  parseArbeitnow,
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

describe("board parsers (ported from Job Radar & Career-Ops)", () => {
  it("parses Greenhouse responses", () => {
    const payload = {
      jobs: [
        {
          id: 101,
          title: "Frontend Engineer",
          absolute_url: "https://boards.greenhouse.io/figma/jobs/101",
          location: { name: "San Francisco, CA" },
          content: "<p>React role</p>",
        },
      ],
    };
    const jobs = parseGreenhouse(payload, "Figma");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Frontend Engineer");
    expect(jobs[0].company).toBe("Figma");
    expect(jobs[0].source).toBe("greenhouse");
    expect(jobs[0].isSenior).toBe(false);
  });

  it("parses Ashby responses", () => {
    const payload = {
      jobs: [
        {
          id: "ashby-1",
          title: "Backend Engineer",
          jobUrl: "https://jobs.ashbyhq.com/ramp/ashby-1",
          location: "New York, NY",
          descriptionPlain: "Go / Node backend",
        },
      ],
    };
    const jobs = parseAshby(payload, "Ramp");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Backend Engineer");
    expect(jobs[0].source).toBe("ashby");
  });

  it("parses Lever responses and sets senior flag via deterministic gate", () => {
    const payload = [
      {
        id: "lev-1",
        text: "Staff Systems Engineer",
        hostedUrl: "https://jobs.lever.co/spotify/lev-1",
        categories: { location: "Stockholm" },
      },
    ];
    const jobs = parseLever(payload, "Spotify");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Staff Systems Engineer");
    expect(jobs[0].source).toBe("lever");
    expect(jobs[0].isSenior).toBe(true);
    expect(jobs[0].gateReason).toContain("senior role title");
  });

  it("parses Workday CXS responses", () => {
    const payload = {
      jobPostings: [
        {
          title: "Software Engineer III",
          externalPath: "/job/San-Jose/Software-Engineer-III_R12345",
          locationsText: "San Jose, CA",
          bulletFields: ["Requirements: Python, AWS", "Competitive pay"],
        },
      ],
    };
    const baseUrl = "https://adobe.wd5.myworkdayjobs.com/wday/cxs/adobe/external_experienced/jobs";
    const jobs = parseWorkday(payload, "Adobe", baseUrl);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Software Engineer III");
    expect(jobs[0].url).toBe("https://adobe.wd5.myworkdayjobs.com/external_experienced/job/San-Jose/Software-Engineer-III_R12345");
    expect(jobs[0].source).toBe("workday");
    expect(jobs[0].isSenior).toBe(true); // 'III' is in SENIOR tokens
  });

  it("parses Workable widget responses", () => {
    const payload = {
      jobs: [
        {
          shortcode: "WK123",
          title: "Fullstack Developer",
          url: "https://apply.workable.com/techcorp/j/WK123",
          location: { city: "London", country: "UK" },
          description: "TypeScript and Postgres",
        },
      ],
    };
    const jobs = parseWorkable(payload, "TechCorp");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Fullstack Developer");
    expect(jobs[0].location).toBe("London, UK");
    expect(jobs[0].source).toBe("workable");
    expect(jobs[0].isSenior).toBe(false);
  });

  it("parses Oracle Cloud HCM responses", () => {
    const payload = {
      items: [
        {
          requisitionList: [
            {
              Id: "54321",
              Title: "Cloud Infrastructure Engineer",
              PrimaryLocation: "Austin, TX",
              ShortDescriptionStr: "Kubernetes & OCI",
            },
          ],
        },
      ],
    };
    const jobs = parseOracle(payload, "Oracle Corp", "eeho.fa.us2.oraclecloud.com", "CX_1");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Cloud Infrastructure Engineer");
    expect(jobs[0].url).toContain("/sites/CX_1/job/54321");
    expect(jobs[0].source).toBe("oracle");
  });

  it("parses Remotive aggregator responses", () => {
    const payload = {
      jobs: [
        {
          id: 998,
          title: "Remote Python Engineer",
          company_name: "FinTech Global",
          url: "https://remotive.com/jobs/998",
          candidate_required_location: "Worldwide",
          description: "FastAPI developer needed",
        },
      ],
    };
    const jobs = parseRemotive(payload, "Remotive");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Remote Python Engineer");
    expect(jobs[0].company).toBe("FinTech Global");
    expect(jobs[0].source).toBe("remotive");
  });

  it("parses Arbeitnow aggregator responses", () => {
    const payload = {
      data: [
        {
          slug: "berlin-frontend-dev",
          title: "React Developer",
          company_name: "Berlin Tech",
          url: "https://www.arbeitnow.com/jobs/berlin-frontend-dev",
          location: "Berlin, Germany",
          description: "Next.js & Tailwind",
        },
      ],
    };
    const jobs = parseArbeitnow(payload, "Arbeitnow");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("React Developer");
    expect(jobs[0].company).toBe("Berlin Tech");
    expect(jobs[0].source).toBe("arbeitnow");
  });
});
