import { describe, it, expect } from "vitest";
import { extractAndMatchKeywords, detectSections, detectQuantifiedAchievements } from "./ats-keywords";

describe("ATS Keyword Analysis", () => {
  const resumeText = `
    John Doe
    Experience: Managed a team of 10 software engineers to deliver a high-scale React application.
    Reduced latency by 20% and improved throughput by 2.5x.
    Skills: TypeScript, Node.js, Python, AWS, Docker.
    Education: BS in Computer Science from Stanford University.
  `;

  const jobDescription = `
    We are looking for a Senior Software Engineer with experience in React and TypeScript.
    Must have knowledge of AWS and Docker.
    Machine learning experience is a plus.
  `;

  it("should extract and match keywords correctly", () => {
    const result = extractAndMatchKeywords(resumeText, jobDescription);
    
    expect(result.matchPercent).toBeGreaterThan(0);
    // Unigrams are matched using stemmed tokens
    expect(result.matched).toContain("typescript");
    expect(result.matched).toContain("react");
    // AWS should match since punctuation filtering should strip out commas and periods correctly.
    // Note: 'aws' stems to 'aw' since the stemmer drops trailing 's'.
    expect(result.matched).toContain("aw");
    
    // Bigrams are matched if they appear twice in JD (this one doesn't in the sample)
    // "Machine learning" won't be in finalKeywords because freq is 1.
    expect(result.jdKeywords).not.toContain("machine learning");
  });

  it("should detect resume sections", () => {
    const sections = detectSections(resumeText);
    expect(sections.present).toContain("experience");
    expect(sections.present).toContain("skills");
    expect(sections.present).toContain("education");
    expect(sections.missing).toContain("projects");
  });

  it("should detect quantified achievements", () => {
    const metrics = detectQuantifiedAchievements(resumeText);
    expect(metrics.metricSignals).toBeGreaterThan(0);
    expect(metrics.summary).toContain("Quantified achievement signals:");
    expect(metrics.summary).toContain("Impact: Moderate");
  });

  it("should handle stemming correctly", () => {
    // "management" stems to "manag"
    // "managing" stems to "manag"
    const jdWithVariations = "Management skills.";
    const resumeWithVariations = "Experienced in managing.";
    const result = extractAndMatchKeywords(resumeWithVariations, jdWithVariations);
    
    // Management stems to manag, so it should successfully match with managing (also stems to manag).
    expect(result.matched).toContain("manag");
  });
});
