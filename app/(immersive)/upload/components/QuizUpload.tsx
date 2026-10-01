"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  Sparkles,
  BookOpen,
  Layers,
  Gauge,
  Hash,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Bot,
  X,
  ChevronDown,
  Loader2,
  FileCheck
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  onClearFile?: () => void;
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
  onClearFile,
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
    <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-10 sm:py-16 relative z-10 w-full max-w-4xl mx-auto">
      {/* ── Precision Status Pill ── */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-xs font-mono font-medium tracking-wide shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
          <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">AI Document Synthesizer</span>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <span>PDF • DOCX • TXT Analysis</span>
        </div>
      </m.div>

      {/* ── Display Headline & Subtitle ── */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="text-center max-w-2xl mx-auto mb-8 space-y-2.5"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-[1.12]">
          Transform Documents into Interactive {mode === "flashcard" ? "Flashcards" : "Quizzes"}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
          Upload lecture notes, textbooks, or whitepapers. MockMate extracts key knowledge objectives and synthesizes verified assessment materials instantly.
        </p>
      </m.div>

      {/* ── Upload Card ── */}
      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6"
      >
        {/* Dropzone Container */}
        {file ? (
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0 text-left">
                <p className="font-semibold text-sm text-zinc-900 dark:text-[#ebebef] truncate">{file.name}</p>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 size={12} />
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for synthesis</span>
                </p>
              </div>
            </div>
            {onClearFile && (
              <button
                type="button"
                onClick={onClearFile}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Remove file"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="relative group border-2 border-dashed border-zinc-300 dark:border-[#2a2a3c] hover:border-[#5e6ad2] dark:hover:border-[#5e6ad2] bg-zinc-50/60 dark:bg-[#0d0d12]/50 hover:bg-zinc-100/70 dark:hover:bg-[#181824]/60 rounded-xl p-8 sm:p-10 transition-all text-center cursor-pointer">
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              aria-label="Upload document"
            />
            <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef]">
                Click to browse <span className="font-normal text-zinc-500 dark:text-zinc-400">or drag and drop</span>
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
                Supports PDF, DOCX, or TXT (up to 25MB)
              </p>
            </div>
          </div>
        )}

        {/* Tip Indicator */}
        <p className="text-xs text-center text-zinc-500 dark:text-[#8b8b9e] flex items-center justify-center gap-1.5 font-sans">
          <Sparkles size={12} className="text-[#5e6ad2] shrink-0" />
          <span>Tip: Text-selectable PDFs yield the fastest synthesis and highest question accuracy.</span>
        </p>

        {/* Error Alert */}
        {error && (
          <m.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-2"
          >
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </m.div>
        )}

        {/* ── Settings Grid (Mode, Difficulty, Count) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 border-t border-zinc-100 dark:border-[#1e1e2a]">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <BookOpen size={13} className="text-[#5e6ad2]" />
              <span>Mode</span>
            </label>
            <div className={cn(
              "flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] transition-opacity",
              isUploading && "opacity-50 pointer-events-none"
            )}>
              <button
                type="button"
                onClick={() => setMode("quiz")}
                disabled={isUploading}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  mode === "quiz"
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-[#ebebef]"
                )}
              >
                <FileCheck size={13} className={mode === "quiz" ? "text-[#5e6ad2]" : ""} />
                <span>Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("flashcard")}
                disabled={isUploading}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  mode === "flashcard"
                    ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-[#ebebef]"
                )}
              >
                <Layers size={13} className={mode === "flashcard" ? "text-amber-500" : ""} />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <Gauge size={13} className="text-[#5e6ad2]" />
              <span>Difficulty</span>
            </label>
            <div className={cn(
              "flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] transition-opacity",
              isUploading && "opacity-50 pointer-events-none"
            )}>
              {['easy', 'medium', 'hard'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  disabled={isUploading}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer",
                    difficulty === d
                      ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-[#ebebef]"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
              <Hash size={13} className="text-[#5e6ad2]" />
              <span>Question Count</span>
            </label>
            <div className={cn(
              "flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] transition-opacity",
              isUploading && "opacity-50 pointer-events-none"
            )}>
              {[5, 10, 15, 20].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  disabled={isUploading}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer",
                    count === c
                      ? "bg-white dark:bg-[#1e1e2a] text-zinc-900 dark:text-[#ebebef] shadow-subtle border border-zinc-200/80 dark:border-[#2a2a3c]"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-[#ebebef]"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Vision Fallback Offer ── */}
        <AnimatePresence>
          {visionData && !isUploading && (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-[#5e6ad2] flex items-center justify-center mx-auto">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-[#ebebef]">Enable AI Vision Engine?</h3>
                <p className="text-xs text-zinc-600 dark:text-[#8b8b9e] max-w-md mx-auto leading-relaxed mt-1">
                  Standard text extraction could not read the characters (likely a scanned image or photo). 
                  Our <b>AI Vision engine</b> can analyze page visuals to generate questions.
                </p>
              </div>
              <div className="flex gap-2.5 max-w-xs mx-auto pt-1">
                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  className="flex-1 py-2 px-3 bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white rounded-lg font-semibold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  Use Vision
                </button>
                <button
                  type="button"
                  onClick={() => setVisionData(null)}
                  className="flex-1 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* ── Optional Custom API Key Accordion ── */}
        <div className="pt-2">
          <details className="group border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-3.5 bg-zinc-50/50 dark:bg-[#0d0d12]/50 transition-colors">
            <summary className="text-xs font-semibold text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] cursor-pointer list-none flex items-center justify-between">
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-[#5e6ad2]" />
                <span>AI Engine & Custom Key Settings (Optional)</span>
              </span>
              <ChevronDown size={14} className="text-zinc-400 group-open:rotate-180 transition-transform" />
            </summary>
            
            <div className="mt-4 space-y-3.5 pt-3 border-t border-zinc-200/80 dark:border-[#1e1e2a]">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Inference Model</span>
                <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 dark:bg-[#14141e] rounded-lg border border-zinc-200 dark:border-[#1e1e2a]">
                  {[
                    { id: "auto", label: "Auto (Adaptive)" },
                    { id: "gemini", label: "Gemini 2.0" },
                    { id: "groq", label: "Groq Llama-3" },
                    { id: "openai", label: "OpenAI GPT-4o" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                        provider === p.id
                          ? "bg-white dark:bg-[#1e1e2a] text-[#5e6ad2] shadow-sm font-semibold"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Key Field */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Custom API Key</span>
                <input 
                  type="password" 
                  placeholder={
                    provider === "openai" ? "Paste OpenAI API Key (sk-...)" :
                    provider === "groq" ? "Paste Groq API Key (gsk_...)" :
                    provider === "gemini" ? "Paste Google Gemini API Key" :
                    "Optional: Leave empty to use system default keys"
                  }
                  className="w-full py-2 px-3 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-xs text-zinc-900 dark:text-[#ebebef] placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-[#5e6ad2] transition-colors"
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  aria-label="Custom API Key"
                />
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                  {provider === "auto" ? "Uses Gemini first with automatic fallback to Groq." :
                   provider === "groq" ? "Accelerated inference on Groq LPU hardware." :
                   provider === "openai" ? "Requires an active OpenAI platform API key." :
                   "Uses Google Gemini Flash LLM."}
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* ── Generate Action Button / Loading State ── */}
        <div className="pt-2">
          {isUploading ? (
            <div className="w-full p-5 rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#0d0d12] flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="text-[#5e6ad2] animate-spin" />
              <div className="text-center space-y-0.5">
                <p className="text-sm font-semibold text-zinc-900 dark:text-[#ebebef]">
                  {loadingStep || `Generating ${mode === "flashcard" ? "Flashcards" : "Quiz"}...`}
                </p>
                <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  MockMate AI Engine Active
                </p>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full max-w-xs h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                <m.div 
                  className="h-full bg-[#5e6ad2]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.2, 
                    ease: "easeInOut" 
                  }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={!file && !visionData}
              aria-label={`Generate ${mode === "flashcard" ? "Flashcards" : "Quiz"}`}
              className={cn(
                "w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-subtle",
                (!file && !visionData)
                  ? "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed"
                  : "bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white cursor-pointer active:scale-[0.99] shadow-md shadow-[#5e6ad2]/20"
              )}
            >
              <Sparkles size={16} />
              <span>
                {(!file && !visionData) 
                  ? "Select a Document to Begin" 
                  : `Synthesize ${mode === "flashcard" ? "Flashcards" : "Quiz"}`}
              </span>
            </button>
          )}
        </div>
      </m.div>

      {/* ── Feature Proof Strip (Homepage Consistency) ── */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-[#8b8b9e]"
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Rubric-Verified Answers</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#5e6ad2]" />
          <span>Sub-Second Document Parsing</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />
          <span>Bloom&apos;s Taxonomy Calibration</span>
        </div>
      </m.div>

      {/* Bob Assistant Integration */}
      <BobAssistant 
        isOpen={isBobOpen} 
        onClose={() => setIsBobOpen(false)}
        customContext="You are Bob, an AI assistant helping users generate quizzes from their documents. Users can upload PDF or TXT files. You can explain how the generator works, troubleshoot issues, or give tips on good study materials. You are friendly and encouraging."
        initialMessage="Hi! I'm Bob. I can help you with the Quiz Generator. Need any tips on uploading files?"
      />

      {/* Sleek Floating Copilot Pill */}
      <button
        type="button"
        onClick={() => setIsBobOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 dark:bg-[#14141e] hover:bg-zinc-800 dark:hover:bg-[#1e1e2a] text-zinc-100 border border-zinc-700/60 dark:border-[#2a2a3c] shadow-xl px-4 py-2.5 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-xs font-semibold cursor-pointer group"
        title="Ask Bob AI"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Bot className="w-4 h-4 text-[#5e6ad2]" />
        <span>Ask Bob AI</span>
      </button>
    </div>
  );
}
