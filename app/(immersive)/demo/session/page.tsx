"use client";

import { useEffect, useRef, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { chatWithAI, getSpeechToken } from "@/app/actions/interview";
import { summarizeInterviewAction } from "@/app/actions/interview-summary";
import { saveInterviewSession } from "@/app/actions/interview-sessions";
import type * as SpeechSDKType from "microsoft-cognitiveservices-speech-sdk";
import { Activity, Code2, Video, Mic, Send, X, CameraOff } from "lucide-react";
import { useSessionTimer } from "./hooks/useSessionTimer";

// Lazy-load the Azure Speech SDK (~1.5MB) — only needed when Azure token is available
let SpeechSDK: typeof SpeechSDKType | null = null;
const loadSpeechSDK = async () => {
  if (!SpeechSDK) {
    SpeechSDK = await import("microsoft-cognitiveservices-speech-sdk");
  }
  return SpeechSDK;
};

// Components
import { SessionHeader } from "./components/SessionHeader";
import { SessionChat } from "./components/SessionChat";
import { SessionVisuals } from "./components/SessionVisuals";
import { SessionEditor } from "./components/SessionEditor";
import { SessionInsights, type InterviewAnalytics } from "./components/SessionInsights";
import { SessionReport } from "./components/SessionReport";

// --- Types for Web Speech API ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ALLOWED_TYPES = ["behavioral", "technical"] as const;
  const rawType = searchParams?.get("type") || "behavioral";
  const type = ALLOWED_TYPES.includes(rawType as any) ? rawType : "behavioral";

  const ALLOWED_DIFFICULTIES = ["junior", "mid", "senior"] as const;
  const rawDifficulty = searchParams?.get("difficulty") || "mid";
  const difficulty = ALLOWED_DIFFICULTIES.includes(rawDifficulty as any) ? rawDifficulty : "mid";
  const topic = (searchParams?.get("topic") || "").slice(0, 100);

  // Mobile UI State
  const [mobileTab, setMobileTab] = useState<'chat' | 'code'>('chat');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState<string | null>(null);

  // Session Timer with pause/resume and time limit
  const { elapsedSeconds, isPaused, pause: pauseTimer, resume: resumeTimer, stop: stopTimer } = useSessionTimer({
    maxSeconds: 45 * 60,
    warnAtSeconds: 40 * 60,
    onWarning: () => setDebugStatus("5 minutes remaining!"),
    onTimeUp: () => handleEndSession(),
  });

  // Pause/resume handler
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const handlePauseResume = useCallback(() => {
    if (isSessionPaused) {
      resumeTimer();
      setIsSessionPaused(false);
      setDebugStatus("Resumed");
      // Auto-listen after unpause
      setTimeout(() => startListening(), 300);
    } else {
      pauseTimer();
      setIsSessionPaused(true);
      setDebugStatus("Paused");
      // Stop all active processes
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsAISpeaking(false);
      stopListening();
    }
  }, [isSessionPaused, pauseTimer, resumeTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);
  const messagesRef = useRef<{role: string, content: string}[]>([]);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");

  // State
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isListening, setIsListening] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isAISpeaking, setIsAISpeaking] = useState(false); 
  const [isUserActive, setIsUserActive] = useState(false); 
  const [transcript, setTranscript] = useState(""); 
  const [finalTranscript, setFinalTranscript] = useState(""); 
  const [debugStatus, setDebugStatus] = useState("Initializing...");
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [azureConfig, setAzureConfig] = useState<{ token: string; region: string } | null>(null);

  // Enhanced Features State
  const [rightPanelTab, setRightPanelTab] = useState<'visuals' | 'code' | 'insights'>(type === "technical" ? "code" : "visuals");
  const [editorValue, setEditorValue] = useState("");
  const [editorLanguage, setEditorLanguage] = useState<'c' | 'cpp' | 'javascript' | 'typescript' | 'python' | 'css' | 'sql'>('c');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStats, setSessionStats] = useState<InterviewAnalytics>({
    wpm: 0,
    sentiment: "Neutral",
    keyConcepts: [],
    confidenceScore: 0,
    avgResponseTimeSec: 0,
    fillerWordCount: 0,
    fillerWordsPerMinute: 0,
    answerDepth: "shallow",
    starMethodCount: 0,
    questionsCovered: 0,
    vocabularyRichness: 0,
    longestAnswerWords: 0,
    shortestAnswerWords: 0,
    technicalAccuracy: 0,
  });

  // Refs for Azure
  const azureRecognizerRef = useRef<SpeechSDKType.SpeechRecognizer | null>(null);

  // Refs for VAD
  const volumeDataRef = useRef<number[]>(new Array(30).fill(0));
  const silenceStartRef = useRef<number | null>(null);
  const isUserActiveRef = useRef(false);
  const noiseFloorRef = useRef<number>(15); // Adaptive noise floor — starts at 15, calibrates to environment
  const speechStartTimeRef = useRef<number | null>(null); // Track when user started speaking for dynamic timeout
  const echoGuardUntilRef = useRef<number>(0); // Suppress mic input while TTS is playing + cooldown

  // Refs for proper cleanup of timers
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsKeepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable callback for volume changes — avoids re-creating AudioContext in AudioVisualizer
  const handleVolumeChange = useCallback((vol: number) => {
    volumeDataRef.current.shift();
    volumeDataRef.current.push(vol);
  }, []);

  // Stable callback for navigating home
  const handleHomeClick = useCallback(() => router.push("/"), [router]);

  // Stable callback for stats updates from SessionInsights
  const handleStatsUpdate = useCallback((stats: InterviewAnalytics) => {
    setSessionStats(stats);
  }, []);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { finalTranscriptRef.current = finalTranscript; }, [finalTranscript]);

  const handleEndSession = useCallback(async () => {
    // Cancel all speech and audio resources eagerly
    if (typeof window !== "undefined" && window.speechSynthesis) {
       window.speechSynthesis.cancel();
    }
    // Clear pending timeouts
    if (pendingTimeoutRef.current) {
       clearTimeout(pendingTimeoutRef.current);
       pendingTimeoutRef.current = null;
    }
    // Clear TTS keepalive
    if (ttsKeepAliveRef.current) {
       clearInterval(ttsKeepAliveRef.current);
       ttsKeepAliveRef.current = null;
    }
    // Stop timer
    stopTimer();
    // Stop media stream tracks (camera + mic)
    if (streamRef.current) {
       streamRef.current.getTracks().forEach((track) => track.stop());
       streamRef.current = null;
    }
    // Stop speech recognizers
    if (azureRecognizerRef.current) {
       try { azureRecognizerRef.current.stopContinuousRecognitionAsync(); } catch (e) {}
       try { azureRecognizerRef.current.close(); } catch (e) {}
       azureRecognizerRef.current = null;
    }
    if (recognitionRef.current) {
       try { recognitionRef.current.stop(); } catch (e) {}
       recognitionRef.current = null;
    }
    // Cancel animation frames
    if (animationFrameRef.current) {
       cancelAnimationFrame(animationFrameRef.current);
       animationFrameRef.current = null;
    }
    setIsListening(false);
    setIsAISpeaking(false);
    setCameraActive(false);

    if (messages.length < 2) {
       router.push("/demo");
       return;
    }
    setIsSummarizing(true);
    try {
       const result = await summarizeInterviewAction(messages, type || "Technical", {
         ...sessionStats,
         durationSeconds: elapsedSeconds,
       });
       setInterviewSummary(result.markdown);

       // Save session to database (fire-and-forget)
       saveInterviewSession({
         type,
         difficulty,
         topic: topic || undefined,
         messages,
         aiSummary: result.markdown,
         stats: sessionStats,
         durationSeconds: elapsedSeconds,
       }).catch((err) => console.warn("Failed to save session:", err));
    } catch (err) {
       console.error(err);
       router.push("/demo");
    } finally {
       setIsSummarizing(false);
    }
  }, [messages, type, sessionStats, elapsedSeconds, stopTimer, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize Session, Check Support, Fetch Token
  useEffect(() => {
    const fetchToken = async () => {
      const result = await getSpeechToken();
      if (result.token && result.region) {
        setAzureConfig({ token: result.token, region: result.region });
      }
    };
    fetchToken();

    // 3. Start Session
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      handleStartSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before accidental navigation / tab close
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (messages.length > 1) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [messages.length]);

  // Main Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (azureRecognizerRef.current) {
        try { azureRecognizerRef.current.stopContinuousRecognitionAsync(); } catch (e) {}
        try { azureRecognizerRef.current.close(); } catch (e) {}
        azureRecognizerRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Clear all pending timers
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }
      if (ttsKeepAliveRef.current) {
        clearInterval(ttsKeepAliveRef.current);
        ttsKeepAliveRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // --- 1. SETUP: Camera & Visualizer (Visuals Only) ---
  const handleStartSession = async () => {
    setDebugStatus("Requesting Access...");
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: { ideal: 48000 },
        },
      });

      streamRef.current = stream;
      setCameraActive(true);
      setDebugStatus("Ready");

      pendingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) handleAIResponse([]);
      }, 500);
    } catch (err: any) {
      console.warn("Camera failed, trying audio only:", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: { ideal: 48000 },
          },
        });
        streamRef.current = audioStream;
        setCameraActive(false);
        setDebugStatus("Ready (Audio Only)");
        pendingTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) handleAIResponse([]);
        }, 500);
      } catch (e: any) {
        setDebugStatus("Permission Denied");
        setPermissionError(
          "Please enable Microphone access. It is required for the interview.",
        );
      }
    }
  };

  // --- 2. SPEECH RECOGNITION (The Core Logic) ---
  const startListening = useCallback(async () => {
    if (isAISpeaking || isProcessing) return;

    // A. TRY AZURE SPEECH (Pro Mode)
    if (azureConfig) {
      const sdk = await loadSpeechSDK();
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(azureConfig.token, azureConfig.region);
      speechConfig.speechRecognitionLanguage = "en-US";
      // Enable detailed output for better interim results
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;
      // Enable dictation mode for natural speech with pauses
      speechConfig.enableDictation();
      // Increase initial silence timeout — prevents premature "no match" in noisy environments
      speechConfig.setProperty("SpeechServiceConnection_InitialSilenceTimeoutMs", "10000");
      // Increase end-of-speech silence timeout for longer thinking pauses
      speechConfig.setProperty("SpeechServiceConnection_EndSilenceTimeoutMs", "3000");
      // Enable noise suppression at the SDK level (Baked-in signal processing)
      speechConfig.setProperty("SpeechContext_EnhancedAudioProcessing", "true");
      
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Add phrase hints for common interview vocabulary to boost recognition accuracy
      const phraseList = sdk.PhraseListGrammar.fromRecognizer(recognizer);
      const interviewPhrases = [
        // Behavioral
        "STAR method", "situation", "task", "action", "result",
        "cross-functional", "stakeholder", "deliverable", "KPI", "OKR",
        // Technical
        "API", "REST", "GraphQL", "microservices", "CI/CD", "Docker", "Kubernetes",
        "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
        "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Redis",
        "AWS", "Azure", "GCP", "Lambda", "S3", "EC2",
        "Big O", "time complexity", "space complexity", "algorithm", "data structure",
        "linked list", "binary tree", "hash map", "dynamic programming",
        "system design", "scalability", "load balancer", "caching", "CDN",
        "agile", "scrum", "sprint", "retrospective",
      ];
      for (const phrase of interviewPhrases) {
        phraseList.addPhrase(phrase);
      }
      
      recognizer.recognizing = (s, e) => {
        setTranscript(e.result.text);
        setDebugStatus("Azure Listening...");
      };
      
      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          setFinalTranscript((prev) => prev + " " + e.result.text);
          setTranscript("");
        }
      };

      // Handle cancellation / errors (network drops, token expiry, etc.)
      recognizer.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          console.warn("Azure Speech canceled:", e.errorDetails);
          setDebugStatus("Reconnecting...");
          // Clean up and fall back to Web Speech API
          try { recognizer.close(); } catch (_) {}
          azureRecognizerRef.current = null;
          setAzureConfig(null); // This will cause next startListening to use Web Speech
          setIsListening(false);
        }
      };
      
      recognizer.startContinuousRecognitionAsync(() => {
        setIsListening(true);
        setDebugStatus("Pro Listening...");
        volumeDataRef.current = new Array(30).fill(50);
      });
      
      azureRecognizerRef.current = recognizer;
      return;
    }

    // B. FALLBACK TO WEB SPEECH API
    const iWindow = window as unknown as IWindow;
    const SpeechRecognition = iWindow.webkitSpeechRecognition || iWindow.SpeechRecognition;
    if (!SpeechRecognition) {
      setDebugStatus("Browser not supported");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1; // Use best hypothesis (default, explicit for clarity)

    recognition.onstart = () => {
      setIsListening(true);
      setDebugStatus("Listening...");
      setTranscript("");
      volumeDataRef.current = new Array(30).fill(50);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscriptChunk = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          // Skip low-confidence final results (likely noise/echo misinterpretation)
          if (confidence > 0 && confidence < 0.4) continue;
          finalTranscriptChunk += text;
        } else {
          interimTranscript += text;
        }
      }
      const currentText = finalTranscriptChunk || interimTranscript;
      if (currentText) {
        setTranscript(currentText); 
      }
      if (finalTranscriptChunk) {
        setFinalTranscript((prev) => prev + " " + finalTranscriptChunk);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return; // Benign, will auto-restart via onend
      if (event.error === "aborted") return; // Intentional stop
      setDebugStatus("Error: " + event.error);
      // On network error, attempt a restart after a brief delay
      if (event.error === "network") {
        pendingTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      // If we're still supposed to be listening (no intentional stop), auto-restart
      // Chrome's Web Speech API silently dies after ~60s of silence or network hiccups
      if (!isProcessing && !isAISpeaking && recognitionRef.current === recognition) {
        try {
          recognition.start();
          return; // Successfully restarted — don't flip isListening off
        } catch (e) {
          // start() throws if already started or other issue — fall through
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isAISpeaking, isProcessing, azureConfig]);

  // Improved VAD & Turn-Taking Logic with adaptive noise floor + echo guard
  useEffect(() => {
    if (!isListening || isProcessing || isAISpeaking) return;

    // Calibration: sample ambient noise for the first 500ms to set the noise floor
    let calibrationSamples: number[] = [];
    const calibrationEnd = Date.now() + 500;

    const vadIntervalId = setInterval(() => {
      const recentVolume = volumeDataRef.current;
      const avgVolume = recentVolume.reduce((a, b) => a + b, 0) / (recentVolume.length || 1);

      // Echo guard: ignore volume data while TTS echo is still decaying
      if (Date.now() < echoGuardUntilRef.current) return;

      // During calibration window, collect ambient noise samples
      if (Date.now() < calibrationEnd) {
        calibrationSamples.push(avgVolume);
        // Set floor to ambient mean + margin (so speech clearly exceeds it)
        if (calibrationSamples.length >= 3) {
          const ambientMean = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length;
          // Floor = ambient + 40% headroom, clamped to [8, 40] to stay sane
          noiseFloorRef.current = Math.max(8, Math.min(40, ambientMean * 1.4 + 5));
        }
        return; // Don't do VAD during calibration
      }

      const isCurrentlySpeaking = avgVolume > noiseFloorRef.current;

      // Only trigger state update when value actually changes
      if (isCurrentlySpeaking !== isUserActiveRef.current) {
        isUserActiveRef.current = isCurrentlySpeaking;
        setIsUserActive(isCurrentlySpeaking);
      }

      if (isCurrentlySpeaking) {
        silenceStartRef.current = null;
        // Track when user started speaking (for dynamic silence timeout)
        if (!speechStartTimeRef.current) speechStartTimeRef.current = Date.now();
      } else {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else {
          const silenceDuration = Date.now() - silenceStartRef.current;
          // Dynamic silence timeout: longer answers get more grace period
          // Short answer (<5s speaking): 1.5s silence to submit
          // Long answer (>15s speaking): 2.5s silence before submitting
          const speechDuration = speechStartTimeRef.current ? (Date.now() - speechStartTimeRef.current) / 1000 : 0;
          const silenceThreshold = speechDuration > 15 ? 2500 : speechDuration > 5 ? 2000 : 1500;

          if (silenceDuration > silenceThreshold && (transcriptRef.current.trim() || finalTranscriptRef.current.trim())) {
            speechStartTimeRef.current = null; // Reset for next turn
            stopListening();
          }
        }
      }
    }, 100);

    return () => {
      clearInterval(vadIntervalId);
    };
  }, [isListening, isProcessing, isAISpeaking]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    if (azureRecognizerRef.current) {
        const recognizer = azureRecognizerRef.current;
        azureRecognizerRef.current = null;
        recognizer.stopContinuousRecognitionAsync(() => {
            try { recognizer.close(); } catch (e) {}
            setIsListening(false);
        }, () => {
            try { recognizer.close(); } catch (e) {}
            setIsListening(false);
        });
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Watch for listening end to trigger submit
  useEffect(() => {
    if (
      !isListening &&
      (transcript.trim().length > 1 || finalTranscript.trim().length > 1) &&
      !isProcessing &&
      !isAISpeaking
    ) {
      // Check if we effectively have content to send
      const textToSend = (finalTranscript + " " + transcript).replace(/undefined/g, "").trim();

      // Double check to ensure we don't submit empty
      if (textToSend.length > 0) {
        // SUBMIT
        handleSubmit(textToSend);
      }
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- 3. AI INTERACTION (LLM + TTS) ---

  const handleAIResponse = async (history: any[]) => {
    setIsProcessing(true);
    setDebugStatus("AI Thinking...");

    try {
      // Server Action Call
      const data = await chatWithAI(history, type, difficulty, topic);
      
      if (!isMountedRef.current) return;

      if (data.error) {
         throw new Error(data.error);
      }

      const aiText = data.response;
      const newHistory = [...history, { role: "assistant", content: aiText }];

      setMessages(newHistory);
      setTranscript("");
      setFinalTranscript("");

      // Native TTS
      speakText(aiText);
    } catch (err) {
      if (!isMountedRef.current) return;
      setDebugStatus("Connection Error");
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if (!isMountedRef.current) return;
    setDebugStatus("AI Speaking...");
    setIsProcessing(false);
    setIsAISpeaking(true);
    // Activate echo guard — suppress mic pickup while TTS is active
    echoGuardUntilRef.current = Infinity;

    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsAISpeaking(false);
      echoGuardUntilRef.current = 0;
      return;
    }

    window.speechSynthesis.cancel(); // Stop anything currently playing

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select Voice - Try to get better voices
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.name.includes("Microsoft Zira")) ||
      voices.find((v) => v.lang === "en-US");

    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      // Clear TTS keepalive
      if (ttsKeepAliveRef.current) {
        clearInterval(ttsKeepAliveRef.current);
        ttsKeepAliveRef.current = null;
      }
      if (!isMountedRef.current) return;
      // Release echo guard after 600ms cooldown (speaker reverb / room echo decay)
      echoGuardUntilRef.current = Date.now() + 600;
      setIsAISpeaking(false);
      setIsUserActive(false);
      setDebugStatus("Your Turn");
      // Auto-start listening again for fluid conversation
      // Give a small buffer — tracked so we can cancel on unmount
      pendingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) startListening();
      }, 500);
    };

    utterance.onerror = () => {
      if (ttsKeepAliveRef.current) {
        clearInterval(ttsKeepAliveRef.current);
        ttsKeepAliveRef.current = null;
      }
      if (!isMountedRef.current) return;
      echoGuardUntilRef.current = 0;
      setIsAISpeaking(false);
    };

    window.speechSynthesis.speak(utterance);

    // Chrome pauses speechSynthesis after ~15s. Keep it alive.
    ttsKeepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        if (ttsKeepAliveRef.current) {
          clearInterval(ttsKeepAliveRef.current);
          ttsKeepAliveRef.current = null;
        }
      }
    }, 10000);
  };

  const handleSubmit = useCallback((textOverride?: string) => {
    const text = textOverride || transcript || finalTranscript;
    if (!text || !text.trim()) return;

    // 1. Update UI (Use ref for latest state)
    const currentMsgs = messagesRef.current;
    
    // Safety check for duplication (basic)
    if (currentMsgs.length > 0 && currentMsgs[currentMsgs.length - 1].content === text) return;

    const newHistory = [...currentMsgs, { role: "user", content: text }];
    
    // Optimistic update
    setMessages(newHistory);
    setTranscript("");
    setFinalTranscript("");
    
    // Sync Ref Immediately
    messagesRef.current = newHistory;

    // 2. Call AI
    handleAIResponse(newHistory);
  }, [transcript, finalTranscript]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-screen md:h-screen bg-gray-950 text-white flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
      <SessionHeader 
        type={type}
        azureConfig={azureConfig}
        isAISpeaking={isAISpeaking}
        isProcessing={isProcessing}
        isListening={isListening}
        isUserActive={isUserActive}
        debugStatus={debugStatus}
        elapsedSeconds={elapsedSeconds}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        isSummarizing={isSummarizing}
        isPaused={isSessionPaused}
        onPauseResume={handlePauseResume}
        onEndSession={handleEndSession}
        onHomeClick={handleHomeClick}
      />

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col md:flex-row relative min-h-0">
        
        {/* Screen reader status announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isAISpeaking ? "AI is speaking" : isProcessing ? "AI is thinking" : isListening ? (isUserActive ? "Detecting your voice" : "Listening for your answer") : "Ready for your input"}
        </div>

        {/* Permission/Browser Error Overlay */}
        {permissionError && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-red-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraOff className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Notice</h3>
              <p className="text-gray-400 mb-6">{permissionError}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        {/* Summary Overlay */}
        <AnimatePresence>
          {interviewSummary && (
            <SessionReport 
              stats={sessionStats}
              transcript={finalTranscript}
              aiSummary={interviewSummary}
              durationSeconds={elapsedSeconds}
            />
          )}
        </AnimatePresence>

        {/* --- Left: Chat History --- */}
        <SessionChat 
            messages={messages}
            isProcessing={isProcessing}
            mobileTab={mobileTab}
        />

        {/* --- Right: Enhanced Dashboard (Desktop) --- */}
        <div className={`w-full md:w-[450px] lg:w-[500px] bg-gray-950 flex-col border-l border-gray-800 relative min-h-0 overflow-hidden ${mobileTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Tab Header */}
          <div className="flex bg-gray-900/50 border-b border-gray-800 p-1">
            {[
              { id: 'visuals', icon: Video, label: 'Virtual' },
              { id: 'code', icon: Code2, label: 'Editor' },
              { id: 'insights', icon: Activity, label: 'Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id as any)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${rightPanelTab === tab.id 
                    ? 'bg-gray-800 text-white shadow-lg border border-gray-700' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                `}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden relative min-h-0">
            {rightPanelTab === 'visuals' && (
                <SessionVisuals 
                    isAISpeaking={isAISpeaking}
                    isProcessing={isProcessing}
                    cameraActive={cameraActive}
                    stream={streamRef.current}
                    isListening={isListening}
                    isUserActive={isUserActive}
                    onVolumeChange={handleVolumeChange}
                    videoRef={videoRef}
                />
            )}
            
            {rightPanelTab === 'code' && (
                <SessionEditor 
                    editorLanguage={editorLanguage}
                    setEditorLanguage={setEditorLanguage}
                    editorValue={editorValue}
                    setEditorValue={setEditorValue}
                    handleSubmit={handleSubmit}
                    isRunning={isRunning}
                    setIsRunning={setIsRunning}
                />
            )}

            {rightPanelTab === 'insights' && (
                <SessionInsights 
                    transcript={transcript}
                    finalTranscript={finalTranscript}
                    messages={messages}
                    elapsedSeconds={elapsedSeconds}
                    onStatsUpdate={handleStatsUpdate}
                />
            )}
          </div>
        </div>
      </main>

      {/* --- Floating Bottom Bar --- */}
      <div className={`absolute bottom-6 left-0 right-0 items-center justify-center px-4 z-30 pointer-events-none flex`}>
        <div className={`
            bg-gray-900/90 backdrop-blur-xl border shadow-2xl rounded-2xl p-2 flex items-center gap-2 pointer-events-auto max-w-3xl w-full transition-all duration-300
            ${isUserActive && !isAISpeaking ? "border-green-500/50 ring-1 ring-green-500/20" : "border-gray-700/50"}
        `}>
          {/* Input Field (Shows Live Transcript) */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={transcript || finalTranscript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={isListening ? (isUserActive ? "Detecting voice..." : "Listening...") : "Type your answer..."}
              aria-label="Type your answer"
              className={`
                        w-full bg-gray-800/50 border border-gray-700 
                        focus:border-blue-500/50 focus:bg-gray-800 text-white 
                        rounded-xl px-4 py-3 pr-12 outline-none transition-all placeholder:text-gray-600
                        ${isListening ? "border-blue-500/30" : ""}
                        ${isUserActive && !isAISpeaking ? "border-green-500/40" : ""}
                    `}
              disabled={isProcessing}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {(transcript || finalTranscript) && (
              <button
                onClick={() => {
                  setTranscript("");
                  setFinalTranscript("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label="Clear input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mic Toggle */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isAISpeaking}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            className={`
                    w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0
                    ${
                      isListening
                        ? (isUserActive ? "bg-green-600 shadow-green-500/40 mic-active-pulse" : "bg-red-500 shadow-red-500/40") + " text-white shadow-lg"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }
                    ${isProcessing || isAISpeaking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
          >
            {isListening ? (
              <div className={`w-4 h-4 rounded-sm transition-all ${isUserActive ? "bg-white scale-125 animate-pulse" : "bg-white"}`} />
            ) : (
              <Mic size={24} />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSubmit()}
            disabled={(!transcript && !finalTranscript) || isProcessing}
            aria-label="Send answer"
            className={`
                    w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0
                    ${
                      (transcript || finalTranscript) && !isProcessing
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 hover:bg-blue-500"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed"
                    }
                `}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewSession() {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-950 flex items-center justify-center text-white">Initializing Session...</div>}>
      <InterviewSessionContent />
    </Suspense>
  );
}
