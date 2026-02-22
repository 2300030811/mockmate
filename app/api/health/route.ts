import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring and deployment verification.
 * Returns the application status, version, and uptime.
 *
 * GET /api/health
 */

const startTime = Date.now();

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || "0.1.0",
      environment: process.env.NODE_ENV || "development",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
