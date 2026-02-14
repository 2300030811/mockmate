import { createClient } from '@/utils/supabase/client';

/**
 * Supabase client for Client Components.
 * For Server Components/Actions, use @/utils/supabase/server instead.
 */
export const supabase = createClient();
