import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { runOutlookPlacementSync } from "@/lib/services/outlook-sync-orchestrator";

export const dynamic = "force-dynamic";

/**
 * Polling fallback cron endpoint for Placement Hub Outlook sync.
 * Protected by CRON_SECRET authorization header.
 */
export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const adminDb = createAdminClient();
    const result = await runOutlookPlacementSync(adminDb);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
