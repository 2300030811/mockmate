"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateNickname } from "@/utils/moderation";

export async function signup(formData: { email: string; password: string; nickname: string }) {
  const { email, password, nickname } = formData;

  const validation = validateNickname(nickname);
  if (!validation.success) {
    return { error: validation.error };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname: nickname,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function login(formData: { email: string; password: string }) {
  const { email, password } = formData;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signInWithSocial(provider: 'google' | 'github') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function logout() {
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch profile to get nickname
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    nickname: profile?.nickname || user.user_metadata?.nickname || user.email?.split('@')[0],
  };
}
