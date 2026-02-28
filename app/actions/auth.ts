"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateNickname } from "@/utils/moderation";
import { logger } from "@/lib/logger";

import { z } from "zod";

const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(20, "Nickname must be at most 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Nickname can only contain letters, numbers, and underscores"),
});

export async function signup(formData: { email: string; password: string; nickname: string }) {
  const result = signupSchema.safeParse(formData);

  if (!result.success) {
    logger.warn("Signup validation failed", result.error.errors[0].message);
    return { error: result.error.errors[0].message };
  }

  const { email, password, nickname } = result.data;
  const supabase = createClient();

  const validation = validateNickname(nickname);
  if (!validation.success) {
    return { error: validation.error };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: nickname,
      },
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  });

  if (error) {
    logger.error("Supabase signup error", error.message);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(formData: { email: string; password: string }) {
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    logger.warn("Login validation failed", result.error.errors[0].message);
    return { error: result.error.errors[0].message };
  }

  const { email, password } = result.data;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn("Supabase login error", error.message);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signInWithSocial(provider: 'google' | 'github') {
  const supabase = createClient();
  const redirectUrl = `${getURL()}auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    logger.error("OAuth error", error.message);
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch profile to get nickname
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, role, avatar_icon')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    nickname: profile?.nickname || user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.nickname || user.email?.split('@')[0],
    role: profile?.role || 'user',
    avatar_icon: profile?.avatar_icon,
  };
}
