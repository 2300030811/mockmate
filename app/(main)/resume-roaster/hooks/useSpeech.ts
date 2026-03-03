"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/** Max chars per utterance chunk to avoid Chrome's ~15s cutoff bug */
const CHUNK_SIZE = 200;

/** Split text into chunks at sentence boundaries */
function splitIntoChunks(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cachedVoices, setCachedVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speakingRef = useRef(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      setCachedVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    speakingRef.current = false;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;

      // Toggle off if already speaking
      if (speakingRef.current) {
        stop();
        return;
      }

      const voices =
        cachedVoices.length > 0
          ? cachedVoices
          : window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Male") ||
              v.name.includes("Premium"))
        ) || voices[0];

      const chunks = splitIntoChunks(text);
      let chunkIndex = 0;

      const speakNext = () => {
        if (!speakingRef.current || chunkIndex >= chunks.length) {
          speakingRef.current = false;
          setIsSpeaking(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.0;
        utterance.pitch = 0.9;

        utterance.onend = () => {
          chunkIndex++;
          speakNext();
        };
        utterance.onerror = () => {
          speakingRef.current = false;
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakingRef.current = true;
      setIsSpeaking(true);
      speakNext();
    },
    [cachedVoices, stop, supported]
  );

  return { isSpeaking, speak, stop, supported };
}
