import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey.length < 20) {
      // In production, fail fast — silent degradation causes mysterious permission errors
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Admin operations require a valid service role key."
        );
      }

      console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Falling back to anonymous client. Some features may not work.");
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
