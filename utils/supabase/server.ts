import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Return a mock-like client or handle missing config gracefully
    // to prevent crashing the server startup/render.
    // Most actions already check for 'if (!supabase) return null' or similar
    // but createServerClient will throw if these are empty strings.
    return createServerClient(
      "https://placeholder.supabase.co",
      "placeholder",
      {
        cookies: {
          getAll() { return [] },
          setAll() {}
        }
      }
    )
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: options?.signal ?? AbortSignal.timeout(15_000), // 15s timeout
          });
        },
      },
    }
  )
}
