export async function getExplanation(prompt: string) {
  const { getNextKey } = await import("./keyManager");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getNextKey("GROQ_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an AWS certification trainer. Explain answers in clear simple language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
}
