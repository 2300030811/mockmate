import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError, requireSingle, maybeSingle } from "./base";

export const careerOpsRepository = {
  async getFollowUpCount(db: SupabaseClient, userId: string, applicationId: string) {
    const res = await db
      .from("career_ops_follow_ups")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("application_id", applicationId);
    
    if (res.error) throw res.error;
    return res.count ?? 0;
  },

  async insertStatusEvent(db: SupabaseClient, data: {
    applicationId: string;
    userId: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
  }) {
    const res = await db.from("career_ops_application_events").insert({
      application_id: data.applicationId,
      user_id: data.userId,
      from_status: data.fromStatus,
      to_status: data.toStatus,
      note: data.note,
    });
    return throwIfError(res);
  },

  async createApplication(db: SupabaseClient, payload: any) {
    const res = await db
      .from("career_ops_applications")
      .insert(payload)
      .select("id, user_id, job_role, company, status, match_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags")
      .single();
    return requireSingle(res);
  },

  async findDuplicate(db: SupabaseClient, userId: string, jobRole: string, company: string) {
    const res = await db
      .from("career_ops_applications")
      .select("id, user_id, job_role, company, status, match_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags, created_at")
      .eq("user_id", userId)
      .eq("job_role", jobRole)
      .eq("company", company)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return maybeSingle(res);
  },

  async getApplicationFields(db: SupabaseClient, id: string, userId: string, selectFields: string) {
    const res = await db
      .from("career_ops_applications")
      .select(selectFields)
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    return requireSingle(res);
  },

  async updateApplication(db: SupabaseClient, id: string, userId: string, updatePayload: any) {
    const res = await db
      .from("career_ops_applications")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, user_id, job_role, company, status, match_score, ats_score, next_follow_up_date, updated_at, applied_on, notes, role_archetype, target_level, primary_blocker, blocker_tags")
      .single();
    return requireSingle(res);
  },

  async updateApplicationNextFollowUpDate(db: SupabaseClient, id: string, userId: string, nextFollowUpDate: string | null) {
    const res = await db
      .from("career_ops_applications")
      .update({ next_follow_up_date: nextFollowUpDate })
      .eq("id", id)
      .eq("user_id", userId);
    return throwIfError(res);
  },

  async insertFollowUp(db: SupabaseClient, data: {
    applicationId: string;
    userId: string;
    channel: string;
    contactName: string | null;
    contactEmail: string | null;
    followedUpOn: string;
    notes: string | null;
  }) {
    const res = await db.from("career_ops_follow_ups").insert({
      application_id: data.applicationId,
      user_id: data.userId,
      channel: data.channel,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      followed_up_on: data.followedUpOn,
      notes: data.notes,
    });
    return throwIfError(res);
  },

  async getTrackerData(db: SupabaseClient, userId: string, limit = 200) {
    const res = await db
      .from("career_ops_applications")
      .select("id, job_role, company, status, match_score, next_follow_up_date, updated_at, applied_on, role_archetype, target_level, primary_blocker, blocker_tags")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    return throwIfError(res);
  },

  async getRecentFollowUps(db: SupabaseClient, userId: string, limit = 5) {
    const res = await db
      .from("career_ops_follow_ups")
      .select("id, application_id, followed_up_on, channel, career_ops_applications!inner(job_role, company, status)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return throwIfError(res);
  },

  async getApplicationsForCadenceRecompute(db: SupabaseClient, userId: string, activeStatuses: string[], limit: number) {
    const res = await db
      .from("career_ops_applications")
      .select("id, user_id, status, next_follow_up_date, applied_on")
      .eq("user_id", userId)
      .in("status", activeStatuses)
      .order("updated_at", { ascending: false })
      .limit(limit);
    return throwIfError(res);
  },

  async getFollowUpsForApplications(db: SupabaseClient, userId: string, applicationIds: string[]) {
    const res = await db
      .from("career_ops_follow_ups")
      .select("application_id, followed_up_on")
      .eq("user_id", userId)
      .in("application_id", applicationIds)
      .order("followed_up_on", { ascending: false });
    return throwIfError(res);
  },
};
