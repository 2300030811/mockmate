import { Configuration, OpenAIApi } from "openai";
import { IncomingForm } from "formidable";
const fs = require("fs");

export const config = {
  api: {
    bodyParser: false,
  },
};

import { getNextKey } from "@/utils/keyManager";

export default async function handler(req: any, res: any) {
  // We initialize configuration inside the retry loop now.

  // Here, we create a temporary file to store the audio file using Vercel's tmp directory
  // As we compressed the file and are limiting recordings to 2.5 minutes, we won't run into trouble with storage capacity
  const fData = await new Promise<{ fields: any; files: any }>(
    (resolve, reject) => {
      const form = new IncomingForm({
        multiples: false,
        uploadDir: "/tmp",
        keepExtensions: true,
      });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    }
  );

  const videoFile = fData.files.file;
  const videoFilePath = videoFile?.filepath;
  console.log("Transcribing file:", videoFilePath);

  // Retry logic for Groq
  const maxRetries = 3;
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
        try {
            const apiKey = getNextKey("GROQ_API_KEY");
            if (!apiKey) throw new Error("No GROQ_API_KEY found");

            const configuration = new Configuration({
                apiKey: apiKey,
                basePath: "https://api.groq.com/openai/v1"
            });
            const openai = new OpenAIApi(configuration);

            console.log(`Attempt ${i+1}: Transcribing with Groq...`);
            
            const resp = await openai.createTranscription(
                fs.createReadStream(videoFilePath),
                "distil-whisper-large-v3-en"
                // Groq doesn't support the "prompt" parameter for filler words in the same way, or it's optional.
            );

            const transcript = resp?.data?.text;
            console.log("Transcription success");

            // Skip moderation for now or use a basic keyword check if needed, 
            // as OpenAI moderation endpoint is separate and we are avoiding OpenAI keys.
            // If you really need checking, I can add a simple keyword filter.
            
            res.status(200).json({ transcript });
            return;

        } catch (error: any) {
            console.warn(`Attempt ${i+1} failed:`, error.message);
            lastError = error;
             // Wait briefly before retry
            await new Promise(r => setTimeout(r, 1000));
        }
  }
    
  console.error("All transcription attempts failed", lastError);
  res.status(500).json({ error: "Creating transcription failed after retries." });
}
