import { beforeAll, describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Load environment variables if available
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(".env.local");
  }
} catch {
  // Ignore in environments where .env.local is not present
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasLiveCredentials = Boolean(
  supabaseUrl &&
  anonKey &&
  serviceKey &&
  !supabaseUrl.includes("placeholder")
);

const integrationSuite = hasLiveCredentials ? describe : describe.skip;

integrationSuite("Placement Hub Live RLS & Security Integration", () => {
  let anonClient: SupabaseClient;
  let adminClient: SupabaseClient;

  beforeAll(() => {
    anonClient = createClient(supabaseUrl!, anonKey!, { auth: { persistSession: false } });
    adminClient = createClient(supabaseUrl!, serviceKey!, { auth: { persistSession: false } });
  });

  describe("Anonymous User Access Boundaries", () => {
    it("allows reading public placement_drives", async () => {
      const { data, error } = await anonClient
        .from("placement_drives")
        .select("id, drive_name")
        .limit(3);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
    });

    it("allows reading public placement_companies", async () => {
      const { data, error } = await anonClient
        .from("placement_companies")
        .select("id, name")
        .limit(3);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
    });

    it("allows reading public placement_events", async () => {
      const { error } = await anonClient
        .from("placement_events")
        .select("id, title")
        .limit(3);

      expect(error).toBeNull();
    });

    it("allows reading verified public announcements view which excludes raw_body", async () => {
      const { data, error } = await anonClient
        .from("placement_announcements_public")
        .select("*")
        .limit(5);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        // Verify raw_body column does NOT exist in the view payload
        expect((data[0] as any).raw_body).toBeUndefined();
      }
    });

    it("prevents anonymous user from reading raw_body from base placement_announcements table", async () => {
      const { data } = await anonClient
        .from("placement_announcements")
        .select("id, raw_body")
        .limit(5);

      // Base table RLS returns 0 rows to unauthenticated/anon callers
      expect(data?.length ?? 0).toBe(0);
    });

    it("blocks unauthorized anonymous INSERT into placement_drives", async () => {
      const { error } = await anonClient.from("placement_drives").insert({
        drive_name: "Hacker Attempt Drive",
        academic_year_id: "00000000-0000-0000-0000-000000000000",
        company_id: "00000000-0000-0000-0000-000000000000",
      });

      // Must be rejected by Postgres RLS policy
      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/violates row-level security/i);
    });

    it("prevents anonymous users from reading any student applications", async () => {
      const { data, error } = await anonClient
        .from("placement_applications")
        .select("*");

      expect(error).toBeNull();
      // Returns empty array because auth.uid() is null for anonymous requests
      expect(data?.length ?? 0).toBe(0);
    });
  });

  describe("Service Role / Admin Capabilities", () => {
    it("allows service role to query drives", async () => {
      const { data, error } = await adminClient
        .from("placement_drives")
        .select("id")
        .limit(1);

      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });

    it("allows service role to access base placement_announcements", async () => {
      const { error } = await adminClient
        .from("placement_announcements")
        .select("id, raw_body")
        .limit(1);

      expect(error).toBeNull();
    });
  });
});
