"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAI, getSpeechToken } from "@/app/actions/interview";
import { summarizeInterviewAction } from "@/app/actions/interview-summary";
import ReactMarkdown from "react-markdown";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { Activity, Award, Code2, Video, Zap } from "lucide-react";

// Components
import { SessionHeader } from "./components/SessionHeader";
import { SessionChat } from "./components/SessionChat";
import { SessionVisuals } from "./components/SessionVisuals";
import { SessionEditor } from "./components/SessionEditor";
import { SessionInsights } from "./components/SessionInsights";
import { SessionReport } from "./components/SessionReport";

// --- Types for Web Speech API ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Icons
const MicIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);
const SendIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const CameraOffIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
  </svg>
);
const XMarkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);
  const messagesRef = useRef<{role: string, content: string}[]>([]); 

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [azureConfig, setAzureConfig] = useState<{ token: string; region: string } | null>(null);

  // Enhanced Features State
  const [rightPanelTab, setRightPanelTab] = useState<'visuals' | 'code' | 'insights'>(type === "technical" ? "code" : "visuals");
  const [editorValue, setEditorValue] = useState("");
  const [editorLanguage, setEditorLanguage] = useState<'c' | 'cpp' | 'javascript' | 'typescript' | 'python' | 'css' | 'sql'>('c');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStats, setSessionStats] = useState({
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

  // Main Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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
    };
  }, []);

  // --- 1. SETUP: Camera & Visualizer (Visuals Only) ---
  const handleStartSession = async () => {
    setDebugStatus("Requesting Access...");
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Needed for visualizer
      });

      streamRef.current = stream;
      setCameraActive(true);
      setDebugStatus("Ready");

      setTimeout(() => handleAIResponse([]), 500);
    } catch (err: any) {
      console.warn("Camera failed, trying audio only:", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = audioStream;
        setCameraActive(false);
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

    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsAISpeaking(false);
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
    
    // Safety check for duplication (basic)
    // if (currentMsgs.length > 0 && currentMsgs[currentMsgs.length - 1].content === text) return;

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
        onEndSession={handleEndSession}
        onHomeClick={() => router.push("/")}
      />

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col md:flex-row relative min-h-0">
        
        {/* Permission/Browser Error Overlay */}
        {permissionError && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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
            <SessionReport 
              stats={sessionStats}
              transcript={finalTranscript}
              onClose={() => setInterviewSummary(null)}
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
                    onVolumeChange={(vol) => {
                        volumeDataRef.current.shift();
                        volumeDataRef.current.push(vol);
                    }}
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
                    onStatsUpdate={setSessionStats}
                />
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
