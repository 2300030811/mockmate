import { SupabaseClient } from "@supabase/supabase-js";
import { throwIfError, maybeSingle } from "./base";
import {
  PlacementHistoryRecord,
  PlacementHistoryFilter,
  PlacementHistorySummary,
} from "@/types/placements";

/**
 * Placement Hub data access layer.
 *
 * Follows the repository pattern used by career-ops-repository.ts:
 * - Methods accept a SupabaseClient (user-scoped or admin/service-role).
 * - Use throwIfError / maybeSingle from base.ts.
 * - Public queries on announcements deliberately omit raw_body.
 *
 * ponytail: normalized_name dedup is intentionally naive (lowercase + strip
 * non-alphanumeric). Entity resolution for fuzzy company matches (e.g.
 * "HCL Tech" vs "HCL Technologies") is deferred to the ingestion layer
 * in a future milestone.
 */
/**
 * Asia/Kolkata timezone constants and conversion utilities.
 * KLU campus operations run on India Standard Time (IST, UTC+05:30).
 */
export const PLACEMENT_TIMEZONE = "Asia/Kolkata";

/**
 * Returns today's date in YYYY-MM-DD format according to Asia/Kolkata timezone.
 */
export function getTodayISTDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PLACEMENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Computes exact UTC ISO timestamps for the start and end of a given IST date string (YYYY-MM-DD).
 * IST is fixed at UTC+05:30 (no DST).
 */
