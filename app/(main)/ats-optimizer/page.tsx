"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, Sparkles, AlertCircle, Brain } from "lucide-react";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ResumeUpload } from "@/components/career-path/ResumeUpload";
import { JobInput } from "@/components/career-path/JobInput";
import { DeepEvalResult } from "@/types/deep-eval";
import { analyzeDeepEvalAction } from "@/app/actions/deep-eval";
import { DeepEvalDashboard } from "@/components/career-path/DeepEvalDashboard";

const LOADING_MESSAGES = [
  "Parsing resume structure...",
  "Fetching GitHub profile data...",
  "Running hiring-agent evaluation...",
  "Scoring open source contributions...",
  "Assessing project complexity...",
  "Reviewing production experience...",
  "Calculating bonus points and deductions...",
  "Finalizing resume score...",
];

export default function AtsOptimizerPage() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DeepEvalResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (step === 'analyzing') {
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleAnalyze = async (jobRole: string, company: string, jobDescription?: string) => {
    if (!file) return;

    setIsAnalyzing(true);
    setStep('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await analyzeDeepEvalAction(
        formData,
        jobRole,
        company,
        jobDescription
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Analysis failed. Please try again.");
      }

      setResult(response.data);
      setStep('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume.");
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
    setLoadingIndex(0);
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
            Score your resume with the hiring-agent evaluation engine: projects, production, open source, skills, bonus points, and deductions in one report.
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
              
              <ResumeUpload onUpload={handleUpload} onRemove={handleRemoveFile} />

              {file && (
                <JobInput 
                  onAnalyze={(role: string, company: string, jd?: string) => {
                    handleAnalyze(role, company, jd);
                  }}
                  isLoading={isAnalyzing}
                  hasFile={!!file}
                  buttonText="ANALYZE RESUME"
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
                  animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute inset-0 bg-purple-500/15 rounded-full blur-3xl"
                />
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full"
                />
                <m.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-purple-500/20 rounded-full border-t-purple-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Target className="w-10 h-10 text-blue-400 animate-pulse" />
                    <Brain className="w-6 h-6 text-purple-400 absolute -bottom-1 -right-1 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1 italic">Hiring Agent Engine</h3>
                <p className="text-gray-500 text-xs mb-4">Running one consolidated resume score</p>
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
              className="space-y-16"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Analyze another resume</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase">
                  <Sparkles size={14} />
                  Resume Score Ready
                </div>
              </div>

              <DeepEvalDashboard data={result} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
