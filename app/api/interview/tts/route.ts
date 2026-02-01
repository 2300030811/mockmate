import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    // 1. Fallback to Edge/Browser TTS if keys are missing (Frontend handles this usually, but good to signal)
    if (!speechKey || !speechRegion) {
      return NextResponse.json({ error: "Azure Speech not configured", useBrowserTTS: true }, { status: 503 });
    }

    // 2. Azure TTS Config
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    
    // Set a nice voice (Neutral En-US)
    speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural"; 
    // Set output to MP3 for better compatibility and size
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

    // 3. Synthesize
    // We use a pull stream or direct synthesis to buffer
    // Since Next.js API routes are ephemeral, we'll synthesize to a buffer
    
    return new Promise((resolve) => {
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined); // undefined audio config = no speaker output

        synthesizer.speakTextAsync(
            text,
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const audioBuffer = result.audioData;
                    
                    // Return the audio file
                    const response = new NextResponse(audioBuffer, {
                        headers: {
                            "Content-Type": "audio/mpeg",
                            "Content-Length": audioBuffer.byteLength.toString(),
                        },
                    });
                    
                    synthesizer.close();
                    resolve(response);
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails);
                    synthesizer.close();
                    resolve(NextResponse.json({ error: "TTS Failed" }, { status: 500 }));
                }
            },
            (err) => {
                console.error("TTS Error: ", err);
                synthesizer.close();
                resolve(NextResponse.json({ error: err }, { status: 500 }));
            }
        );
    });

  } catch (error: any) {
    console.error("TTS Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
