"use server";

import { getNextKey } from "@/utils/keyManager";

export async function askBob(context: string, question: string) {
  try {
    const apiKey = getNextKey("GROQ_API_KEY");
    if (!apiKey) {
      throw new Error("No API Key available");
    }

    const payload: any = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Bob, a helpful AI billingual assistant.
Your goal is to help students understand quiz questions for their exams.
When answering:
- EXPLAIN LIKE I'M 5. Use simple, clear language that anyone can understand.
- Do NOT use metaphors or a specific persona like a "lion". Just be a helpful tutor.
- Always explain the correct answer clearly.
- If the user asks for an explanation, break it down simply.
- The user is practicing for a certification exam so ensure technical accuracy but keep it simple.`,
        },
        {
          role: "user",
          content: `Context (Question/Code/Options): 
${context}

User Question: ${question}`,
        },
      ],
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 500,
      stream: false, // For simplicity in this initial version, we effectively wait for the full response with a simple fetch if we were client side, but here we can just wait for the stream or use a invoke. 
      // Actually, OpenAIStream returns a ReadableStream. 
      // To make it easy for the client "use server" action, let's just use a simple fetch to Groq/OpenAI and return the text.
      // The OpenAIStream util is designed for Edge runtime streaming responses.
      // For a server action, it's easier to just await the response if we don't need streaming UI immediately.
      n: 1,
    };

    // Re-implementing a simple non-streaming fetch here since OpenAIStream is for streaming responses
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        method: "POST",
        body: JSON.stringify({
            ...payload,
            stream: false
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return { success: true, message: data.choices[0].message.content };

  } catch (error: any) {
    console.error("Error in askBob:", error);
    return { success: false, message: "Roar! Something went wrong. Please try again later." };
  }
}
