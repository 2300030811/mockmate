import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey.length < 20) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Admin operations require a valid service role key."
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
