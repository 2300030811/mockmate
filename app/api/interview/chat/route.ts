import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize lazily to avoid build-time errors when env is missing
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY || "dummy_key_for_build";
  return new Groq({ apiKey });
};

export async function POST(req: Request) {
  try {
    const { messages, type } = await req.json();

    // Define the persona based on selection
    const systemPrompt = `You are a professional technical interviewer conducting a ${type} interview. 
    - Your goal is to assess the candidate's skills.
    - Keep your responses concise (1-2 sentences max) so the conversation flows naturally.
    - Ask one clear question at a time.
    - If the user gives a good answer, acknowledge it briefly and move to the next question.
    - If the answer is weak or vague, ask a follow-up question to clarify.
    - Start by introducing yourself briefly and asking the first question.`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      // ⚠️ UPDATE: Switched to the new supported model
      model: "llama-3.1-8b-instant", 
      temperature: 0.7,
      max_tokens: 150,
    });

    const responseText = completion.choices[0]?.message?.content || "Let's move to the next topic.";

    return NextResponse.json({ 
      response: responseText
    });

  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to process AI response" }, { status: 500 });
  }
}