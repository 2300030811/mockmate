"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// --- Enhanced Icons ---
const MicIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const StopIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>;
const SendIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const CameraOffIcon = () => <svg className="w-20 h-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

export default function InterviewSession() {
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") || "behavioral";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [debugStatus, setDebugStatus] = useState("Waiting...");
  const [cameraActive, setCameraActive] = useState(false);
  
  // Media Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Force load voices (Chrome requirement)
    window.speechSynthesis.getVoices();
    
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 1. Start Session
  const handleStartSession = async () => {
    setStarted(true);
    setDebugStatus("Requesting Media...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setupVisualizer(stream);
      setDebugStatus("Ready");
    } catch (err) {
      console.warn("Camera failed, trying audio only...");
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audioStream;
        setCameraActive(false);
        setupVisualizer(audioStream);
        setDebugStatus("Ready (Audio Only)");
      } catch (e) {
        setDebugStatus("Error: Mic Denied");
        alert("Microphone is required!");
        return;
      }
    }
    
    handleAIResponse([]);
  };

  const setupVisualizer = (stream: MediaStream) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 128;
    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;
    drawVisualizer();
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
      
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const hue = (i / bufferLength) * 60 + 200; // Blue to cyan gradient
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  // 2. Recording Logic
  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) {
      alert("No media stream found. Refresh and allow mic access.");
      return;
    }

    setIsRecording(true);
    setTranscript(""); 
    setDebugStatus("🎙️ Recording...");
    audioChunksRef.current = [];

    // Robust MediaRecorder initialization
    // Use browser default for maximum compatibility
    // Complex mimeTypes often fail on Windows/Chrome
    let mediaRecorder: MediaRecorder;
    try {
        mediaRecorder = new MediaRecorder(stream);
    } catch (e) {
        console.error("MediaRecorder init failed:", e);
        setDebugStatus("⚠️ Mic Init Error");
        return;
    }
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      setDebugStatus("⚙️ Processing...");
      setIsProcessing(true);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      if (audioBlob.size < 1000) {
        setDebugStatus("⚠️ Audio too small");
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");

      try {
        const res = await fetch("/api/interview/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (data.text && data.text.trim().length > 0) {
          setTranscript(data.text);
          setDebugStatus("✅ Heard: " + data.text);
        } else {
          setDebugStatus("🔇 Silence detected");
        }
      } catch (err) {
        console.error(err);
        setDebugStatus("❌ Transcription failed");
      } finally {
        setIsProcessing(false);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    try {
        // Small delay to allow recorder to initialize
        setTimeout(() => {
            if (mediaRecorder.state === "inactive") {
                mediaRecorder.start();
            }
        }, 100);
    } catch (e) {
        console.error("MediaRecorder start failed:", e);
        setDebugStatus("⚠️ Mic Error: Start failed");
        setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  // 3. AI Chat Logic
  const handleAIResponse = async (history: any[]) => {
    setIsProcessing(true);
    setDebugStatus("🤔 AI Thinking...");
    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        body: JSON.stringify({ messages: history, type }),
      });
      const data = await res.json();
      
      const newHistory = [...history, { role: "assistant", content: data.response }];
      setMessages(newHistory);
      speakText(data.response);
    } catch (err) {
      setDebugStatus("❌ AI Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    setDebugStatus("🗣️ AI Speaking...");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select a better voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name === "Google US English") || 
                           voices.find(v => v.name === "Microsoft Zira Desktop - English (United States)") ||
                           voices.find(v => v.lang === "en-US" && v.name.includes("Female"));
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    // Adjust for a more soothing tone
    utterance.pitch = 0.9; // Slightly lower pitch is often perceived as calmer
    utterance.rate = 0.95; // Slightly slower pace

    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => {
        setIsAISpeaking(false);
        setDebugStatus("✨ Your turn");
    };
    window.speechSynthesis.speak(utterance);
  };

  // 4. Submit
  const handleSubmit = () => {
    if (!transcript) return;
    const newHistory = [...messages, { role: "user", content: transcript }];
    setMessages(newHistory);
    setTranscript("");
    handleAIResponse(newHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white flex flex-col overflow-hidden">
      
      {!started && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center space-y-6">
                <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/50 animate-pulse">
                    <SparklesIcon />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AI Mock Interview
                </h1>
                <p className="text-gray-400 max-w-md">
                    Practice your {type} interview skills with our AI interviewer
                </p>
                <button 
                    onClick={handleStartSession} 
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-blue-500/30 hover:scale-105 hover:shadow-blue-500/50"
                >
                    Start Interview
                </button>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-300">Live Interview Session</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                <span className="text-xs text-gray-400">Status:</span>
                <span className="text-xs font-mono text-blue-400">{debugStatus}</span>
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT: AI Chat */}
        <div className="w-full md:w-1/2 flex flex-col bg-gray-900/30 backdrop-blur-sm border-r border-gray-800/50">
          
          {/* AI Avatar */}
          <div className="p-8 flex flex-col items-center border-b border-gray-800/50">
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 transition-all duration-300 ${isAISpeaking ? 'scale-110 shadow-2xl shadow-blue-500/50' : 'shadow-xl'}`}>
              <span className="text-6xl">🤖</span>
              {isAISpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping"></div>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-400 font-medium">AI Interviewer</p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
                  msg.role === 'assistant' 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50' 
                    : 'bg-gradient-to-br from-blue-600 to-blue-700'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* RIGHT: User Video & Controls */}
        <div className="w-full md:w-1/2 flex flex-col bg-black/30 backdrop-blur-sm">
          
          {/* Video Feed */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-video bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden border-2 border-gray-800/50 shadow-2xl">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <CameraOffIcon />
                  <p className="mt-4 text-sm font-medium">Camera Off (Audio Only)</p>
                </div>
              )}
              
              {/* Audio Visualizer */}
              <canvas 
                ref={canvasRef} 
                width="400" 
                height="80" 
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 opacity-90 rounded-lg"
              />
              
              {/* Transcript Display */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                <p className="text-white font-medium text-center min-h-[24px]">
                  {transcript || <span className="text-gray-500">Your response will appear here...</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4 border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
            
            {/* Input Area */}
            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={isProcessing || isAISpeaking}
                placeholder="Type your answer or use the microphone..."
                className="w-full bg-gray-900/70 border-2 border-gray-700/50 focus:border-blue-500/50 rounded-2xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                Press Enter to send
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              
              {/* Mic Button */}
              <button
                onClick={toggleRecording}
                disabled={isAISpeaking || isProcessing}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50 animate-pulse' 
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30 hover:scale-110'
                }`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></div>
                )}
              </button>

              {/* Submit Button */}
              <button 
                onClick={handleSubmit} 
                disabled={!transcript || isProcessing || isAISpeaking}
                className={`flex-1 h-14 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  !transcript 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-105 shadow-green-500/30'
                }`}
              >
                Submit Answer <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}