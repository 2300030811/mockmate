"use client";

import React, { useState } from 'react';
import { ResumeUpload } from '@/components/career-path/ResumeUpload';
import { JobInput } from '@/components/career-path/JobInput';
import { CareerDashboard } from '@/components/career-path/CareerDashboard';
import { HomeBackground } from "@/components/home/HomeBackground";
import { analyzeCareerPath } from '@/app/actions/career-analysis';
import { CareerAnalysisResult } from '@/types/career';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { saveCareerPath } from '@/app/actions/career-save';
import { getSessionId } from '@/utils/session';

export default function CareerPathPage() {
  const [step, setStep] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CareerAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
  };

  const handleAnalyze = async (jobRole: string, company: string) => {
    if (!file) return;

    setIsLoading(true);
    setStep('analysis');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const data = await analyzeCareerPath(formData, jobRole, company);
      setResult(data);
      // Auto-save to DB
      saveCareerPath(getSessionId(), data);
      setStep('results');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume. Please try again.");
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen relative transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-24 px-4 sm:px-6">
       <HomeBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-purple-600 dark:text-purple-400" />
            AI Career Pathfinder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your resume, tell us your dream job, and let AI build your personalized roadmap to success.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <ResumeUpload onUpload={handleUpload} />
              
              {file && (
                <JobInput 
                  onAnalyze={handleAnalyze} 
                  isLoading={isLoading} 
                  hasFile={!!file}
                />
              )}
            </motion.div>
          )}

          {step === 'analysis' && (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
             >
                <div className="w-24 h-24 border-4 border-purple-200 dark:border-purple-500/30 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin mb-8" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Analyzing Profile...</h3>
                <p className="text-gray-600 dark:text-gray-400 animate-pulse">
                   Mapping skills, identifying gaps, and building your roadmap.
                </p>
             </motion.div>
          )}

          {step === 'results' && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button 
                onClick={handleReset}
                className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <ArrowLeft size={18} />
                Analyze another role
              </button>
              <CareerDashboard data={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
