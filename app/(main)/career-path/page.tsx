"use client";

import React, { useState } from 'react';
import { ResumeUpload } from '@/components/career-path/ResumeUpload';
import { JobInput } from '@/components/career-path/JobInput';
import { CareerDashboard } from '@/components/career-path/CareerDashboard';
import { HomeBackground } from "@/components/home/HomeBackground";
import { analyzeCareerPath } from '@/app/actions/career-analysis';
import { CareerAnalysisResult } from '@/types/career';
import { m, AnimatePresence } from 'framer-motion';
import { saveCareerPath } from '@/app/actions/career-save';
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Home, Target } from 'lucide-react';
import Link from 'next/link';
import { NavigationPill } from '@/components/ui/NavigationPill';
import { analyzeAtsScoreAction } from '@/app/actions/ats-score';
import { AtsScoreResult } from '@/types/ats-score';
import { AtsScoreDashboard } from '@/components/career-path/AtsScoreDashboard';
import { FixSuggestions } from '@/components/career-path/FixSuggestions';

export default function CareerPathPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CareerAnalysisResult | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (step === 'analysis') {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % 4);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleUpload = React.useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
  }, []);

  const handleAnalyze = React.useCallback(async (jobRole: string, company: string, jobDescription?: string) => {
    if (!file) return;

    setIsLoading(true);
    setStep('analysis');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Analyze Career Roadmap and ATS Optimization in parallel
      const [careerPromise, atsPromise] = await Promise.allSettled([
        analyzeCareerPath(formData, jobRole, company),
        analyzeAtsScoreAction(formData, jobRole, company, jobDescription)
      ]);

      if (careerPromise.status === 'rejected') {
        throw new Error(careerPromise.reason);
      }

      const careerData = careerPromise.value;
      setResult(careerData);

      if (atsPromise.status === 'fulfilled' && atsPromise.value?.data) {
        setAtsResult(atsPromise.value.data);
      } else if (atsPromise.status === 'rejected') {
        console.warn("ATS Analysis failed while Career Analysis succeeded:", atsPromise.reason);
      }

      // Auto-save to DB
      if (careerData) {
        const saveResult = await saveCareerPath(careerData);
        if (!saveResult.success && saveResult.error === "Authentication required to save career paths") {
          console.info("Guest user — career path not saved");
        }
      }
      setStep('results');
    } catch (error) {
      console.error(error);
      setError("Failed to analyze resume. Please try again.");
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const handleReset = React.useCallback(() => {
    setFile(null);
    setResult(null);
    setAtsResult(null);
    setStep('upload');
  }, []);

  return (
    <div className="min-h-screen relative transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-24 px-4 sm:px-6">

      {/* Navigation Pill */}
      <NavigationPill />

      <HomeBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12 text-center text-balance">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-blue-500 w-8 h-8" />
            AI Career Pathfinder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Upload your resume, tell us your dream job, and let AI build your personalized roadmap to success.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {error && (
                <div className="max-w-2xl mx-auto mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}
              <ResumeUpload onUpload={handleUpload} />

              {file && (
                <JobInput
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  hasFile={!!file}
                />
              )}
            </m.div>
          )}

          {step === 'analysis' && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative flex items-center justify-center w-24 h-24 mb-8">
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full border-t-blue-500 dark:border-t-blue-500"
                />
                <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Analyzing Your Profile
                </h3>
                <div className="flex flex-col items-center gap-3">
                  <m.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-500 dark:text-gray-400 font-medium text-sm"
                  >
                    {['Extracting skills and experience...', 'Aligning with market trends...', 'Generating ATS optimization plan...', 'Building career roadmap...'][messageIndex]}
                  </m.p>
                </div>
              </div>
            </m.div>
          )}

          {step === 'results' && result && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all font-medium"
                >
                  <ArrowLeft size={18} />
                  Analyze another role
                </button>
              </div>

              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                <div className="text-center mb-10 text-balance">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Career Roadmap & Insights
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                    Your long-term upskilling and career progression path, generated based on your gap analysis.
                  </p>
                </div>
                <CareerDashboard data={result} atsData={atsResult || undefined} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
