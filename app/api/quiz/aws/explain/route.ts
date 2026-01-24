import { NextResponse } from "next/server";
import { getExplanation } from "@/utils/openaiSimple";

export async function POST(req: Request) {
  const { question, options, answer } = await req.json();

  const prompt = `
Question:
${question}

Options:
${options.join(", ")}

Correct Answer:
${answer}

Explain why this answer is correct for an AWS certification exam.
`;

  const explanation = await getExplanation(prompt);

  return NextResponse.json({ explanation });
}
