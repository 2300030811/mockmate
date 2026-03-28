const Groq = require("groq-sdk");
require("dotenv").config({ path: ".env.local" });

const keys = (process.env.GROQ_API_KEY || "").split(",");
const firstKey = keys[0];

if (!firstKey) {
  console.error("No Groq key found in .env.local");
  process.exit(1);
}

const groq = new Groq({ apiKey: firstKey });

async function main() {
  try {
    const largeText = "A".repeat(15000);
    console.log("Testing Groq API with large text...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a Resume Analyst with a Brutal style. Respond ONLY in valid JSON." },
        { role: "user", content: `Here is the candidate's resume text:\n\n${largeText}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    console.log("Success length:", chatCompletion.choices[0]?.message?.content?.length);
  } catch (err) {
    console.error("Error:", err);
    console.error("Message:", err.message);
  }
}

main();
