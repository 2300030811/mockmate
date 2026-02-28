"use client";

import React, { useState } from 'react';
import { ResumeUpload } from '@/components/career-path/ResumeUpload';
import { JobInput } from '@/components/career-path/JobInput';
import { CareerDashboard } from '@/components/career-path/CareerDashboard';
import { HomeBackground } from "@/components/home/HomeBackground";
import { analyzeCareerPath } from '@/app/actions/career-analysis';
import { CareerAnalysisResult } from '@/types/career';
import { motion, AnimatePresence } from 'framer-motion';
import { saveCareerPath } from '@/app/actions/career-save';
import { getSessionId } from '@/utils/session';
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Home } from 'lucide-react';
import Link from 'next/link';
import { NavigationPill } from '@/components/ui/NavigationPill';

export default function CareerPathPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CareerAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

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

  const handleAnalyze = React.useCallback(async (jobRole: string, company: string) => {
    if (!file) return;

    setIsLoading(true);
    setStep('analysis');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const data = await analyzeCareerPath(formData, jobRole, company);
      setResult(data);
      // Auto-save to DB
      if (data) {
          await saveCareerPath(getSessionId(), data);
      }
      setStep('results');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume. Please try again.");
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const handleReset = React.useCallback(() => {
    setFile(null);
    setResult(null);
    setStep('upload');
  }, []);

  return (
    <div className="min-h-screen relative transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-24 px-4 sm:px-6">
       
      {/* Navigation Pill */}
      <NavigationPill variant="dark" />
       
       <HomeBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12 text-center text-balance">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-purple-600 dark:text-purple-400" />
            AI Career Pathfinder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-medium">
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
                <div className="relative w-32 h-32 mb-10">
                   {/* Neural Pulse Circles */}
                   <motion.div 
                     animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"
                   />
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-full"
                   />
                   <motion.div 
                     animate={{ rotate: -360 }}
                     transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-4 border border-blue-500/20 rounded-full border-t-blue-500"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
                   </div>
                </div>

                <div className="text-center space-y-4">
                   <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">
                      Neural Career Mapping
                   </h3>
                   <div className="flex flex-col items-center gap-2">
                      <motion.p 
                         key={messageIndex}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-purple-600 dark:text-purple-400 font-bold uppercase tracking-[0.2em] text-[10px]"
                      >
                         {['Deconstructing Resume...', 'Mapping Market Trends...', 'Simulating Growth Paths...', 'Finalizing Roadmap...'][messageIndex]}
                      </motion.p>
                      <div className="w-48 h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                         />
                      </div>
                   </div>
                </div>
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
