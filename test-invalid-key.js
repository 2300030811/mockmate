const Groq = require("groq-sdk");
require("dotenv").config({ path: ".env.local" });

const groq = new Groq({ apiKey: "gsk_fakefakefakefake123" });

async function main() {
  try {
    console.log("Testing Groq API with fake key...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: `Here is the candidate` }
      ],
      model: "llama-3.3-70b-versatile",
    });
    console.log("Success length:", chatCompletion.choices[0]?.message?.content?.length);
  } catch (err) {
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
  }
}

main();
