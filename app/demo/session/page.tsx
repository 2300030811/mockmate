"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// --- Types for Web Speech API ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// --- Icons ---
const MicIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);
const StopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
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
const HomeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const XMarkIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function InterviewSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") || "behavioral";

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
  
  // State
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isListening, setIsListening] = useState(false); // Validating if mic is open
  const [isProcessing, setIsProcessing] = useState(false); // Waiting for AI response
  const [isAISpeaking, setIsAISpeaking] = useState(false); // AI is talking
  const [transcript, setTranscript] = useState(""); // Current text
  const [finalTranscript, setFinalTranscript] = useState(""); // Confirmed text
  const [debugStatus, setDebugStatus] = useState("Initializing...");
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [browserSupport, setBrowserSupport] = useState(true);

  // Setup Timer
  useEffect(() => {
    const timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check Browser Support & Mobile Warning
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const iWindow = window as unknown as IWindow;
        if (!iWindow.webkitSpeechRecognition && !iWindow.SpeechRecognition) {
            setBrowserSupport(false);
            setPermissionError("Your browser doesn't support Real-time Speech API. Please use Chrome or Edge for the best free experience.");
        }
    }
  }, []);

  // Initialize Session
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      handleStartSession();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopVisualization();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, transcript]);

  // Handle Stream for Video
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((e) => console.warn("Video play error:", e));
    }
  }, [cameraActive]);


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
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audioStream;
        setCameraActive(false);
        setupVisualizer(audioStream);
        setDebugStatus("Ready (Audio Only)");
        setTimeout(() => handleAIResponse([]), 500);
      } catch (e: any) {
        setDebugStatus("Permission Denied");
        setPermissionError("Please enable Microphone access. It is required for the interview.");
      }
    }
  };

  // --- 2. SPEECH RECOGNITION (The Core Logic) ---
  const startListening = useCallback(() => {
    if (isAISpeaking || isProcessing) return; // Don't listen while AI talks

    const iWindow = window as unknown as IWindow;
    const SpeechRecognition = iWindow.webkitSpeechRecognition || iWindow.SpeechRecognition;

    if (!SpeechRecognition) {
        setDebugStatus("Browser not supported");
        return;
    }

    // Stop existing instance
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show text as I speak
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        setIsListening(true);
        setDebugStatus("Listening...");
        setTranscript("");
    };

    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscriptChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscriptChunk += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        // Update UI with what user is saying NOW
        const currentText = finalTranscriptChunk || interimTranscript;
        if (currentText) {
             setTranscript(prev => {
                // Determine if we are appending or replacing
                // For simplicity in this demo, we just show the active buffer
                // A more complex app would merge history, but here 'transcript' is the "Current Answer Buffer"
                return (event.resultIndex === 0 ? "" : prev) + currentText; 
             });
             setTranscript(currentText); // Simply show what is being heard
        }

        // Silence Detection / Auto-Submit Logic
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        // If we have a final result, wait a bit then submit
        if (finalTranscriptChunk) {
            setFinalTranscript(prev => prev + " " + finalTranscriptChunk);
            // Wait 3 seconds of silence after a "final" sentence to assume turn is over
            silenceTimerRef.current = setTimeout(() => {
               recognition.stop();
            }, 3000);
        } else {
            // Even if just interim, if user pauses for 5 seconds, assume done
             silenceTimerRef.current = setTimeout(() => {
               recognition.stop();
            }, 5000);
        }
    };

    recognition.onerror = (event: any) => {
        console.error("Speech Error:", event.error);
        if (event.error === 'no-speech') {
            setDebugStatus("No speech detected");
            // Don't stop, just ignore of retry
        } else {
            setDebugStatus("Error: " + event.error);
            setIsListening(false);
        }
    };

    recognition.onend = () => {
        setIsListening(false);
        // If we have text, verify and submit
        // access state via ref or check the input value? 
        // We use a small timeout to let state settle
        setTimeout(() => {
             // We need to access the LATEST value of transcript/finalTranscript here.
             // Since we are in a closure, we trust the `handleSubmit` will pull from state or we pass it
             // Actually, `onend` might trigger before state update inside React. 
             // We will trigger submit manually via the useEffect or a ref check.
             // Better approach: Trigger submit logic in `useEffect` monitoring `isListening`
        }, 100);
    };

    recognitionRef.current = recognition;
    recognition.start();

  }, [isAISpeaking, isProcessing]);

  const stopListening = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
    }
  };

  // Watch for listening end to trigger submit
  useEffect(() => {
      if (!isListening && (transcript.trim().length > 1 || finalTranscript.trim().length > 1)) {
          // Check if we effectively have content to send
          const textToSend = finalTranscript + " " + transcript;
          
          // Double check to ensure we don't submit empty
          if (textToSend.replace(/undefined/g, "").trim().length > 0) {
            // SUBMIT
            handleSubmit(textToSend.replace(/undefined/g, "").trim());
          }
      }
  }, [isListening]);


  // --- 3. AI INTERACTION (LLM + TTS) ---
  const handleAIResponse = async (history: any[]) => {
    setIsProcessing(true);
    setDebugStatus("AI Thinking...");
    
    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        body: JSON.stringify({ messages: history, type, sessionId }),
      });
      const data = await res.json();
      
      const aiText = data.response;
      const newHistory = [...history, { role: "assistant", content: aiText }];
      
      setMessages(newHistory);
      setTranscript("");
      setFinalTranscript("");
      
      // Native TTS
      speakText(aiText);

    } catch (err) {
      setDebugStatus("Connection Error");
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
      setDebugStatus("AI Speaking...");
      setIsProcessing(false);
      setIsAISpeaking(true);

      if (typeof window === 'undefined' || !window.speechSynthesis) {
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
      const preferred = voices.find(v => v.name.includes("Google US English")) || 
                        voices.find(v => v.name.includes("Microsoft Zira")) ||
                        voices.find(v => v.lang === "en-US");
      
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
          setIsAISpeaking(false);
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

    // 1. Update UI
    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setTranscript(""); 
    setFinalTranscript("");

    // 2. Call AI
    handleAIResponse(newHistory);
  };

  // --- 4. VISUALIZER (Copied from old code, simplified) ---
  const setupVisualizer = (stream: MediaStream) => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256; 
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        drawVisualizer();
    } catch(e) { console.error(e); }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      const centerX = canvas.width / 2;
      for (let i = 0; i < bufferLength; i+=2) {
        let barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        if (barHeight < 2) barHeight = 2;
        const hue = (i / bufferLength) * 60 + 210; 
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.fillRect(centerX + (i/2 * barWidth), (canvas.height - barHeight) / 2, barWidth - 1, barHeight);
        ctx.fillRect(centerX - (i/2 * barWidth), (canvas.height - barHeight) / 2, barWidth - 1, barHeight);
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };


  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Header --- */}
      <header className="h-16 px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
                <HomeIcon />
            </button>
            <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-200">System Design Interview</span>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAISpeaking || isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-xs text-gray-500">{debugStatus}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
                <ClockIcon className="text-gray-500" />
                <span className="text-sm font-mono text-gray-300">{formatTime(elapsedSeconds)}</span>
             </div>
             <button 
                onClick={() => router.push('/demo')}
                className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-all"
             >
                End Session
             </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        
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

        {/* --- Left: Chat History --- */}
        <div className="flex-1 flex flex-col bg-gray-900/30 overflow-hidden relative border-r border-gray-800">
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-24">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <div className="w-24 h-24 bg-gray-800 rounded-full mb-4 animate-pulse"></div>
                        <p>Initializing AI Interviewer...</p>
                    </div>
                )}
                
                {messages.map((msg, i) => (
                    <div 
                        key={i} 
                        className={`flex w-full ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`
                            max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-xl backdrop-blur-sm
                            ${msg.role === 'assistant' 
                                ? 'bg-gray-800/80 text-gray-100 rounded-tl-sm border border-gray-700/50' 
                                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                            }
                            animate-fadeIn
                        `}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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

        {/* --- Right: Active Visuals (Desktop) --- */}
        <div className="w-full md:w-[400px] lg:w-[480px] bg-black/40 flex flex-col border-l border-gray-800 relative hidden md:flex">
             {/* AI Avatar Area */}
             <div className="h-1/2 border-b border-gray-800 flex items-center justify-center relative p-6 bg-gradient-to-b from-gray-900 to-gray-950">
                <div className="relative">
                    <div className={`
                        w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-500
                        ${isAISpeaking ? 'scale-110 shadow-blue-500/20 ring-4 ring-blue-500/20' : 'scale-100 ring-2 ring-gray-700'}
                        bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
                    `}>
                        🤖
                    </div>
                    {isAISpeaking && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping [animation-duration:2s]"></div>
                            <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-ping [animation-duration:3s]"></div>
                        </>
                    )}
                </div>
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <h3 className="font-semibold text-gray-200">AI Interviewer</h3>
                    <p className="text-xs text-gray-500">{isAISpeaking ? 'Speaking...' : 'Listening'}</p>
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
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-600">
                        <CameraOffIcon className="mb-2 opacity-50" />
                        <span className="text-xs uppercase tracking-widest opacity-50">Camera Off</span>
                    </div>
                )}
                
                {/* Visualizer Overlay */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end justify-center pb-4">
                     <canvas ref={canvasRef} width={300} height={60} className="w-full max-w-[300px] h-[60px]" />
                </div>
             </div>
        </div>

      </main>

      {/* --- Floating Bottom Bar --- */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center px-4 z-30 pointer-events-none">
        
        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl p-2 flex items-center gap-2 pointer-events-auto max-w-3xl w-full">
            
            {/* Input Field (Shows Live Transcript) */}
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={transcript || finalTranscript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Type your answer..."}
                    className={`
                        w-full bg-gray-800/50 border border-gray-700 
                        focus:border-blue-500/50 focus:bg-gray-800 text-white 
                        rounded-xl px-4 py-3 pr-12 outline-none transition-all placeholder:text-gray-600
                        ${isListening ? 'animate-pulse border-blue-500/30' : ''}
                    `}
                    disabled={isProcessing}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {(transcript || finalTranscript) && (
                     <button 
                        onClick={() => { setTranscript(""); setFinalTranscript(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                     >
                        <XMarkIcon className="w-4 h-4" />
                     </button>
                )}
            </div>

            {/* Mic Toggle */}
            <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isAISpeaking}
                className={`
                    w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0
                    ${isListening 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }
                    ${(isProcessing || isAISpeaking) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {isListening ? <div className="w-4 h-4 bg-white rounded-sm" /> : <MicIcon />}
            </button>

            {/* Send Button */}
            <button
                onClick={() => handleSubmit()}
                disabled={(!transcript && !finalTranscript) || isProcessing}
                className={`
                    w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 shrink-0
                    ${(transcript || finalTranscript) && !isProcessing
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 hover:bg-blue-500' 
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }
                `}
            >
                <SendIcon />
            </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}