'use server';

import { CareerAnalysisResult, Skill, SkillGap, LearningStep } from '@/types/career';
import Groq from 'groq-sdk';
import pdf from 'pdf-parse';
import { env } from '@/lib/env'; 
import { z } from 'zod';
import { sanitizePromptInput } from '@/utils/sanitize';
import { getNextKey } from '@/utils/keyManager';

// Zod schemas for AI response validation
const AnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100).default(0),
  extractedSkills: z.array(z.object({
    name: z.string(),
    category: z.enum(["technical", "soft", "domain"]).catch("technical") // robust fallback
  })).default([]),
  missingSkills: z.array(z.object({
    skill: z.string(),
    category: z.enum(["technical", "soft", "domain"]).catch("technical"),
    importance: z.enum(["high", "medium", "low"]).catch("medium"),
    recommendedQuiz: z.enum(["aws", "azure", "mongodb", "salesforce", "pcap", "java"]).nullable().optional()
  })).default([]),
  roadmap: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    resources: z.array(z.object({
      name: z.string(),
      url: z.string(),
      type: z.enum(["course", "article", "project"]).catch("article")
    })).default([])
  })).default([]),
  marketInsights: z.object({
    demand: z.enum(["high", "medium", "low"]).catch("medium"),
    salaryRange: z.string(),
    outlook: z.string()
  }).optional(),
  interviewPrep: z.object({
    topQuestions: z.array(z.object({
      question: z.string(),
      reason: z.string()
    }))
  }).optional(),
  resumeSuggestions: z.array(z.object({
    category: z.enum(["keyword", "experience", "structure"]).catch("keyword"),
    suggestion: z.string(),
    impact: z.enum(["high", "medium", "low"]).catch("medium")
  })).optional()
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

    const truncatedResume = resumeText.slice(0, 15000); 

    const systemPrompt = CAREER_ANALYSIS_SYSTEM_PROMPT(jobRole, company);

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
            temperature: 0.7,
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
        interface RawStep { title?: string; description?: string; duration?: string; resources?: RawResource[] }

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
                resources: Array.isArray(r?.resources) ? r.resources.map((res: RawResource) => ({
                    name: String(res?.name || 'Unknown Resource'),
                    url: String(res?.url || '#'),
                    type: (['course', 'article', 'project'].includes(res?.type ?? '') ? res!.type : 'article') as LearningStep['resources'][number]['type']
                })) : []
            })) : [],
            marketInsights: rawResult.marketInsights,
            interviewPrep: rawResult.interviewPrep,
            resumeSuggestions: rawResult.resumeSuggestions
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
        resources: r.resources.map(res => ({
          name: res.name || 'Unknown Resource',
          url: res.url || '#',
          type: res.type
        }))
      })),
      marketInsights: result.marketInsights,
      interviewPrep: result.interviewPrep,
      resumeSuggestions: result.resumeSuggestions
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
