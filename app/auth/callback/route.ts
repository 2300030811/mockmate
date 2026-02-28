import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function resolveOrigin(request: Request, fallbackOrigin: string): string {
  if (process.env.NODE_ENV === "development") return fallbackOrigin;
  const forwarded = request.headers.get("x-forwarded-host");
  return forwarded ? `https://${forwarded}` : fallbackOrigin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const base = resolveOrigin(request, origin);
      const isEmailVerification = data.user?.app_metadata?.provider === "email";
      const path = isEmailVerification ? "/login?verified=true" : next;
      return NextResponse.redirect(`${base}${path}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
