"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ResumeUpload } from "@/components/career-path/ResumeUpload";
import { JobInput } from "@/components/career-path/JobInput";
import { AtsScoreResult } from "@/types/ats-score";
import { analyzeAtsScoreAction } from "@/app/actions/ats-score";
import { AtsScoreDashboard } from "@/components/career-path/AtsScoreDashboard";
import { FixSuggestions } from "@/components/career-path/FixSuggestions";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "Parsing resume structure...",
  "Running keyword matching algorithms...",
  "Analyzing formatting consistency...",
  "Evaluating metric density...",
  "Identifying structural weaknesses...",
  "Checking section headers...",
  "Finalizing optimization report...",
];

export default function AtsScorePage() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AtsScoreResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'analyzing') {
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleAnalyze = async (jobRole: string, company: string, jobDescription?: string) => {
    if (!file) return;

    setIsAnalyzing(true);
    setStep('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await analyzeAtsScoreAction(formData, jobDescription);
      
      if (response.error || !response.data) {
        throw new Error(response.error || "Analysis failed");
      }

      setResult(response.data);
      setStep('results');
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume.");
      setStep('upload');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStep('upload');
    setError(null);
  };

  return (
    <div className="min-h-screen relative bg-gray-950 text-white pt-24 px-4 sm:px-6">
      <NavigationPill showHome showBack />
      <HomeBackground />

      <div className="max-w-6xl mx-auto relative z-10 pb-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <m.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
          >
            ATS Score Optimizer
          </m.h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Beat the bots. Get a deep-dive analysis of how your resume performs in modern Applicant Tracking Systems.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <m.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {error && (
                <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              
              <ResumeUpload onUpload={handleUpload} />

              {file && (
                <JobInput 
                  onAnalyze={(role: string, company: string, jd?: string) => {
                    handleAnalyze(role, company, jd);
                  }}
                  isLoading={isAnalyzing}
                  hasFile={!!file}
                  buttonText="CALCULATE ATS SCORE"
                />
              )}
            </m.div>
          )}

          {step === 'analyzing' && (
            <m.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-40 h-40 mb-12">
                <m.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"
                />
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full"
                />
                <m.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-indigo-500/20 rounded-full border-t-indigo-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="w-12 h-12 text-blue-400 animate-pulse" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 italic">Neural ATS Scan</h3>
                <m.p
                  key={loadingIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]"
                >
                  {LOADING_MESSAGES[loadingIndex]}
                </m.p>
              </div>
            </m.div>
          )}

          {step === 'results' && result && (
            <m.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Analyze another resume</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase">
                  <Sparkles size={14} /> Full Report Ready
                </div>
              </div>

              <AtsScoreDashboard data={result} />
              <FixSuggestions suggestions={result.fixSuggestions} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
