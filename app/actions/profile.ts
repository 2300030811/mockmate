"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NICKNAME_REGEX, NICKNAME_REGEX_MESSAGE } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { profileService } from "@/lib/services/profile-service";

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

  try {
    await profileService.updateProfile(supabase, user.id, {
      nickname: result.data.nickname,
      avatar_icon: result.data.avatar_icon,
    });
  } catch (error: any) {
    return { error: error.message || "Failed to update profile" };
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

  try {
    const data = await profileService.exportUserData(supabase, user.id);
    return {
      success: true,
      data,
    };
  } catch (err: any) {
    return { error: err.message || "Failed to export user data" };
  }
}
