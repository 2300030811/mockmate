"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { validateNickname } from "@/utils/moderation";
import { NICKNAME_REGEX, NICKNAME_REGEX_MESSAGE } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

const profileSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(20, "Nickname must be at most 20 characters").regex(NICKNAME_REGEX, NICKNAME_REGEX_MESSAGE),
  avatar_icon: z.string().min(1, "Icon is required").default("User"),
});

export type ProfileState = {
  message?: string;
  error?: string;
  success?: boolean;
};

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const nickname = formData.get("nickname") as string;
  const avatar_icon = formData.get("avatar_icon") as string;

  const result = profileSchema.safeParse({ nickname, avatar_icon });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const validation = validateNickname(nickname);
  if (!validation.success) {
      return { error: validation.error };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No user found" };
  }

  // Rate limit: profile updates (default tier)
  const rl = await rateLimit("default", user.id);
  if (!rl.success) {
    return { error: "Too many update attempts. Please wait a moment." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      nickname: result.data.nickname,
      avatar_icon: result.data.avatar_icon 
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  
  return { success: true, message: "Profile updated successfully" };
}

/**
 * Export all user data as a JSON object (GDPR compliance).
 */
export async function exportUserData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const [profileResult, quizResultsResult, careerPathsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false }),
    supabase
      .from("career_paths")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    success: true,
    data: {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profileResult.data,
      quizResults: quizResultsResult.data || [],
      careerPaths: careerPathsResult.data || [],
    },
  };
}
