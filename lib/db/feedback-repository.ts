import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError } from "./base";

export interface FeedbackData {
  type: "bug" | "suggestion" | "other";
  message: string;
  email: string | null;
  sessionId: string;
  userId: string | null;
}

export const feedbackRepository = {
  async insertFeedback(db: SupabaseClient, data: FeedbackData) {
    const res = await db.from("feedback").insert({
      type: data.type,
      message: data.message,
      email: data.email,
      session_id: data.sessionId,
      user_id: data.userId,
    });
    return throwIfError(res);
  },
};
