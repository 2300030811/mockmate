import { CareerAnalysisResult } from "@/types/career";

export function buildMarkdownRoadmap(data: CareerAnalysisResult): string {
  let md = `# Career Roadmap: ${data.jobRole}${data.company ? ` at ${data.company}` : ""}\n\n`;
  md += `**Generated On:** ${new Date().toLocaleDateString()}\n\n`;

  md += `## Readiness Score: ${data.matchScore}%\n\n`;

  md += `## Market Insights\n`;
  md += `- **Demand:** ${data.marketInsights?.demand.toUpperCase() || "N/A"}\n`;
  md += `- **Salary Range:** ${data.marketInsights?.salaryRange || "N/A"}\n`;
  md += `- **Confidence:** ${data.marketInsights?.confidence || "Medium"}\n`;
  md += `- **Outlook:** ${data.marketInsights?.outlook || "N/A"}\n\n`;

  if (data.strengths && data.strengths.length > 0) {
    md += `## Your Strengths\n`;
    data.strengths.forEach((s) => (md += `- **${s.skill}** (${s.level}): ${s.evidence}\n`));
    md += `\n`;
  }

  if (data.competitiveEdge) {
    md += `## Competitive Edge\n${data.competitiveEdge}\n\n`;
  }

  if (data.levelStrategy) {
    md += `## Leveling Strategy (Detected: ${data.levelStrategy.detectedLevel})\n`;
    md += `- **Pitch:** ${data.levelStrategy.pitchStrategy}\n`;
    md += `- **Mitigation:** ${data.levelStrategy.downlevelMitigation}\n\n`;
  }

  if (data.suggestedRoles && data.suggestedRoles.length > 0) {
    md += `## Role Suggestions\n`;
    data.suggestedRoles.forEach((r) => {
      md += `### ${r.role} — ${r.matchPercentage}% Match\n`;
      if (r.reasoning) md += `*${r.reasoning}*\n\n`;
      if (r.keyMatchingSkills.length > 0) md += `**Matching Skills:** ${r.keyMatchingSkills.join(", ")}\n`;
      if (r.missingSkills.length > 0) md += `**Skills to Learn:** ${r.missingSkills.join(", ")}\n`;
      md += `\n`;
    });
  }

  md += `## Matched Skills\n`;
  data.extractedSkills.forEach((s) => (md += `- [x] ${s.name} (${s.category})\n`));
  md += `\n## Missing Skills\n`;
  data.missingSkills.forEach((s) => (md += `- [ ] ${s.skill} (Priority: ${s.importance})\n`));

  md += `\n## Learning Roadmap\n`;
  data.roadmap.forEach((step) => {
    md += `### ${step.title} (${step.duration})\n`;
    if (step.priority) md += `**Priority:** ${step.priority} | `;
    if (step.estimatedHours) md += `**Estimated:** ~${step.estimatedHours} hours\n`;
    md += `\n${step.description}\n`;
    if (step.milestone) md += `\n> 🎯 **Milestone:** ${step.milestone}\n`;
    step.resources.forEach((res) => md += `- [${res.name}](${res.url}) *(${res.type})*\n`);
    md += `\n`;
  });

  if (data.interviewPrep) {
    md += `## Interview Preparation\n`;
    data.interviewPrep.topQuestions.forEach((q) => {
      md += `### ${q.question}\n`;
      if (q.difficulty) md += `*Difficulty: ${q.difficulty}*\n`;
      if (q.category) md += `*Category: ${q.category}*\n`;
      md += `*Reason: ${q.reason}*\n\n`;
    });

    if (data.interviewPrep.starStories && data.interviewPrep.starStories.length > 0) {
      md += `## Recommended STAR Stories\n`;
      data.interviewPrep.starStories.forEach((s) => {
        md += `### ${s.requirementMatch}\n`;
        md += `**S/T:** ${s.situationTask}\n`;
        md += `**Action:** ${s.action}\n`;
        md += `**Result:** ${s.result}\n`;
        if (s.seniorReflection) md += `*Reflection: ${s.seniorReflection}*\n\n`;
        md += `\n`;
      });
    }
  }

  md += `---\n*Disclaimer: Salary data is aggregated from public job listings. Actual salaries may vary based on experience, location, and company factors.*`;
  return md;
}

export function exportRoadmapToMarkdown(data: CareerAnalysisResult): void {
  const md = buildMarkdownRoadmap(data);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `career-roadmap-${data.jobRole.toLowerCase().replace(/\s+/g, "-")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
