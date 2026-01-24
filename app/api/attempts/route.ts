import { NextResponse } from "next/server";
import { getContainer } from "@/utils/azureStorage";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Safely get container (might throw if env is missing)
    let container;
    try {
        container = getContainer("attempts");
    } catch (e: any) {
        // If env is missing (build time), just simulate success or error
        console.warn("Skipping Azure upload (Env missing?)");
        return NextResponse.json({ success: false, error: "Azure configuration missing" }, { status: 500 });
    }

    const filename = `attempt_${Date.now()}.json`;

    const blob = container.getBlockBlobClient(filename);
    await blob.upload(JSON.stringify(body), JSON.stringify(body).length);

    return NextResponse.json({ success: true });
  } catch (error: any) {
      console.error("Failed to save attempt:", error);
      return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
