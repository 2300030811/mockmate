'use server';

import { CareerAnalysisResult, Skill, SkillGap, LearningStep } from '@/types/career';
import Groq from 'groq-sdk';
import pdf from 'pdf-parse';
import { env } from '@/lib/env'; 
import { z } from 'zod';
import { sanitizePromptInput } from '@/utils/sanitize';
import { getNextKey } from '@/utils/keyManager';
import { fetchSalaryEstimate, EnrichedSalaryData } from '@/lib/services/salary-service';

// Simple heuristic to estimate years of experience from resume text
export function estimateExperienceYears(resumeText: string): number | undefined {
  // Pattern: "X years of experience" or "X+ years" or "X yrs"
  const patterns = [
    /\b(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
    /\b(?:experience|exp)\s*(?:of)?\s*(?:over|about|approximately)?\s*(\d{1,2})\+?\s*(?:years?|yrs?)/i,
    /\b(\d{4})\s*(?:-|–|to)\s*(?:present|current|now|\d{4})/gi,
  ];

  // Try direct patterns first
  for (const pattern of patterns.slice(0, 2)) {
    const match = resumeText.match(pattern);
    if (match?.[1]) {
      const years = parseInt(match[1], 10);
      if (years >= 0 && years <= 50) return years;
    }
  }

  // Try date range extraction (count spans)
  const dateRanges = [...resumeText.matchAll(/(\d{4})\s*(?:-|–|to)\s*(?:present|current|now|(\d{4}))/gi)];
  if (dateRanges.length > 0) {
    const currentYear = new Date().getFullYear();
    let earliest = currentYear;
    for (const m of dateRanges) {
      const start = parseInt(m[1], 10);
      if (start >= 1980 && start < currentYear && start < earliest) earliest = start;
    }
    if (earliest < currentYear) return currentYear - earliest;
  }

  return undefined;
}

// Zod schemas for AI response validation
const AnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100).default(0),
  extractedSkills: z.array(z.object({
    name: z.string(),
    category: z.enum(["technical", "soft", "domain"]).catch("technical")
  })).default([]),
  missingSkills: z.array(z.object({
    skill: z.string(),
    category: z.enum(["technical", "soft", "domain"]).catch("technical"),
    importance: z.enum(["high", "medium", "low"]).catch("medium"),
    recommendedQuiz: z.enum(["aws", "azure", "mongodb", "salesforce", "pcap", "java"]).nullable().optional()
  })).default([]),
  strengths: z.array(z.object({
    skill: z.string(),
    evidence: z.string(),
    level: z.enum(["expert", "proficient", "intermediate"]).catch("proficient")
  })).default([]),
  competitiveEdge: z.string().optional(),
  roadmap: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    milestone: z.string().catch('Complete phase objectives'),
    priority: z.enum(['critical', 'important', 'nice-to-have']).catch('important'),
    estimatedHours: z.number().min(1).max(200).catch(30),
    resources: z.array(z.object({
      name: z.string(),
      url: z.string(),
      type: z.enum(["course", "article", "project", "video", "documentation"]).catch("article")
    })).default([])
  })).default([]),
  marketInsights: z.object({
    demand: z.enum(["high", "medium", "low"]).catch("medium"),
    salaryRange: z.string(),
    outlook: z.string(),
    confidence: z.enum(["high", "medium", "low"]).catch("medium")
  }).optional(),
  interviewPrep: z.object({
    topQuestions: z.array(z.object({
      question: z.string(),
      reason: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      category: z.enum(["technical", "behavioral", "system-design"]).optional()
    }))
  }).optional(),
  resumeSuggestions: z.array(z.object({
    category: z.enum(["keyword", "experience", "structure"]).catch("keyword"),
    suggestion: z.string(),
    impact: z.enum(["high", "medium", "low"]).catch("medium")
  })).optional(),
  suggestedRoles: z.array(z.object({
    role: z.string(),
    matchPercentage: z.number().min(0).max(100).catch(0),
    keyMatchingSkills: z.array(z.string()).default([]),
    missingSkills: z.array(z.string()).default([]),
    reasoning: z.string().catch('')
  })).default([]),
  wasTruncated: z.boolean().optional()
});

