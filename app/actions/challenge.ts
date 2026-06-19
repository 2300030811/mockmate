"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { challengeService } from "@/lib/services/challenge-service";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";
import { sanitizePromptInput } from "@/utils/sanitize";
import { generateText, AI_MODELS } from "@/lib/ai/gateway";
import { logger } from "@/lib/logger";

export async function getBobChallengeHint(problemTitle: string, userCode: string, language: string) {
    try {
        // Rate limit hint requests
        const { success: withinLimit, message: limitMsg } = await rateLimit("challenge");
        if (!withinLimit) {
            return { markdown: limitMsg || "Bob needs a breather! You've asked too many questions. Try again in a few minutes." };
        }

        const problem = DAILY_PROBLEMS.find(p => p.title === problemTitle);
        if (!problem) {
            return { markdown: "I couldn't find that problem. Stop messing with the system!" };
        }

        const sanitizedCode = sanitizePromptInput(userCode, 10000);
        const prompt = `
        You are Bob, a senior software engineer mentoring a junior. 
        They are stuck on the problem "${sanitizePromptInput(problemTitle, 200)}".
        
        Current Code (${language}):
        <USER_CODE>${sanitizedCode}</USER_CODE>

        Task:
        Provide a helpful, encouraging hint. 
        - Do NOT give the full solution.
        - Point out logic errors or edge cases.
        - Use a friendly, slightly witty tone.
        - Keep it brief (2-3 sentences max).
     `;

        const result = await generateText(
            [{ role: "user", content: prompt }],
            "You are Bob, a senior software engineer mentoring a junior.",
            "auto",
            {
                model: AI_MODELS.FAST,
                temperature: 0.7,
                maxTokens: 200,
            }
        );

        return { markdown: result.content || "Bob is thinking..." };
    } catch (error) {
        logger.error("Hint Error (Gateway):", error);
        return { markdown: "Bob is currently compiling his thoughts... (Service Unavailable)" };
    }
}

export async function submitChallenge(problemTitle: string, code: string, language: string, output: string) {
    try {
        // Rate limit challenge submissions
        const { success: withinLimit, message: limitMsg } = await rateLimit("challenge");
        if (!withinLimit) {
            return {
                success: false,
                score: 0,
                efficiency: "N/A",
                feedback: limitMsg || "Bob's judging queue is full! Please wait a while before submitting again."
            };
        }

        const supabase = createClient();
        const adminDb = createAdminClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        const result = await challengeService.submitChallenge(
            supabase,
            adminDb,
            userId,
            problemTitle,
            code,
            language,
            output
        );

        if (result.success && userId) {
            revalidatePath('/dashboard');
            revalidatePath('/');
        }

        return result;
    } catch (error) {
        logger.error("Submission Error (Gateway):", error);
        return {
            success: false,
            score: 0,
            efficiency: "Unknown",
            feedback: "Submission system is currently offline. Please try again."
        };
    }
}

export async function getServerDailyStats() {
    const supabase = createClient();
    const adminDb = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { streak: 0, points: 0, solvedToday: false, xp: 0, level: 1, elo: 1000, streakMultiplier: 1.0 };

    try {
        return await challengeService.getServerDailyStats(adminDb, user.id);
    } catch (err) {
        logger.error("Failed to fetch daily stats:", err);
        return { streak: 0, points: 0, solvedToday: false, xp: 0, level: 1, elo: 1000, streakMultiplier: 1.0 };
    }
}

export async function syncDailyChallenge(points: number) {
    const supabase = createClient();
    const adminDb = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false };

    try {
        const result = await challengeService.syncDailyChallenge(supabase, adminDb, user.id, points);
        revalidatePath('/dashboard');
        revalidatePath('/');
        return result;
    } catch (err: any) {
        logger.error("syncDailyChallenge error:", err);
        return { success: false, errorMessage: err.message || "Unknown error" };
    }
}