export function getISTDayRange(dateStr: string): { startIso: string; endIso: string } {
  const start = new Date(`${dateStr}T00:00:00+05:30`);
  const end = new Date(`${dateStr}T23:59:59.999+05:30`);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

/**
 * Computes exact UTC ISO timestamps for the upcoming period from the end of fromDateStr (IST)
 * through `days` future days.
 */
export function getISTUpcomingRange(fromDateStr: string, days: number): { startIso: string; endIso: string } {
  const currentEnd = new Date(`${fromDateStr}T23:59:59.999+05:30`);
  const targetDate = new Date(`${fromDateStr}T00:00:00+05:30`);
  targetDate.setDate(targetDate.getDate() + days);
  const targetDateStr = getTodayISTDate(targetDate);
  const futureEnd = new Date(`${targetDateStr}T23:59:59.999+05:30`);

  return {
    startIso: currentEnd.toISOString(),
    endIso: futureEnd.toISOString(),
  };
}

export const placementRepository = {
  // ── Today Engine ──

  async getTodayEvents(db: SupabaseClient, dateStr?: string) {
    const targetDate = dateStr ?? getTodayISTDate();
    const { startIso, endIso } = getISTDayRange(targetDate);

    const res = await db
      .from("placement_events")
      .select(
        `
        id, drive_id, event_type, title, start_time, end_time,
        venue, meeting_url, description,
        placement_drives!inner (
          id, drive_name, role_title, package_min_lpa, package_max_lpa,
          package_values, raw_package_text, drive_status, source_type,
          placement_companies!inner ( id, name, normalized_name, logo_url )
        )
      `
      )
      .gte("start_time", startIso)
      .lte("start_time", endIso)
      .order("start_time", { ascending: true });

    return throwIfError(res);
  },

  // ── Upcoming ──

  async getUpcomingEvents(
    db: SupabaseClient,
    fromDateStr?: string,
    days: number = 30
  ) {
    const fromDate = fromDateStr ?? getTodayISTDate();
    const { startIso, endIso } = getISTUpcomingRange(fromDate, days);

    const res = await db
      .from("placement_events")
      .select(
        `
        id, drive_id, event_type, title, start_time, end_time, venue,
        placement_drives!inner (
          id, drive_name, role_title, package_min_lpa, package_max_lpa,
          drive_status,
          placement_companies!inner ( id, name, logo_url )
        )
      `
      )
      .gt("start_time", startIso)
      .lte("start_time", endIso)
      .order("start_time", { ascending: true });

    return throwIfError(res);
  },

  // ── Deadlines ──

  async getUpcomingDeadlines(db: SupabaseClient, fromNow: string) {
    const res = await db
      .from("placement_events")
      .select(
        `
        id, drive_id, event_type, title, start_time, venue,
        placement_drives!inner (
          id, drive_name,
          placement_companies!inner ( id, name )
        )
      `
      )
      .eq("event_type", "REGISTRATION_DEADLINE")
      .gte("start_time", fromNow)
      .order("start_time", { ascending: true })
      .limit(20);

    return throwIfError(res);
  },

  // ── Drives ──

  async getDrives(
    db: SupabaseClient,
    filters?: {
      academicYearId?: string;
      companyId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    let query = db
      .from("placement_drives")
      .select(
        `
        id, drive_name, role_title, date_of_visit,
        package_min_lpa, package_max_lpa, package_values, raw_package_text,
        drive_status, source_type, created_at,
        placement_companies!inner ( id, name, logo_url ),
        placement_academic_years!inner ( year_label )
      `
      )
      .order("date_of_visit", { ascending: false, nullsFirst: false });

    if (filters?.academicYearId)
      query = query.eq("academic_year_id", filters.academicYearId);
    if (filters?.companyId)
      query = query.eq("company_id", filters.companyId);
    if (filters?.status) query = query.eq("drive_status", filters.status);

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    return throwIfError(await query);
  },

  async getDriveById(db: SupabaseClient, driveId: string) {
    const res = await db
      .from("placement_drives")
      .select(
        `
        *,
        placement_companies!inner (
          id, name, normalized_name, industry, website, logo_url
        ),
        placement_academic_years!inner ( year_label ),
        placement_events (
          id, event_type, title, start_time, end_time,
          venue, meeting_url, description
        )
      `
      )
      .eq("id", driveId)
      .single();

    return maybeSingle(res);
  },

  // ── Academic Years ──

  async getAcademicYears(db: SupabaseClient) {
    const res = await db
      .from("placement_academic_years")
      .select("id, year_label, is_current, created_at")
      .order("year_label", { ascending: false });

    return throwIfError(res);
  },

  // ── Companies ──

  async getCompanies(db: SupabaseClient, search?: string) {
    let query = db
      .from("placement_companies")
      .select("id, name, normalized_name, industry, logo_url")
      .order("name", { ascending: true });

    if (search) query = query.ilike("name", `%${search}%`);

    return throwIfError(await query);
  },

  async upsertCompany(
    db: SupabaseClient,
    name: string
  ): Promise<string> {
    // ponytail: naive normalization — strips non-alphanumeric, lowercases.
    // Sufficient for exact-match dedup. Fuzzy entity resolution (e.g.
    // "HCL Tech" vs "HCL Technologies") belongs in the ingestion layer.
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const existing = await db
      .from("placement_companies")
      .select("id")
      .eq("normalized_name", normalized)
      .maybeSingle();

    if (existing.data) return existing.data.id;

    const res = await db
      .from("placement_companies")
      .insert({ name, normalized_name: normalized })
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id;
  },

  // ── Announcements (public: safe view only) ──

  async getRecentAnnouncements(
    db: SupabaseClient,
    limit: number = 10
  ) {
    // Queries the public-safe database view which excludes raw_body at the database level.
    const res = await db
      .from("placement_announcements_public")
      .select(
        "id, drive_id, source, subject, importance, received_at, verified, created_at"
      )
      .order("received_at", { ascending: false })
      .limit(limit);

    return throwIfError(res);
  },

  // ── Write operations (seed script + future ingestion) ──

  async upsertAcademicYear(
    db: SupabaseClient,
    yearLabel: string,
    isCurrent: boolean
  ) {
    const res = await db
      .from("placement_academic_years")
      .upsert(
        { year_label: yearLabel, is_current: isCurrent },
        { onConflict: "year_label" }
      )
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id as string;
  },

  async upsertDrive(
    db: SupabaseClient,
    payload: Record<string, unknown>
  ) {
    const res = await db
      .from("placement_drives")
      .upsert(payload, {
        onConflict: "academic_year_id,company_id,date_of_visit,drive_name",
      })
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id as string;
  },

  async insertAcademicYear(
    db: SupabaseClient,
    yearLabel: string,
    isCurrent: boolean
  ) {
    const res = await db
      .from("placement_academic_years")
      .insert({ year_label: yearLabel, is_current: isCurrent })
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id as string;
  },

  async insertDrive(
    db: SupabaseClient,
    payload: Record<string, unknown>
  ) {
    const res = await db
      .from("placement_drives")
      .insert(payload)
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id as string;
  },

  async insertEvent(
    db: SupabaseClient,
    payload: Record<string, unknown>
  ) {
    const res = await db
      .from("placement_events")
      .insert(payload)
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id as string;
  },

  async insertAnnouncement(
    db: SupabaseClient,
    payload: Record<string, unknown>
  ) {
    const res = await db
      .from("placement_announcements")
      .insert(payload)
      .select("id")
      .single();

    if (res.error) throw res.error;
    return res.data.id as string;
  },

  // ── Student Applications (auth-gated by RLS) ──

  async getUserApplications(db: SupabaseClient, userId: string) {
    const res = await db
      .from("placement_applications")
      .select(
        `
        id, drive_id, status, applied_at, notes, updated_at,
        placement_drives!inner (
          drive_name, role_title,
          placement_companies!inner ( name )
        )
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    return throwIfError(res);
  },

  async applyToDrive(
    db: SupabaseClient,
    userId: string,
    driveId: string
  ) {
    const res = await db
      .from("placement_applications")
      .insert({
        user_id: userId,
        drive_id: driveId,
        status: "applied",
        applied_at: new Date().toISOString(),
      })
      .select("id, status")
      .single();

    if (res.error) throw res.error;
    return res.data;
  },

  // ── Announcement dedup ──

  async findAnnouncementByHash(db: SupabaseClient, hash: string) {
    const res = await db
      .from("placement_announcements")
      .select("id")
      .eq("content_hash", hash)
      .maybeSingle();

    return maybeSingle(res);
  },

  // ── Historical Placement Records (2016-2026 Reference Dataset) ──

  async getPlacementHistory(
    db: SupabaseClient,
    filters?: PlacementHistoryFilter
  ): Promise<PlacementHistoryRecord[]> {
    let query = db
      .from("placement_history")
      .select("*")
      .order("academic_year", { ascending: false })
      .order("company_name", { ascending: true });

    if (filters?.department) {
      query = query.eq("department", filters.department);
    }
    if (filters?.academicYear) {
      query = query.eq("academic_year", filters.academicYear);
    }
    if (filters?.companyName) {
      query = query.ilike("company_name", `%${filters.companyName}%`);
    }
    if (filters?.companyId) {
      query = query.eq("company_id", filters.companyId);
    }
    if (filters?.qualityStatus) {
      query = query.contains("data_quality_status", [filters.qualityStatus]);
    }
    if (filters?.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const res = await query;
    return (throwIfError(res) as PlacementHistoryRecord[]) || [];
  },

  async getCompanyPlacementHistory(
    db: SupabaseClient,
    companyId?: string,
    companyName?: string
  ): Promise<PlacementHistoryRecord[]> {
    if (!companyId && !companyName) return [];

    let query = db
      .from("placement_history")
      .select("*")
      .order("academic_year", { ascending: false });

    if (companyId && companyName) {
      query = query.or(
        `company_id.eq.${companyId},company_name.ilike.%${companyName}%`
      );
    } else if (companyId) {
      query = query.eq("company_id", companyId);
    } else if (companyName) {
      query = query.ilike("company_name", `%${companyName}%`);
    }

    const res = await query;
    return (throwIfError(res) as PlacementHistoryRecord[]) || [];
  },

  async getPlacementHistorySummary(
    db: SupabaseClient
  ): Promise<PlacementHistorySummary> {
    const { count } = await db
      .from("placement_history")
      .select("*", { count: "exact", head: true });

    // Paginate to fetch all rows beyond 1,000-row PostgREST server limit
    const pageSize = 1000;
    let allRows: any[] = [];
    let from = 0;

    while (true) {
      const res = await db
        .from("placement_history")
        .select("department, academic_year, company_name, data_quality_status")
        .range(from, from + pageSize - 1);

      const rows = throwIfError(res) || [];
      allRows = allRows.concat(rows);
      if (rows.length < pageSize) break;
      from += pageSize;
    }

    let ece = 0;
    let cse = 0;
    const years = new Set<string>();
    const companies = new Set<string>();
    let qualityIssues = 0;

    for (const r of allRows) {
      if (r.department === "ECE") ece++;
      if (r.department === "CSE") cse++;
      if (r.academic_year) years.add(r.academic_year);
      if (r.company_name) companies.add(r.company_name);

      const statuses: string[] = r.data_quality_status || [];
      if (!statuses.includes("clean")) {
        qualityIssues++;
      }
    }

    return {
      totalRecords: count ?? allRows.length,
      recordsByDepartment: { ECE: ece, CSE: cse },
      academicYears: Array.from(years).sort().reverse(),
      totalUniqueCompanies: companies.size,
      qualityIssuesCount: qualityIssues,
    };
  },
};
