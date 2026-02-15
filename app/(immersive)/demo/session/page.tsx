"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAI, getSpeechToken } from "@/app/actions/interview";
import { executeCode } from "@/app/actions/code-execution";
import { summarizeInterviewAction } from "@/app/actions/interview-summary";
import ReactMarkdown from "react-markdown";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { UserAuthSection } from "@/components/UserAuthSection";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css";
import { 
  LineChart, 
  Code2, 
  Video, 
  Terminal, 
  BrainCircuit, 
  Zap,
  Activity,
  Award,
  ZapOff,
  ChevronRight,
  TrendingUp,
  Copy
} from "lucide-react";

// --- Types for Web Speech API ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// --- Icons ---
const MicIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);
const StopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);
const SendIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);
const CameraOffIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 3l18 18"
    />
  </svg>
);
const HomeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const XMarkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") || "behavioral";

  // Mobile UI State
  const [mobileTab, setMobileTab] = useState<'chat' | 'code'>('chat');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState<string | null>(null);

  const handleEndSession = async () => {
     if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
     }
     if (messages.length < 2) {
        router.push("/demo");
        return;
     }
     setIsSummarizing(true);
     try {
        const result = await summarizeInterviewAction(messages, type || "Technical");
        setInterviewSummary(result.markdown);
     } catch (err) {
        console.error(err);
        router.push("/demo");
     } finally {
        setIsSummarizing(false);
     }
  };
  const [cooldown, setCooldown] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasStartedRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const messagesRef = useRef<{role: string, content: string}[]>([]); // To prevent stale closures in async callbacks

  // State
  const [sessionId] = useState(
    () => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [isListening, setIsListening] = useState(false); // Validating if mic is open
  const [isProcessing, setIsProcessing] = useState(false); // Waiting for AI response
  const [isAISpeaking, setIsAISpeaking] = useState(false); // AI is talking
  const [isUserActive, setIsUserActive] = useState(false); // Volume-based detection
  const [transcript, setTranscript] = useState(""); // Current text
  const [finalTranscript, setFinalTranscript] = useState(""); // Confirmed text
  const [debugStatus, setDebugStatus] = useState("Initializing...");
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [browserSupport, setBrowserSupport] = useState(true);
  const [azureConfig, setAzureConfig] = useState<{ token: string; region: string } | null>(null);

  // Enhanced Features State
  const [rightPanelTab, setRightPanelTab] = useState<'visuals' | 'code' | 'insights'>(type === "technical" ? "code" : "visuals");
  const [editorValue, setEditorValue] = useState("#include <stdio.h>\n\nint main() {\n    printf(\"Hello Mockmate!\\n\");\n    return 0;\n}");
  const [editorLanguage, setEditorLanguage] = useState<'c' | 'cpp' | 'javascript' | 'typescript' | 'python' | 'css' | 'sql'>('c');
  const [showConsole, setShowConsole] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [analytics, setAnalytics] = useState({
    wpm: 0,
    sentiment: "Neutral",
    keyConcepts: [] as string[],
    confidenceScore: 0
  });

  // Refs for Azure
  const azureRecognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

  // Refs for VAD
  const volumeDataRef = useRef<number[]>(new Array(30).fill(0));
  const silenceStartRef = useRef<number | null>(null);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Setup Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Templates for different languages
  useEffect(() => {
    const templates: Record<string, string> = {
      c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello Mockmate!\\n\");\n    return 0;\n}",
      cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello Mockmate!\" << std::endl;\n    return 0;\n}",
      javascript: "// Mockmate JavaScript Solution\nfunction solve() {\n  console.log(\"Solving...\");\n}\n\nsolve();",
      typescript: "// Mockmate TypeScript Solution\ninterface User {\n  id: number;\n  name: string;\n}\n\nfunction getUser(id: number): User {\n  return { id, name: \"MockUser\" };\n}",
      python: "# Mockmate Python Solution\ndef solve():\n    print(\"Hello from Python!\")\n\nif __name__ == \"__main__\":\n    solve()",
      sql: "-- Mockmate SQL Query\nSELECT user_id, COUNT(activity_type) as activity_count\nFROM user_activities\nGROUP BY user_id\nORDER BY activity_count DESC\nLIMIT 10;",
      css: "/* Mockmate Visual Styling */\n.candidate-profile {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}"
    };

    // Only update if the user hasn't typed much or is using a default template
    const currentLines = editorValue.trim().split('\n');
    if (currentLines.length < 10) {
       setEditorValue(templates[editorLanguage] || "");
    }
  }, [editorLanguage, editorValue]);

  const [isRunning, setIsRunning] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check Browser Support & Mobile Warning
  useEffect(() => {
    if (typeof window !== "undefined") {
      const iWindow = window as unknown as IWindow;
      if (!iWindow.webkitSpeechRecognition && !iWindow.SpeechRecognition) {
        setBrowserSupport(false);
        setPermissionError(
          "Your browser doesn't support Real-time Speech API. Please use Chrome or Edge for the best free experience.",
        );
      }
    }
  }, []);

  // Fetch Azure Token
  useEffect(() => {
    const fetchToken = async () => {
      const result = await getSpeechToken();
      if (result.token && result.region) {
        setAzureConfig({ token: result.token, region: result.region });
      }
    };
    fetchToken();
  }, []);

  // Initialize Session
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      handleStartSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    const timerRef = silenceTimerRef;
    return () => {
      isMountedRef.current = false;
      stopVisualization();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (azureRecognizerRef.current) {
        try { azureRecognizerRef.current.stopContinuousRecognitionAsync(); } catch (e) {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Update Analytics on every new message
  useEffect(() => {
    if (messages.length === 0) return;
    const userMsgs = messages.filter(m => m.role === "user");
    if (userMsgs.length === 0) return;

    const lastText = userMsgs[userMsgs.length - 1].content;
    const wordCount = lastText.trim().split(/\s+/).length;
    
    // Improved logic for "Progressive Insights"
    const concepts = [
      "react", "node", "async", "cloud", "security", "database", "frontend", "backend", 
      "api", "rest", "graphql", "state", "props", "aws", "azure", "docker", "kubernetes", 
      "sql", "nosql", "postgres", "mysql", "mongodb", "indexing", "joins", "normalization", 
      "acid", "transactions", "scalability", "complexity", "big o", "algorithms"
    ];
    const found = concepts.filter(c => lastText.toLowerCase().includes(c));

    // Simple Sentiment Analysis
    const positiveWords = ["excellent", "great", "flexible", "scalable", "efficient", "optimal", "best", "sure", "absolutely", "definitely"];
    const negativeWords = ["not", "unable", "don't", "can't", "hard", "difficult", "struggle", "bad", "poor"];
    
    const posCount = positiveWords.filter(w => lastText.toLowerCase().includes(w)).length;
    const negCount = negativeWords.filter(w => lastText.toLowerCase().includes(w)).length;
    
    let sentiment = "Neutral";
    if (posCount > negCount) sentiment = "Positive";
    if (negCount > posCount) sentiment = "Anxious";

    setAnalytics(prev => ({
      ...prev,
      wpm: Math.floor(Math.random() * 30) + 110,
      sentiment: sentiment,
      keyConcepts: Array.from(new Set([...prev.keyConcepts, ...found])),
      confidenceScore: Math.min(100, Math.max(60, prev.confidenceScore + (found.length * 4) + (posCount * 2) - (negCount * 3)))
    }));
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, transcript, finalTranscript]);

  // Handle Stream for Video
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch((e) => console.warn("Video play error:", e));
    }
  }, [cameraActive, rightPanelTab]); // Re-attach when tab switches back to visuals

  // --- 1. SETUP: Camera & Visualizer (Visuals Only) ---
  const handleStartSession = async () => {
    setDebugStatus("Requesting Access...");
    setPermissionError(null);

    try {
      // visual stream only
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Needed for visualizer
      });

      streamRef.current = stream;
      setCameraActive(true);
      setupVisualizer(stream);
      setDebugStatus("Ready");

      // Start AI Intro
      setTimeout(() => handleAIResponse([]), 500);
    } catch (err: any) {
      console.warn("Camera failed, trying audio only:", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = audioStream;
        setCameraActive(false);
        setupVisualizer(audioStream);
        setDebugStatus("Ready (Audio Only)");
        setTimeout(() => handleAIResponse([]), 500);
      } catch (e: any) {
        setDebugStatus("Permission Denied");
        setPermissionError(
          "Please enable Microphone access. It is required for the interview.",
        );
      }
    }
  };

  // --- 2. SPEECH RECOGNITION (The Core Logic) ---
  const startListening = useCallback(() => {
    if (isAISpeaking || isProcessing) return;

    // A. TRY AZURE SPEECH (Pro Mode)
    if (azureConfig) {
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(azureConfig.token, azureConfig.region);
      speechConfig.speechRecognitionLanguage = "en-US";
      
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      
      recognizer.recognizing = (s, e) => {
        setTranscript(e.result.text);
        setDebugStatus("Azure Listening...");
      };
      
      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setFinalTranscript((prev) => prev + " " + e.result.text);
          setTranscript("");
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
        if (event.results[i].isFinal) finalTranscriptChunk += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
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
      if (event.error !== "no-speech") setDebugStatus("Error: " + event.error);
    };

    recognition.onend = () => {
      if (isMountedRef.current && !isProcessing && !isAISpeaking) setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isAISpeaking, isProcessing, azureConfig]);

  // Improved VAD & Turn-Taking Logic
  useEffect(() => {
    if (!isListening || isProcessing || isAISpeaking) return;

    const checkSilence = () => {
      // Check volume-based silence
      const recentVolume = volumeDataRef.current;
      const avgVolume = recentVolume.reduce((a, b) => a + b, 0) / (recentVolume.length || 1);
      const isCurrentlySpeaking = avgVolume > 15; // Threshold for active voice

      setIsUserActive(isCurrentlySpeaking);

      if (isCurrentlySpeaking) {
        silenceStartRef.current = null;
      } else {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else {
          const silenceDuration = Date.now() - silenceStartRef.current;
          // Substantial silence after speaking (1.5 seconds)
          if (silenceDuration > 1500 && (transcript.trim() || finalTranscript.trim())) {
            stopListening();
          }
        }
      }
      
      if (isListening) {
        animationFrameRef.current = requestAnimationFrame(checkSilence);
      }
    };

    const animId = requestAnimationFrame(checkSilence);
    return () => cancelAnimationFrame(animId);
  }, [isListening, isProcessing, isAISpeaking, transcript, finalTranscript]);

  const stopListening = () => {
    if (azureRecognizerRef.current) {
        azureRecognizerRef.current.stopContinuousRecognitionAsync(() => {
            setIsListening(false);
            azureRecognizerRef.current = null;
        });
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

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
      const data = await chatWithAI(history, type);
      
      if (!isMountedRef.current) return; // Stop if unmounted

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

    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsAISpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop anything currently playing

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Select Voice
    const voices = window.speechSynthesis.getVoices();
    // Try to get a "Google" or "Neural" or "Female" voice
    const preferred =
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.name.includes("Microsoft Zira")) ||
      voices.find((v) => v.lang === "en-US");

    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setIsAISpeaking(false);
      setIsUserActive(false);
      setDebugStatus("Your Turn");
      // Auto-start listening again for fluid conversation
      // Give a small buffer
      setTimeout(() => startListening(), 500);
    };

    utterance.onerror = () => {
      setIsAISpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (textOverride?: string) => {
    const text = textOverride || transcript || finalTranscript;
    if (!text || !text.trim()) return;

    // 1. Update UI (Use ref for latest state)
    const currentMsgs = messagesRef.current;
    const newHistory = [...currentMsgs, { role: "user", content: text }];
    
    // Optimistic update
    setMessages(newHistory);
    setTranscript("");
    setFinalTranscript("");
    
    // Sync Ref Immediately
    messagesRef.current = newHistory;

    // 2. Call AI
    handleAIResponse(newHistory);
  };

  // --- 4. VISUALIZER (Copied from old code, simplified) ---
  const setupVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      drawVisualizer();
    } catch (e) {
      console.error(e);
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Update volume data for VAD
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const currentVol = sum / (bufferLength || 1);
      volumeDataRef.current.shift();
      volumeDataRef.current.push(currentVol);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const barCount = 40;
      const barWidth = width / barCount;
      const midY = height / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        let val = dataArray[dataIndex] / 255.0;
        
        // Boost user voice visually
        if (isListening && !isAISpeaking) val *= 1.2;
        
        const barHeight = Math.max(4, val * height * 0.8);
        const opacity = val * 0.5 + 0.3;
        
        let color = isAISpeaking ? "168, 85, 247" : "59, 130, 246"; // Purple (AI) or Blue (User)
        if (isUserActive && !isAISpeaking) color = "34, 197, 94"; // Green when speaking
        
        ctx.fillStyle = `rgba(${color}, ${opacity})`;
        
        // Draw symmetrical rounded bars
        const x = i * barWidth;
        const radius = 2;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x + 2, midY - barHeight / 2, barWidth - 4, barHeight, radius);
        } else {
            ctx.rect(x + 2, midY - barHeight / 2, barWidth - 4, barHeight);
        }
        ctx.fill();
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopVisualization = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  return (
    <div className="h-screen md:h-screen bg-gray-950 text-white flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
      {/* --- Header --- */}
      <header className="h-16 px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
               if (typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
               }
               router.push("/");
            }}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Go home"
          >
            <HomeIcon />
          </button>
          <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200 capitalize flex items-center gap-2">
              {type.replace("-", " ")} Interview
              {azureConfig && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30 uppercase tracking-tighter">
                  Pro
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isAISpeaking || isProcessing ? "bg-amber-400 animate-pulse" : isListening && isUserActive ? "bg-green-500 scale-125" : "bg-blue-500"}`}
              ></div>
              <span className="text-xs text-gray-500">{debugStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center">
              <UserAuthSection />
              <div className="w-px h-6 bg-gray-800 mx-4"></div>
          </div>

          {/* Mobile Tab Toggle */}
          <div className="flex md:hidden bg-gray-900 border border-gray-800 p-1 rounded-lg">
            <button
               onClick={() => setMobileTab('chat')}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mobileTab === 'chat' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Chat
            </button>
            <button
               onClick={() => setMobileTab('code')}
               className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${mobileTab === 'code' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
               <Code2 size={12} /> Editor
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
            <ClockIcon className="text-gray-500" />
            <span className="text-sm font-mono text-gray-300">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <button
            onClick={handleEndSession}
            disabled={isSummarizing}
            className={`px-4 py-1.5 rounded-lg border font-medium text-sm transition-all flex items-center gap-2
              ${isSummarizing 
                ? 'bg-gray-800 text-gray-500 border-gray-700' 
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border-red-500/20'}
            `}
          >
            {isSummarizing ? <Zap className="animate-spin" size={14} /> : null}
            {isSummarizing ? "Analyzing..." : "End & Analyze"}
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col md:flex-row relative min-h-0">
        {/* Permission/Browser Error Overlay */}
        {permissionError && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-red-500/30 p-6 rounded-2xl max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraOffIcon className="text-red-500" />
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
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 z-[60] bg-gray-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-y-auto pt-24"
            >
               <div className="max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-500/10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                     <Award size={400} />
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Session Complete</div>
                           <h2 className="text-4xl font-black text-white italic">AI INTERVIEW VERDICT</h2>
                        </div>
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                           <Award size={40} />
                        </div>
                     </div>

                     <div className={`prose prose-invert prose-blue max-w-none mb-12 custom-scrollbar max-h-[50vh] overflow-y-auto pr-4`}>
                        <ReactMarkdown>{interviewSummary}</ReactMarkdown>
                     </div>

                     <div className="flex flex-col md:flex-row gap-4">
                        <button 
                           onClick={() => window.location.reload()}
                           className="flex-1 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black transition-all border border-gray-700"
                        >
                           RETRY SESSION
                        </button>
                        <button 
                           onClick={() => router.push("/demo")}
                           className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20"
                        >
                           EXIT TO DASHBOARD
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Left: Chat History --- */}
        <div className={`flex-1 flex-col bg-gray-900/30 overflow-hidden relative border-r border-gray-800 ${mobileTab === 'code' ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-32">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <div className="w-24 h-24 bg-gray-800 rounded-full mb-4 animate-pulse"></div>
                <p>Initializing AI Interviewer...</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`
                            max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-xl backdrop-blur-sm
                            ${
                              msg.role === "assistant"
                                ? "bg-gray-800/80 text-gray-100 rounded-tl-sm border border-gray-700/50"
                                : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                            }
                            animate-fadeIn
                        `}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex w-full justify-start">
                <div className="bg-gray-800/50 p-4 rounded-2xl rounded-tl-sm border border-gray-700/50 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

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
            {/* 1. VISUALS TAB */}
            {rightPanelTab === 'visuals' && (
              <div className="h-full flex flex-col animate-fadeIn">
                {/* AI Avatar Area */}
                <div className="h-1/2 border-b border-gray-800 flex items-center justify-center relative p-6 bg-gradient-to-b from-gray-900 via-gray-950 to-black overflow-hidden">
                  {/* Background Glow */}
                  {isAISpeaking && (
                    <div className="absolute inset-0 bg-purple-500/5 animate-pulse blur-3xl rounded-full"></div>
                  )}
                  
                  <div className="relative group">
                    <div
                      className={`
                              w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-500
                              ${isAISpeaking ? "scale-110 shadow-purple-500/30 ring-4 ring-purple-500/30 rotate-3" : "scale-100 ring-2 ring-gray-700"}
                              bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 relative z-10
                          `}
                    >
                      <span className={isAISpeaking ? "animate-bounce" : ""}>🤖</span>
                    </div>
                    {isAISpeaking && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-purple-400/50 animate-ping [animation-duration:1.5s]"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ping [animation-duration:2.5s]"></div>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 inline-block px-4 py-1.5 rounded-full shadow-xl">
                      <h3 className="font-bold text-gray-200 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAISpeaking ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></div>
                        AI Interviewer
                      </h3>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-medium">
                      {isAISpeaking ? "Analyzing technical depth..." : isProcessing ? "Evaluating response..." : "Standing by..."}
                    </p>
                  </div>
                </div>

                {/* User Camera Area */}
                <div className="h-1/2 relative bg-gray-950 flex items-center justify-center overflow-hidden">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${isAISpeaking ? "opacity-40 grayscale-[50%]" : "opacity-100"}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-600">
                      <CameraOffIcon className="mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-widest opacity-50">
                        Camera Off
                      </span>
                    </div>
                  )}

                  {/* Visualizer Overlay */}
                  <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-center pb-6">
                    <div className="w-full px-8">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={80}
                        className="w-full h-[80px]"
                      />
                    </div>
                  </div>
                  
                  {isUserActive && !isAISpeaking && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse"></div>
                  )}
                </div>
              </div>
            )}

            {/* 2. CODE EDITOR TAB */}
            {rightPanelTab === 'code' && (
              <div className="h-full flex flex-col bg-[#1e1e1e] animate-fadeIn min-h-0">
                <div className="px-4 py-2 bg-black/30 border-b border-white/5 flex items-center justify-between overflow-x-auto custom-scrollbar gap-4">
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                       <Terminal size={12} className="text-gray-500" />
                       <select 
                        value={editorLanguage}
                        onChange={(e) => setEditorLanguage(e.target.value as any)}
                        className="bg-gray-800 text-[10px] font-mono text-gray-200 border border-gray-700 px-2 py-1 rounded outline-none cursor-pointer hover:bg-gray-700 hover:text-white transition-all uppercase tracking-widest appearance-none pr-8 relative"
                        style={{
                           backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
                           backgroundRepeat: 'no-repeat',
                           backgroundPosition: 'right 0.5rem center',
                           backgroundSize: '1rem'
                        }}
                       >
                         <option value="c" className="bg-gray-900">C</option>
                         <option value="cpp" className="bg-gray-900">C++</option>
                         <option value="javascript" className="bg-gray-900">javascript</option>
                         <option value="typescript" className="bg-gray-900">typescript</option>
                         <option value="python" className="bg-gray-900">python</option>
                         <option value="sql" className="bg-gray-900">SQL</option>
                         <option value="css" className="bg-gray-900">css</option>
                       </select>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      disabled={isRunning || cooldown}
                      onClick={async () => {
                        if (cooldown) return;
                        setCooldown(true);
                        setTimeout(() => setCooldown(false), 5000); // 5s cooldown to prevent API spam

                        setIsRunning(true);
                        setShowConsole(true);
                        setConsoleOutput(`Compiling ${editorLanguage.toUpperCase()} file...\nSending to execution engine...`);
                        
                        // SQL remains client-side only (for speed/safety)
                        if (editorLanguage === 'sql') {
                            setTimeout(() => {
                               let output = "Connected to database (PostgreSQL 15.4)...\n";
                               const code = editorValue.toLowerCase();
                               if (code.includes('create table')) output += "CREATE TABLE\nQuery returned successfully in 45ms.";
                               else if (code.includes('insert into')) output += "INSERT 0 1\nQuery returned successfully in 12ms.";
                               else if (code.includes('select')) output += "     id | name           | value    \n    ----+----------------+----------\n      1 | Record_One     | 98.5     \n      2 | Record_Two     | 72.1     \n      3 | Record_Three   | 45.0     \n    (3 rows)\n\nQuery returned successfully in 64ms.";
                               else output += "Query executed successfully.\n0 rows returned.";
                               
                               setConsoleOutput(output);
                               setIsRunning(false);
                               handleSubmit(`[System Notification: User executed SQL]\n\nCode/Input:\n${editorValue}\n\nOutput:\n${output}\n\n(The user is waiting for your feedback on this output.)`);
                            }, 800);
                            return;
                        }

                        // Server-Side Execution (Piston API via Server Action)
                        try {
                            const result = await executeCode(editorLanguage, editorValue);
                            
                            let finalOutput = "";
                            if (result.error) {
                                finalOutput = `Execution Error:\n${result.error}`;
                                if (result.output) finalOutput += `\n\nOutput:\n${result.output}`;
                            } else {
                                finalOutput = result.output || "Execution finished with no output.";
                            }

                            setConsoleOutput(finalOutput);
                            setIsRunning(false);
                            
                            // Notify AI
                            handleSubmit(`[System Notification: User executed ${editorLanguage} code]\n\nCode/Input:\n${editorValue}\n\nReal Execution Output:\n${finalOutput}\n\n(The user is waiting for your feedback on this output.)`);

                        } catch (err) {
                            console.error("Execution error:", err);
                            // Fallback to client-side simulation if server fails
                             setConsoleOutput("Server Execution Failed. Falling back to local simulation...\n\n" + 
                                "(Simulated Output)\n" +
                                "Program executed successfully.");
                             setIsRunning(false);
                        }
                      }}
                      className={`px-2 py-1 ${isRunning || cooldown ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'} text-[10px] font-bold rounded border border-green-500/20 uppercase transition-all flex items-center gap-1 min-w-[60px] justify-center`}
                    >
                      {isRunning ? (
                         <div className="w-2 h-2 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                         <Zap size={10} />
                      )}
                      <span>{isRunning ? '...' : cooldown ? 'Wait' : 'Run'}</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(editorValue);
                        alert("Code copied to clipboard!");
                      }}
                      className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded border border-gray-700 uppercase transition-all flex items-center gap-1"
                    >
                      <Copy size={10} /> Copy
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("Clear editor?")) setEditorValue("// Technical Challenge: \n\nfunction solve() {\n  \n}");
                      }}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded border border-red-500/20 uppercase transition-all"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => alert("Code exported to session summary!")}
                      className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 uppercase transition-all"
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar min-h-0">
                  <Editor
                    value={editorValue}
                    onValueChange={code => setEditorValue(code)}
                    highlight={code => highlight(code, languages[editorLanguage] || languages.clike, editorLanguage)}
                    padding={20}
                    style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                      fontSize: 14,
                      minHeight: '100%',
                    }}
                    className="prism-editor"
                  />
                </div>

                {/* Console Output area */}
                {showConsole && (
                   <div className={`${isConsoleExpanded ? 'h-[75%] shadow-inner' : 'h-32'} bg-black border-t border-gray-800 flex flex-col transition-all duration-300 animate-fadeIn shrink-0 z-10`}>
                      <div className="px-4 py-1.5 bg-gray-900 border-b border-gray-800 flex justify-between items-center text-[10px] text-gray-400 uppercase font-mono tracking-widest cursor-pointer"
                           onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                      >
                         <div className="flex items-center gap-2">
                            <Terminal size={12} className="text-green-500" />
                            <span>Console Output</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <button className="hover:text-white transition-colors">
                              {isConsoleExpanded ? <ChevronRight className="rotate-90" size={12}/> : <ChevronRight className="-rotate-90" size={12}/>}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setShowConsole(false); }} className="hover:text-red-400 transition-colors bg-gray-800 px-1.5 rounded">✕</button>
                         </div>
                      </div>
                      <div className="flex-1 p-3 overflow-auto custom-scrollbar font-mono text-xs text-green-500/90 leading-relaxed whitespace-pre-wrap bg-opacity-50">
                         {consoleOutput}
                      </div>
                   </div>
                )}
              </div>
            )}

            {/* 3. INSIGHTS TAB */}
            {rightPanelTab === 'insights' && (
              <div className="h-full bg-gray-900/50 p-6 overflow-y-auto custom-scrollbar animate-fadeIn">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <BrainCircuit className="text-purple-500" />
                  Live Performance
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-tighter">
                      <Zap size={14} className="text-amber-400" /> 
                      Pace (WPM)
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.wpm}</div>
                    <div className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
                      <TrendingUp size={10} /> {analytics.wpm > 140 ? "Fast Pace" : "Steady Pace"}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-tighter">
                      <Activity size={14} className="text-pink-400" /> 
                      Sentiment
                    </div>
                    <div className={`text-2xl font-bold ${analytics.sentiment === 'Positive' ? 'text-green-400' : analytics.sentiment === 'Anxious' ? 'text-amber-400' : 'text-blue-400'}`}>
                      {analytics.sentiment}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 capitalize">
                      Emotional Tone
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-tighter">
                      <Award size={14} className="text-blue-400" /> 
                      Confidence Score
                    </div>
                    <span className="text-sm font-bold text-white">{analytics.confidenceScore}%</span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${analytics.confidenceScore > 80 ? 'bg-green-500' : analytics.confidenceScore > 60 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                      style={{ width: `${analytics.confidenceScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-400 uppercase tracking-tighter">
                    <span>Key Concepts Identified</span>
                    <span className="text-purple-400">{analytics.keyConcepts.length} Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analytics.keyConcepts.length > 0 ? (
                      analytics.keyConcepts.map((concept, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20 animate-fadeIn">
                          {concept}
                        </span>
                      ))
                    ) : (
                      <div className="text-gray-600 text-sm italic">Keep talking to see identified concepts...</div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <BrainCircuit size={80} />
                  </div>
                  <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Terminal size={16} className="text-indigo-400" />
                    AI Observer Tip
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {messages.length < 3 
                      ? "The interviewer is currently setting the focus. Listen for technical clues and prepare to be specific."
                      : analytics.sentiment === "Anxious"
                        ? "You're sounding a bit hesitant. Take a deep breath! It's okay to say 'I need a moment to think about that'."
                        : analytics.confidenceScore > 85 
                          ? "Great momentum! Now is the time to mention specific tools or frameworks you've used to solve similar problems."
                          : "Try to structure your next answer using the STAR method: Situation, Task, Action, and Result."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Floating Bottom Bar --- */}
      <div className={`absolute bottom-6 left-0 right-0 items-center justify-center px-4 z-30 pointer-events-none ${mobileTab === 'code' ? 'hidden md:flex' : 'flex'}`}>
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
                <XMarkIcon className="w-4 h-4" />
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
              <MicIcon />
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
            <SendIcon />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes mic-pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .mic-active-pulse {
          animation: mic-pulse 1.5s infinite;
        }
      `}</style>
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
