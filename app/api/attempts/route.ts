import { NextResponse } from "next/server";
import { getContainer } from "@/utils/azureStorage";

export async function POST(req: Request) {
  const body = await req.json();
  const container = getContainer("attempts");

  const filename = `attempt_${Date.now()}.json`;

  const blob = container.getBlockBlobClient(filename);
  await blob.upload(JSON.stringify(body), JSON.stringify(body).length);

  return NextResponse.json({ success: true });
}
