import { SupabaseClient } from "@supabase/supabase-js";
import { requireSingle, throwIfError } from "./base";

export interface ProfileUpdateData {
  nickname?: string;
  avatar_icon?: string;
  deleted_at?: string | null;
}

export interface ProfileStatsData {
  xp: number;
  level: number;
  streak: number;
  elo: number;
  last_activity_at?: string;
  streak_updated_at?: string;
}

export const profileRepository = {
  async getProfile(db: SupabaseClient, userId: string): Promise<any> {
    const res = await db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return requireSingle(res) as any;
  },

  async getProfileFields(db: SupabaseClient, userId: string, selectFields: string): Promise<any> {
    const res = await db
      .from("profiles")
      .select(selectFields)
      .eq("id", userId)
      .single();
    return requireSingle(res) as any;
  },

  async updateProfile(db: SupabaseClient, userId: string, data: ProfileUpdateData) {
    const res = await db
      .from("profiles")
      .update(data)
      .eq("id", userId);
    return throwIfError(res);
  },

  async getStats(db: SupabaseClient, userId: string): Promise<any> {
    const res = await db
      .from("profiles")
      .select("xp, level, streak, elo, last_activity_at")
      .eq("id", userId)
      .single();
    return requireSingle(res) as any;
  },

  async updateStats(db: SupabaseClient, userId: string, stats: ProfileStatsData) {
    const res = await db
      .from("profiles")
      .update({
        xp: stats.xp,
        level: stats.level,
        streak: stats.streak,
        elo: stats.elo,
        last_activity_at: stats.last_activity_at || new Date().toISOString(),
        streak_updated_at: stats.streak_updated_at || new Date().toISOString(),
      })
      .eq("id", userId);
    return throwIfError(res);
  },

  async countProfiles(db: SupabaseClient) {
    const res = await db
      .from("profiles")
      .select("*", { count: "exact", head: true });
    
    if (res.error) {
      throw res.error;
    }
    return res.count || 0;
  },
};
