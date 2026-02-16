"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { validateNickname } from "@/utils/moderation";

const profileSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(20, "Nickname must be at most 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Nickname can only contain letters, numbers, and underscores"),
});

export type ProfileState = {
  message?: string;
  error?: string;
  success?: boolean;
};

export async function updateProfile(prevState: ProfileState, formData: FormData): Promise<ProfileState> {
  const nickname = formData.get("nickname") as string;

  const result = profileSchema.safeParse({ nickname });

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
    return { error: "Not user found" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nickname: result.data.nickname })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Profile updated successfully" };
}