import { CAREER_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';

export async function analyzeCareerPath(formData: FormData, jobRole: string, company: string): Promise<CareerAnalysisResult> {
  // Career analysis started
  try {
    const file = formData.get('file'); 
    
    if (!file || !(file instanceof File)) {
      console.error('❌ [Analyze] Valid file not found in FormData');
      throw new Error('No valid file uploaded');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const data = await pdf(buffer);
    const resumeText = data.text;
    const MAX_CHARS = 15000;
    const wasTruncated = resumeText.length > MAX_CHARS;
    const truncatedResume = resumeText.slice(0, MAX_CHARS);

    // Extract experience years from resume for salary scaling
    const experienceYears = estimateExperienceYears(resumeText);

    // Fetch salary data from local DB (instant)
    const salaryData = fetchSalaryEstimate(jobRole, experienceYears);
    const salaryDataStr = salaryData 
      ? `REAL SALARY DATA (${salaryData.source}, confidence: ${(salaryData as EnrichedSalaryData).confidence || 'medium'}): Min: ${salaryData.currency} ${salaryData.min}, Median: ${salaryData.currency} ${salaryData.median}, Max: ${salaryData.currency} ${salaryData.max}. ${experienceYears !== undefined ? `Candidate has ~${experienceYears} years experience.` : ''}`
      : '';

    const systemPrompt = CAREER_ANALYSIS_SYSTEM_PROMPT(jobRole, company, salaryDataStr);

    let content: string | null = null;
    let providerUsed = "";

    // --- Use Groq for analysis ---
    try {
        const groqApiKey = getNextKey("GROQ_API_KEY");
        
        if (!groqApiKey) throw new Error("No Groq API Keys available");

        const groq = new Groq({ apiKey: groqApiKey });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the candidate's resume text:\n\n${sanitizePromptInput(truncatedResume, 15000)}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
        });
        content = completion.choices[0]?.message?.content;
        providerUsed = "Groq";

    } catch (groqError: unknown) {
        const msg = groqError instanceof Error ? groqError.message : String(groqError);
        console.error(`🔥 [Analyze] Groq Failed: ${msg}`);
        throw new Error(`AI analysis failed: ${msg}`);
    }


    
    if (!content) {
        throw new Error("Empty response from all AI providers");
    }

    const rawResult = JSON.parse(content);
    // Validate with Zod using safeParse
    const parseResult = AnalysisSchema.safeParse(rawResult);
    
    if (!parseResult.success) {
        // Safely log Zod errors — do NOT pass the ZodError object directly to console.error
        // as Node's util.inspect crashes on its internal proxy properties.
        console.error('❌ [Analyze] Zod Validation Failed:', JSON.stringify(parseResult.error.issues, null, 2));
        
        // Attempt a lenient fallback: use Zod's .catch() defaults for individual fields
        console.warn('⚠️ [Analyze] Attempting lenient fallback parse...');

        interface RawSkill { name?: string; category?: string }
        interface RawGap { skill?: string; category?: string; importance?: string; recommendedQuiz?: string | null }
        interface RawResource { name?: string; url?: string; type?: string }
        interface RawStep { title?: string; description?: string; duration?: string; milestone?: string; priority?: string; estimatedHours?: number; resources?: RawResource[] }

        const fallback: CareerAnalysisResult = {
            jobRole,
            company,
            matchScore: typeof rawResult.matchScore === 'number' ? rawResult.matchScore : 0,
            extractedSkills: Array.isArray(rawResult.extractedSkills) ? rawResult.extractedSkills.map((s: RawSkill) => ({
                name: String(s?.name || ''),
                category: (['technical', 'soft', 'domain'].includes(s?.category ?? '') ? s!.category : 'technical') as Skill['category']
            })) : [],
            missingSkills: Array.isArray(rawResult.missingSkills) ? rawResult.missingSkills.map((s: RawGap) => ({
                skill: String(s?.skill || ''),
                category: (['technical', 'soft', 'domain'].includes(s?.category ?? '') ? s!.category : 'technical') as SkillGap['category'],
                importance: (['high', 'medium', 'low'].includes(s?.importance ?? '') ? s!.importance : 'medium') as SkillGap['importance'],
                recommendedQuiz: (s?.recommendedQuiz || undefined) as SkillGap['recommendedQuiz']
            })) : [],
            roadmap: Array.isArray(rawResult.roadmap) ? rawResult.roadmap.map((r: RawStep) => ({
                title: String(r?.title || ''),
                description: String(r?.description || ''),
                duration: String(r?.duration || ''),
                milestone: String(r?.milestone || 'Complete phase objectives'),
                priority: (['critical', 'important', 'nice-to-have'].includes(r?.priority ?? '') ? r!.priority : 'important') as LearningStep['priority'],
                estimatedHours: typeof r?.estimatedHours === 'number' ? r.estimatedHours : 30,
                resources: Array.isArray(r?.resources) ? r.resources.map((res: RawResource) => ({
                    name: String(res?.name || 'Unknown Resource'),
                    url: String(res?.url || '#'),
                    type: (['course', 'article', 'project', 'video', 'documentation'].includes(res?.type ?? '') ? res!.type : 'article') as LearningStep['resources'][number]['type']
                })) : []
            })) : [],
            marketInsights: rawResult.marketInsights ? {
                ...rawResult.marketInsights,
                confidence: (salaryData as EnrichedSalaryData)?.confidence || rawResult.marketInsights?.confidence || 'medium',
            } : undefined,
            interviewPrep: rawResult.interviewPrep,
            resumeSuggestions: rawResult.resumeSuggestions,
            strengths: Array.isArray(rawResult.strengths) ? rawResult.strengths : [],
            competitiveEdge: typeof rawResult.competitiveEdge === 'string' ? rawResult.competitiveEdge : undefined,
            suggestedRoles: Array.isArray(rawResult.suggestedRoles) ? rawResult.suggestedRoles.map((r: { role?: string; matchPercentage?: number; keyMatchingSkills?: string[]; missingSkills?: string[]; reasoning?: string }) => ({
                role: String(r?.role || ''),
                matchPercentage: typeof r?.matchPercentage === 'number' ? r.matchPercentage : 0,
                keyMatchingSkills: Array.isArray(r?.keyMatchingSkills) ? r.keyMatchingSkills.map(String) : [],
                missingSkills: Array.isArray(r?.missingSkills) ? r.missingSkills.map(String) : [],
                reasoning: String(r?.reasoning || '')
            })) : [],
            wasTruncated,
        };

        return fallback;
    }
    
    const result = parseResult.data;

    // Zod has already validated and typed the data — map directly to the response type
    const finalResponse: CareerAnalysisResult = {
      jobRole,
      company,
      matchScore: result.matchScore,
      extractedSkills: result.extractedSkills,
      missingSkills: result.missingSkills.map(s => ({
        skill: s.skill,
        category: s.category,
        importance: s.importance,
        recommendedQuiz: s.recommendedQuiz ?? undefined
      })),
      roadmap: result.roadmap.map(r => ({
        title: r.title,
        description: r.description,
        duration: r.duration,
        milestone: r.milestone,
        priority: r.priority,
        estimatedHours: r.estimatedHours,
        resources: r.resources.map(res => ({
          name: res.name || 'Unknown Resource',
          url: res.url || '#',
          type: res.type
        }))
      })),
      marketInsights: result.marketInsights ? {
        ...result.marketInsights,
        confidence: (salaryData as EnrichedSalaryData)?.confidence || result.marketInsights.confidence || 'medium',
      } : undefined,
      interviewPrep: result.interviewPrep,
      resumeSuggestions: result.resumeSuggestions,
      strengths: result.strengths,
      competitiveEdge: result.competitiveEdge,
      suggestedRoles: result.suggestedRoles,
      wasTruncated: result.wasTruncated ?? wasTruncated,
    };

    return finalResponse;


  } catch (error: unknown) {
    // Safely log errors — avoid passing complex error objects to console.error
    // as Node's util.inspect can crash on certain object shapes (e.g., ZodError)
    const safeErrorString = error instanceof Error ? error.message : String(error);
    console.error('🔥 [Analyze] Critical Error:', safeErrorString);
    
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === "string") {
        errorMessage = error;
    } else {
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = "Unserializable error object";
        }
    }

    // Log extended details if available (safely)
    if (error && typeof error === 'object' && 'response' in error) {
        const errWithResponse = error as { response?: { data?: unknown } };
        if (errWithResponse.response?.data) {
             console.error('🔥 [Analyze] API Error Details:', errWithResponse.response.data);
        }
    }
    
    throw new Error(`Failed to analyze career path: ${errorMessage}`);
  }
}
