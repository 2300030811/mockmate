import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { resumeGeneratePayloadSchema } from '../generate/schema';

export const runtime = 'nodejs';

const TailorRequestSchema = z.object({
  baseResume: resumeGeneratePayloadSchema,
  jobDescription: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = TailorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { baseResume, jobDescription } = parsed.data;

    const systemPrompt = `You are an expert AI Resume Tailor. You are given a Candidate's Base Resume (in JSON) and a Target Job Description.
Your task is to tailor the resume to perfectly match the job description, strictly outputting JSON matching the base resume schema.

Rules:
1. Rewrite the "summary" to inject keywords from the Job Description and align with the role. Do NOT exceed 2500 characters.
2. Reorder "experience" bullets (the "highlights" array) by relevance to the JD. You may lightly rewrite bullets to use exact vocabulary from the JD, but NEVER invent fake metrics, skills, or experiences the candidate does not have.
3. Select the most relevant "skills" and "technologies" from the base resume. You may reorder them.
4. Keep the exact same JSON structure for the returned fields. You only need to return: summary, skills, technologies, experience, and projects.
5. Do NOT change the candidate's name, email, phone, location, education, certifications, or publications. They will be preserved from the base resume.

Output strictly valid JSON.`;

    const userPrompt = `Base Resume JSON:\n${JSON.stringify({
      summary: baseResume.summary,
      skills: baseResume.skills,
      technologies: baseResume.technologies,
      experience: baseResume.experience,
      projects: baseResume.projects,
    }, null, 2)}\n\nJob Description:\n${jobDescription}`;

    let content = "";
    try {
      const result = await generateText(
        [{ role: 'user', content: userPrompt }],
        systemPrompt,
        "auto",
        {
          model: AI_MODELS.DEFAULT,
          temperature: 0.2,
          maxTokens: 4000,
          responseFormat: { type: 'json_object' },
        }
      );
      content = result.content;
    } catch (err) {
      console.error(`Tailor resume: AI Gateway failed`, err);
    }

    if (!content) {
      return NextResponse.json({ error: 'Failed to process tailoring with AI' }, { status: 500 });
    }

    let tailoredData;
    try {
      tailoredData = JSON.parse(content);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 });
    }

    // Master Alignment Validation: Remove fabricated content
    const baseText = JSON.stringify(baseResume).toLowerCase();
    
    if (tailoredData.skills) {
      tailoredData.skills = tailoredData.skills.filter((s: string) => baseText.includes(s.toLowerCase().trim()));
    }
    if (tailoredData.technologies) {
      tailoredData.technologies = tailoredData.technologies.filter((t: string) => baseText.includes(t.toLowerCase().trim()));
    }
    const baseCompanies = new Set((baseResume.experience || []).map((e: any) => e.company.toLowerCase().trim()));
    if (tailoredData.experience) {
      tailoredData.experience = tailoredData.experience.filter((e: any) => baseCompanies.has((e.company || "").toLowerCase().trim()));
    }

    const finalResume = {
      ...baseResume,
      summary: tailoredData.summary || baseResume.summary,
      skills: tailoredData.skills || baseResume.skills,
      technologies: tailoredData.technologies || baseResume.technologies,
      experience: tailoredData.experience || baseResume.experience,
      projects: tailoredData.projects || baseResume.projects,
    };

    const finalParsed = resumeGeneratePayloadSchema.safeParse(finalResume);
    if (!finalParsed.success) {
      return NextResponse.json({ error: 'AI generated invalid resume structure', details: finalParsed.error.format() }, { status: 500 });
    }

    return NextResponse.json(finalParsed.data);

  } catch (error: any) {
    console.error('Tailor error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
