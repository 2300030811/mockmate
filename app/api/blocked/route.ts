import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "We love that you want to keep trying us out! Feel free to clone this repository in Vercel and continue using it yourself.",
    },
    { status: 429 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "We love that you want to keep trying us out! Feel free to clone this repository in Vercel and continue using it yourself.",
    },
    { status: 429 }
  );
}
