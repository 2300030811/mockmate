import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError, requireSingle } from "./base";

export const systemDesignRepository = {
  async saveDesign(db: SupabaseClient, design: any) {
    if (design.id) {
      const res = await db
        .from("system_designs")
        .update(design)
        .eq("id", design.id)
        .select()
        .single();
      return requireSingle(res);
    } else {
      const res = await db
        .from("system_designs")
        .insert(design)
        .select()
        .single();
      return requireSingle(res);
    }
  },

  async getDesigns(db: SupabaseClient) {
    const res = await db
      .from("system_designs")
      .select("*")
      .order("updated_at", { ascending: false });
    return throwIfError(res);
  },

  async getDesignById(db: SupabaseClient, id: string) {
    const res = await db
      .from("system_designs")
      .select("*")
      .eq("id", id)
      .single();
    return requireSingle(res);
  },

  async deleteDesign(db: SupabaseClient, id: string) {
    const res = await db
      .from("system_designs")
      .delete()
      .eq("id", id);
    return throwIfError(res);
  },
};
