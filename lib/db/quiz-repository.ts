import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError, requireSingle, maybeSingle } from "./base";

export interface QuizResultData {
  session_id: string;
  user_id: string | null;
  category: string;
  score: number;
  total_questions: number;
  nickname: string;
  completed_at: string;
}

export const quizRepository = {
  async fetchQuestions(db: SupabaseClient, category: string) {
    const res = await db
      .from("quizzes")
      .select("questions")
      .eq("category", category)
      .single();
    return requireSingle(res);
  },

  async upsertQuiz(db: SupabaseClient, category: string, questions: any[]) {
    const res = await db
      .from("quizzes")
      .upsert({
        category,
        questions,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "category",
      });
    return throwIfError(res);
  },

  async getResultById(db: SupabaseClient, id: string) {
    const res = await db
      .from("quiz_results")
      .select("*")
      .eq("id", id)
      .single();
    return requireSingle(res);
  },

  async getRecentResults(db: SupabaseClient, userId: string | null, sessionId: string | null, limit = 10) {
    let query = db
      .from("quiz_results")
      .select("id, category, score, total_questions, completed_at, session_id, user_id")
      .order("completed_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const res = await query.limit(limit);
    return throwIfError(res);
  },

  async findDuplicateResult(db: SupabaseClient, data: {
    category: string;
    score: number;
    sinceDate: string;
    userId: string | null;
    sessionId: string;
    arenaStatus?: string;
  }) {
    let query = db
      .from("quiz_results")
      .select("id")
      .eq("category", data.category)
      .eq("score", data.score)
      .gt("completed_at", data.sinceDate);

    if (data.userId) {
      query = query.eq("user_id", data.userId);
    } else {
      query = query.eq("session_id", data.sessionId);
    }

    if (data.arenaStatus) {
      query = query.eq("session_id", data.sessionId);
    }

    const res = await query.order("completed_at", { ascending: false }).limit(1);
    const list = throwIfError(res);
    return list && list.length > 0 ? list[0] : null;
  },

  async saveResult(db: SupabaseClient, data: QuizResultData) {
    const res = await db
      .from("quiz_results")
      .insert(data);
    return throwIfError(res);
  },

  async updateNickname(db: SupabaseClient, id: string, nickname: string) {
    const res = await db
      .from("quiz_results")
      .update({ nickname })
      .eq("id", id);
    return throwIfError(res);
  },

  async deleteResult(db: SupabaseClient, id: string) {
    const res = await db
      .from("quiz_results")
      .delete()
      .eq("id", id);
    return throwIfError(res);
  },

  async checkDailyChallengeSolved(db: SupabaseClient, userId: string, sinceDate: string) {
    const res = await db
      .from("quiz_results")
      .select("id")
      .eq("user_id", userId)
      .eq("category", "daily-challenge")
      .gte("completed_at", sinceDate)
      .maybeSingle();
    return maybeSingle(res);
  },

  async getLatestDailyChallengeResult(db: SupabaseClient, userId: string) {
    const res = await db
      .from("quiz_results")
      .select("completed_at, score")
      .eq("user_id", userId)
      .eq("category", "daily-challenge")
      .order("completed_at", { ascending: false })
      .limit(1);
    return throwIfError(res);
  },

  async fetchLeaderboardRows(db: SupabaseClient, category: string, sinceDate?: string, limit = 100): Promise<any[]> {
    let query = db
      .from("quiz_results")
      .select("id, nickname, score, total_questions, completed_at")
      .eq("category", category)
      .not("nickname", "is", null)
      .neq("nickname", "")
      .neq("nickname", "Guest")
      .gt("score", 0);

    if (sinceDate) {
      query = query.gte("completed_at", sinceDate);
    }

    const res = await query
      .order("score", { ascending: false })
      .order("completed_at", { ascending: false })
      .limit(limit);
    
    return (throwIfError(res) || []) as any[];
  },

  async countResults(db: SupabaseClient) {
    const res = await db
      .from("quiz_results")
      .select("score, total_questions", { count: "exact" });
    
    const count = res.count || 0;
    const data = throwIfError(res);
    return { data, count };
  },

  async getAllQuizResults(db: SupabaseClient, limit = 50) {
    const res = await db
      .from("quiz_results")
      .select("id, user_id, nickname, category, score, total_questions, completed_at, session_id")
      .order("completed_at", { ascending: false })
      .limit(limit);
    return throwIfError(res);
  },

  async getQuizResultsPage(db: SupabaseClient, userId: string, offset: number, limit: number) {
    const res = await db
      .from("quiz_results")
      .select("id, category, score, total_questions, completed_at", { count: "exact" })
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    const count = res.count || 0;
    const data = throwIfError(res);
    return { items: data, count };
  },
};
