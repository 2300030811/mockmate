import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";
import { getNextKey } from "@/utils/keyManager";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { prompt } = json as { prompt?: string };

    if (!prompt) {
      return new Response("No prompt in the request", { status: 400 });
    }

    // Retry logic for robustness (Groq rate limits)
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
          // Get a fresh key each attempt (KeyManager rotates/randomizes)
          const apiKey = getNextKey("GROQ_API_KEY");
          
          if (!apiKey) {
             throw new Error("No GROQ_API_KEY found");
          }

          const payload: OpenAIStreamPayload = {
              model: "llama-3.3-70b-versatile",
              messages: [
              {
                  role: "system",
                  content:
                  "You are a tech hiring manager. You are to only provide feedback on the interview candidate's transcript. If it is not relevant and does not answer the question, make sure to say that. Do not be overly verbose and focus on the candidate's response.",
              },
              { role: "user", content: prompt },
              ],
              temperature: 0.7,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
              max_tokens: 450,
              stream: true,
              n: 1,
              baseUrl: "https://api.groq.com/openai/v1"
          };

          const stream = await OpenAIStream(payload, apiKey);
          return new Response(stream);

        } catch (e: any) {
            console.warn(`Attempt ${i+1} failed:`, e.message);
            lastError = e;
            // Wait briefly before retry
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return new Response(`Failed to generate feedback after ${maxRetries} attempts. Error: ${lastError?.message}`, { status: 500 });

  } catch (error: any) {
    return new Response(`Error in generate route: ${error.message}`, { status: 500 });
  }
}
