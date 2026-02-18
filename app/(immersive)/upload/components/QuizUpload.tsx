"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CloudIcon, CheckIcon } from "./icons";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dynamic from 'next/dynamic';
import { useState, useCallback } from "react";

const BobAssistant = dynamic(() => import("@/components/quiz/BobAssistant").then(mod => mod.BobAssistant), {
  ssr: false,
});

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface QuizUploadProps {
  isDark: boolean;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  difficulty: string;
  setDifficulty: (d: string) => void;
  count: number;
  setCount: (c: number) => void;
  isUploading: boolean;
  loadingStep: string;
  handleGenerate: (useVision?: boolean) => void;
  visionData: { text: string; base64: string } | null;
  setVisionData: (data: { text: string; base64: string } | null) => void;
  provider: string;
  setProvider: (p: any) => void;
  setCustomApiKey: (key: string) => void;
  mode: "quiz" | "flashcard";
  setMode: (m: "quiz" | "flashcard") => void;
}

export function QuizUpload({
  isDark,
  file,
  onFileChange,
  error,
  difficulty,
  setDifficulty,
  count,
  setCount,
  isUploading,
  loadingStep,
  handleGenerate,
  visionData,
  setVisionData,
  provider,
  setProvider,
  setCustomApiKey,
  mode,
  setMode
}: QuizUploadProps) {
  const [isBobOpen, setIsBobOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
        }`} style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
              : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
          }`}>
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-bold tracking-wider uppercase">
               AI {mode === "flashcard" ? "Flashcard" : "Quiz"} Generator
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-6xl font-extrabold mb-6 text-center ${
            isDark 
              ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
          }`}
        >
          Transform PDFs into
          <br />
          Interactive {mode === "flashcard" ? "Flashcards" : "Quizzes"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-xl mb-12 text-center ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Upload your study materials and let AI generate smart {mode === "flashcard" ? "flashcards" : "quizzes"} instantly
        </motion.p>
        
        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`p-8 md:p-12 rounded-3xl shadow-lg border ${
            isDark 
              ? 'bg-gray-900/50 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${
            file 
              ? isDark
                ? "border-green-500 bg-green-900/20" 
                : "border-green-500 bg-green-50"
              : isDark
                ? "border-gray-700 hover:border-blue-500 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              aria-label="Upload file"
            />
            
            <div className="flex flex-col items-center justify-center relative z-10">
              {file ? (
                <>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isDark ? 'bg-green-900/40' : 'bg-green-100'
                  }`}>
                    <CheckIcon />
                  </div>
                  <p className={`font-bold text-lg truncate max-w-xs ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{file.name}</p>
                  <p className="text-sm text-green-500 mt-1 font-medium">Ready to upload</p>
                </>
              ) : (
                <>
                  <div className="text-blue-500 group-hover:scale-110 transition-transform">
                    <CloudIcon />
                  </div>
                  <p className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Click to browse</p>
                  <p className={`text-sm mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>or drag and drop your PDF or TXT file here</p>
                </>
              )}
            </div>
          </div>
          
          <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
             💡 Tip: For faster results and no limits, upload <b>Text-based PDFs</b> (selectable text).
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                isDark 
                  ? 'bg-red-900/20 text-red-400 border border-red-800' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            </motion.div>
          )}

            {/* Settings Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* MODE SELECTOR */}
              <div className="space-y-3">
                <label className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  <span>🧠</span> Mode
                </label>
                <div className={`flex gap-1 p-1 rounded-xl border transition-opacity ${isUploading ? "opacity-50 pointer-events-none" : ""} ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/50 border-gray-200'}`}>
                  <button
                    onClick={() => setMode("quiz")}
                    disabled={isUploading}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all",
                      mode === "quiz"
                        ? isDark ? "bg-gray-800 shadow-xl text-blue-400 border border-gray-700" : "bg-white shadow-md text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <span>📝</span> Quiz
                  </button>
                  <button
                    onClick={() => setMode("flashcard")}
                    disabled={isUploading}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all",
                      mode === "flashcard"
                        ? isDark ? "bg-gray-800 shadow-xl text-yellow-400 border border-gray-700" : "bg-white shadow-md text-yellow-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                     <span>🗂️</span> Cards
                  </button>
                </div>
              </div>

              {/* DIFFICULTY */}
              <div className="space-y-3">
                <label className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  <span>📉</span> Difficulty Level
                </label>
                <div className={`flex gap-1 p-1 rounded-xl border transition-opacity ${isUploading ? "opacity-50 pointer-events-none" : ""} ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/50 border-gray-200'}`}>
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      disabled={isUploading}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-xs font-black capitalize transition-all",
                        difficulty === d
                          ? isDark ? "bg-gray-800 shadow-xl text-blue-400 border border-gray-700" : "bg-white shadow-md text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* COUNT */}
              <div className="space-y-3">
                <label className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  <span>🔢</span> Count
                </label>
                <div className={`flex gap-1 p-1 rounded-xl border transition-opacity ${isUploading ? "opacity-50 pointer-events-none" : ""} ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/50 border-gray-200'}`}>
                  {[5, 10, 15, 20].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCount(c)}
                      disabled={isUploading}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-xs font-black transition-all",
                        count === c
                          ? isDark ? "bg-gray-800 shadow-xl text-purple-400 border border-gray-700" : "bg-white shadow-md text-purple-600"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          {/* Vision Mode Offer */}
          <AnimatePresence>
            {visionData && !isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mt-8 p-6 rounded-3xl border-2 border-dashed ${
                  isDark 
                    ? 'bg-blue-900/10 border-blue-500/30 text-blue-200' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-3xl animate-pulse">
                    👁️
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-2">Switch to AI Vision Mode?</h3>
                    <p className="text-sm opacity-80 max-w-md leading-relaxed">
                      Standard text extraction failed (likely a scanned image). 
                      Our <b>AI Vision</b> can analyze the visual content to generate questions.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full max-w-sm">
                    <button
                      onClick={() => handleGenerate(true)}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Use Vision 🚀
                    </button>
                    <button
                      onClick={() => setVisionData(null)}
                      className={`flex-1 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 ${
                        isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optional API Key Input */}
          <div className="mt-6 text-left">
            <details className="group">
              <summary className={`text-sm font-medium cursor-pointer list-none flex items-center gap-2 ${
                isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'
              } transition`}>
                <span className="transition-transform group-open:rotate-90">▶</span>
                Use Custom API Key (Optional)
              </summary>
              <div className="mt-4 space-y-4">
                
                {/* Provider Selector */}
                <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 rounded-xl w-fit border border-gray-200/50">
                  <button
                    onClick={() => setProvider("auto")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "auto"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ⚡ Auto
                  </button>
                  <button
                    onClick={() => setProvider("gemini")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "gemini"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    onClick={() => setProvider("groq")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "groq"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Groq
                  </button>
                  <button
                    onClick={() => setProvider("openai")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "openai"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    OpenAI
                  </button>
                </div>

                <input 
                  type="password" 
                  placeholder={
                    provider === "openai" ? "Paste OpenAI API Key (sk-...)" :
                    provider === "groq" ? "Paste Groq API Key (gsk_...)" :
                    provider === "gemini" ? "Paste Google Gemini API Key" :
                    "Optional: Leave empty to use system keys"
                  }
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark 
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  aria-label="Custom API Key"
                />
                <p className={`text-xs pl-1 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {provider === "auto" ? "Attempts Gemini first, then falls back to Groq if quota exceeded." :
                   provider === "groq" ? "Uses Llama-3-70b on Groq Hardware (Fastest)." :
                   provider === "openai" ? "Requires a paid OpenAI account." :
                   "Uses Google's Gemini-1.5-Flash model."}
                </p>
              </div>
            </details>
          </div>

          <motion.div
            layout
            className="mt-8 w-full"
          >
            {isUploading ? (
               <div className={`w-full p-6 rounded-2xl border flex flex-col items-center justify-center gap-4 transition-all ${
                  isDark 
                    ? "bg-gray-900/80 border-gray-700" 
                    : "bg-white/80 border-gray-200"
               }`}>
                  {/* Dynamic Loader */}
                  <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-purple-500 animate-spin-reverse"></div>
                  </div>
                  
                  <div className="text-center space-y-1">
                      <p className={`font-bold text-lg animate-pulse ${
                          isDark ? "text-blue-400" : "text-blue-600"
                      }`}>
                          {loadingStep || `Generating ${mode === "flashcard" ? "Flashcards" : "Quiz"}...`}
                      </p>
                      <p className={`text-xs uppercase tracking-widest opacity-60 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                      }`}>
                          Please wait
                      </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                      <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ 
                              repeat: Infinity, 
                              duration: 1.5, 
                              ease: "linear" 
                          }}
                      />
                  </div>
               </div>
            ) : (
                <button
                    onClick={() => handleGenerate(false)}
                    disabled={(!file && !visionData)}
                    aria-label={`Generate ${mode === "flashcard" ? "Flashcards" : "Quiz"}`}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all relative overflow-hidden group ${
                    (!file && !visionData)
                        ? isDark
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {(!file && !visionData) ? (
                            "Select a File to Start"
                        ) : (
                            <>
                                <span>Generate {mode === "flashcard" ? "Flashcards" : "Quiz"}</span>
                                <span className="text-xl group-hover:translate-x-1 transition-transform">🚀</span>
                            </>
                        )}
                    </span>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                </button>
            )}
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`mt-8 flex flex-wrap gap-6 justify-center text-sm ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Smart Explanations</span>
          </div>
        </motion.div>
      </div>
      <BobAssistant 
        isOpen={isBobOpen} 
        onClose={() => setIsBobOpen(false)}
        customContext="You are Bob, an AI assistant helping users generate quizzes from their documents. Users can upload PDF or TXT files. You can explain how the generator works, troubleshoot issues, or give tips on good study materials. You are friendly and encouraging."
        initialMessage="Hi! I'm Bob. I can help you with the Quiz Generator. Need any tips on uploading files?"
      />

      <button
        onClick={() => setIsBobOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 group"
        title="Ask Bob"
      >
        <div className="text-2xl leading-none">🦁</div>
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with Bob
        </span>
      </button>
    </div>
  );
}
