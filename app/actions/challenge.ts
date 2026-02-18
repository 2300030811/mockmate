"use server";

import { Groq } from "groq-sdk";
import { getNextKey } from "@/utils/keyManager";
import { revalidatePath } from "next/cache";

export async function getBobChallengeHint(problemTitle: string, userCode: string, language: string) {
  try {
     const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
     if(!apiKey) throw new Error("Groq API Service configuration missing.");

     const groq = new Groq({ apiKey });

     const prompt = `
        You are Bob, a senior software engineer mentoring a junior. 
        They are stuck on the problem "${problemTitle}".
        
        Current Code (${language}):
        ${userCode}

        Task:
        Provide a helpful, encouraging hint. 
        - Do NOT give the full solution.
        - Point out logic errors or edge cases.
        - Use a friendly, slightly witty tone.
        - Keep it brief (2-3 sentences max).
     `;

     const chatCompletion = await groq.chat.completions.create({
       messages: [{ role: "user", content: prompt }],
       model: "llama-3.1-8b-instant", // Smaller model for simple hints
       temperature: 0.7,
       max_tokens: 200,
     });

     return { markdown: chatCompletion.choices[0]?.message?.content || "Bob is thinking..." };
  } catch (error) {
     console.error("Hint Error (Groq):", error);
     return { markdown: "Bob is currently compiling his thoughts... (Service Unavailable)" };
  }
}

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";

export async function submitChallenge(problemTitle: string, code: string, language: string, output: string) {
    try {
        const apiKey = getNextKey("GROQ_API_KEY") || process.env.GROQ_API_KEY;
        if(!apiKey) throw new Error("Groq API Service configuration missing.");

        const groq = new Groq({ apiKey });

        const prompt = `
            You are an automated code judge.
            Problem: "${problemTitle}"
            User Code:
            \`\`\`${language}
            ${code}
            \`\`\`
            Execution Output:
            ${output}

            Evaluate the solution based on:
            1. Correctness (Does it solve the problem? Strict check.)
            2. Efficiency (Big O time/space)
            3. Code Style (Cleanliness)

            Return a JSON object:
            {
               "success": boolean,
               "score": number (0-100),
               "efficiency": string (e.g., "O(n)"),
               "feedback": string (One sentence summary)
            }
            ONLY RETURN JSON.
        `;

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 500,
        });

        const text = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            // Server-Side Persistence for Daily Streak
            if (result.success) {
                const supabase = createClient();
                const adminDb = createAdminClient();
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                     const todayStart = new Date();
                     todayStart.setHours(0,0,0,0);
                     
                     const { data: existing } = await adminDb
                        .from('quiz_results')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('category', 'daily-challenge')
                        .gte('completed_at', todayStart.toISOString())
                        .maybeSingle();
                        
                     if (!existing) {
                         const problem = DAILY_PROBLEMS.find(p => p.title === problemTitle);
                         const points = problem ? problem.points : 10;

                         // Fetch nickname required by DB constraint
                         const { data: profile } = await adminDb
                            .from('profiles')
                            .select('nickname')
                            .eq('id', user.id)
                            .single();
                        
                         const userNickname = profile?.nickname || 'User';

                         const { error: insertError } = await adminDb.from('quiz_results').insert({
                             nickname: userNickname,
                             user_id: user.id,
                             session_id: 'server-action', 
                             category: 'daily-challenge',
                             score: points, 
                             total_questions: points,
                             completed_at: new Date().toISOString()
                         });

                         if (insertError) {
                             console.error("❌ Failed to insert challenge result:", insertError);
                         } else {
                             revalidatePath('/dashboard');
                             revalidatePath('/'); 
                         }
                     }
                }
            }
            return result;
        }
        throw new Error("Invalid JSON from Groq");
    } catch (error) {
        console.error("Submission Error (Groq):", error);
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
    
    if (!user) return { streak: 0, points: 0, solvedToday: false };
    
    // Fetch all daily challenge results for this user
    const { data: results } = await adminDb
        .from('quiz_results')
        .select('completed_at, score')
        .eq('user_id', user.id)
        .eq('category', 'daily-challenge')
        .order('completed_at', { ascending: false });
        
    if (!results || results.length === 0) return { streak: 0, points: 0, solvedToday: false };
    
    // Calculate Streak
    let streak = 0;
    const points = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Solved Today?
    const lastSolved = new Date(results[0].completed_at);
    lastSolved.setHours(0,0,0,0);
    
    const solvedToday = lastSolved.getTime() === today.getTime();
    
    // Streak Logic (consecutive days)
    const uniqueDays = Array.from(new Set(results.map(r => {
        const d = new Date(r.completed_at);
        d.setHours(0,0,0,0);
        return d.getTime();
    }))).sort((a, b) => b - a);
    
    if (uniqueDays.length > 0) {
        const mostRecent = uniqueDays[0];
        const diffDays = (today.getTime() - mostRecent) / (1000 * 3600 * 24);
        
        if (diffDays <= 1) {
             streak = 1;
             for (let i = 0; i < uniqueDays.length - 1; i++) {
                 const current = uniqueDays[i];
                 const next = uniqueDays[i+1];
                 const dayDiff = (current - next) / (1000 * 3600 * 24);
                 
                 if (dayDiff === 1) {
                     streak++;
                 } else {
                     break;
                 }
             }
        }
    }
    
    return { streak, points, solvedToday };
}

export async function syncDailyChallenge(points: number) {
    const supabase = createClient();
    const adminDb = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false };
    
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    // Check if record exists
    const { data: existing } = await adminDb
       .from('quiz_results')
       .select('id')
       .eq('user_id', user.id)
       .eq('category', 'daily-challenge')
       .gte('completed_at', todayStart.toISOString())
       .maybeSingle();
       
    if (!existing) {
        // Fetch nickname required by DB constraint
        const { data: profile } = await adminDb
            .from('profiles')
            .select('nickname')
            .eq('id', user.id)
            .single();

        const userNickname = profile?.nickname || 'User';

        console.log(`[Sync] Restoring missing daily challenge for user ${user.id}`);
        const { error } = await adminDb.from('quiz_results').insert({
            user_id: user.id,
            nickname: userNickname,
            session_id: 'sync-action', 
            category: 'daily-challenge',
            score: points, 
            total_questions: points,
            completed_at: new Date().toISOString()
        });

        if (error) {
            console.error("[Sync] Failed to restore challenge:", error);
            // Return stringified error for visibility in client console
            return { success: false, errorMessage: error.message || JSON.stringify(error) };
        }
        
        revalidatePath('/dashboard');
        revalidatePath('/');
    }
    
    return { success: true };
}

