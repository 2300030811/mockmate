"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Briefcase,
  BookmarkPlus,
  Loader2,
  ShieldCheck,
  Zap,
  BrainCircuit,
  CheckCircle2,
  Download,
  Building2,
  Layers,
} from 'lucide-react';
import { ResumeUpload } from '@/components/career-path/ResumeUpload';
import { JobInput } from '@/components/career-path/JobInput';
import { CareerDashboard } from '@/components/career-path/CareerDashboard';
import { HomeBackground } from "@/components/home/HomeBackground";
import { analyzeCareerPath } from '@/app/actions/career-analysis';
import { CareerAnalysisResult } from '@/types/career';
import { saveCareerPath } from '@/app/actions/career-save';
import { addCareerPathToTracker } from '@/app/actions/career-ops';
import { analyzeAtsScoreAction } from '@/app/actions/ats-score';
import { AtsScoreResult } from '@/types/ats-score';
import { exportRoadmapToMarkdown } from '@/lib/career-path/export-markdown';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

const ANALYSIS_STEPS = [
  "Extracting technical competencies & career trajectory...",
  "Calibrating market readiness against industry benchmarks...",
  "Running ATS compatibility & keyword alignment...",
  "Synthesizing customized milestone learning roadmap..."
];

export default function CareerPathPage() {
  const [step, setStep] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CareerAnalysisResult | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [trackerFeedback, setTrackerFeedback] = useState<string | null>(null);
  const [trackerRefreshSignal, setTrackerRefreshSignal] = useState(0);

  // ATS Retry & Diagnostic State
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [lastJobRole, setLastJobRole] = useState<string>('');
  const [lastCompany, setLastCompany] = useState<string>('');
  const [lastJobDescription, setLastJobDescription] = useState<string>('');

  useEffect(() => {
    if (step === 'analysis') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleUpload = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleAnalyze = useCallback(async (jobRole: string, company: string, jobDescription?: string) => {
    if (!file) return;

    setIsLoading(true);
    setStep('analysis');
    setError(null);
    setTrackerFeedback(null);
    setAtsError(null);

    setLastJobRole(jobRole);
    setLastCompany(company);
    setLastJobDescription(jobDescription || '');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Analyze Career Roadmap and ATS Optimization in parallel
      const [careerPromise, atsPromise] = await Promise.allSettled([
        analyzeCareerPath(formData, jobRole, company, jobDescription),
        analyzeAtsScoreAction(formData, jobRole, company, jobDescription)
      ]);

      if (careerPromise.status === 'rejected') {
        throw new Error(careerPromise.reason);
      }

      const careerData = careerPromise.value;
      setResult(careerData);

      if (atsPromise.status === 'fulfilled') {
        if (atsPromise.value?.data) {
          setAtsResult(atsPromise.value.data);
        } else if (atsPromise.value?.error) {
          console.warn("ATS Analysis returned error:", atsPromise.value.error);
          setAtsError(atsPromise.value.error);
        }
      } else if (atsPromise.status === 'rejected') {
        console.warn("ATS Analysis failed while Career Analysis succeeded:", atsPromise.reason);
        setAtsError(atsPromise.reason?.message || "ATS optimization request timed out or hit rate limits.");
      }

      // Auto-save to DB
      if (careerData) {
        const saveResult = await saveCareerPath(careerData);
        if (!saveResult.success && saveResult.error === "Authentication required to save career paths") {
          logger.info("Guest user — career path not saved");
        }
      }
      setStep('results');
    } catch (err: any) {
      console.error(err);
      const isInvalid = err?.message?.includes('INVALID_ROLE') || err?.toString().includes('INVALID_ROLE');
      setError(
        isInvalid 
          ? "The AI determined that the target job role is invalid or non-existent. Please try again with a real profession." 
          : "Failed to analyze resume. Please verify the document format and try again."
      );
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const handleRetryAts = useCallback(async (customJobDesc?: string) => {
    if (!file) {
      toast.error("Resume file reference missing. Please re-upload resume.");
      return;
    }

    setIsAnalyzingAts(true);
    setAtsError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const targetJobDesc = customJobDesc !== undefined ? customJobDesc : lastJobDescription;
      if (customJobDesc !== undefined) {
        setLastJobDescription(customJobDesc);
      }

      const res = await analyzeAtsScoreAction(formData, lastJobRole, lastCompany, targetJobDesc);
      if (res.data) {
        setAtsResult(res.data);
        toast.success("ATS keyword optimization diagnostics generated!");
      } else {
        setAtsError(res.error || "Unable to generate ATS report. Please retry.");
        toast.error(res.error || "ATS analysis failed");
      }
    } catch (err: any) {
      const msg = err?.message || "Error running ATS analysis";
      setAtsError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzingAts(false);
    }
  }, [file, lastJobRole, lastCompany, lastJobDescription]);

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setAtsResult(null);
    setAtsError(null);
    setIsAnalyzingAts(false);
    setLastJobRole('');
    setLastCompany('');
    setLastJobDescription('');
    setTrackerFeedback(null);
    setStep('upload');
  }, []);

  const handleTrackRole = useCallback(async () => {
    if (!result) return;

    setIsTracking(true);
    setTrackerFeedback(null);

    try {
      const tracked = await addCareerPathToTracker({
        jobRole: result.jobRole,
        company: result.company,
        matchScore: result.matchScore,
        atsScore: atsResult?.atsScore ?? null,
        targetLevel: result.levelStrategy?.detectedLevel,
        missingSkills: result.missingSkills,
      });

      if (!tracked.success) {
        setTrackerFeedback(tracked.error || "Could not add this role to tracker.");
        return;
      }

      const nextFollowUp = tracked.data?.nextFollowUpDate
        ? ` Next follow-up: ${tracked.data.nextFollowUpDate}.`
        : "";
      const atsSnapshot = atsResult
        ? ` ATS ${atsResult.atsScore}/100 (${atsResult.matchRating}).`
        : "";

      setTrackerFeedback(`Role saved to pipeline tracker.${atsSnapshot}${nextFollowUp}`);
      setTrackerRefreshSignal((value) => value + 1);
    } catch (trackError) {
      console.error(trackError);
      setTrackerFeedback("Could not add this role to tracker.");
    } finally {
      setIsTracking(false);
    }
  }, [result, atsResult]);

  const handleDownloadMarkdown = useCallback(() => {
    if (result) {
      exportRoadmapToMarkdown(result);
      toast.success("Career Dossier exported as Markdown.");
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 pt-14 pb-20 transition-colors overflow-x-hidden">
      {/* 28px Precision Grid & Horizon Illumination */}
      <HomeBackground />

      {/* Main Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* ──────────────────────────────────────────────────────────
              1. INPUT & SYNTHESIS VIEW (De-Clustered Unified Flow)
             ────────────────────────────────────────────────────────── */}
          {step === 'upload' && (
            <m.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {/* Precision Status Pill */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] text-xs font-mono font-medium shadow-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
                  <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">AI Career Pathfinder</span>
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span>Resume & Target Role Synthesis</span>
                </div>
              </div>

              {/* Display Headline */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-[1.12]">
                  Map Your Career Trajectory
                </h1>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-[#8b8b9e] max-w-xl mx-auto leading-relaxed">
                  Upload your resume and choose your target position. MockMate calculates your readiness score, uncovers critical skill gaps, and synthesizes a step-by-step career progression roadmap.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Unified Bento Synthesis Container */}
              <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6">
                {/* Resume Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center justify-between">
                    <span>1. Upload Candidate Resume (PDF)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Max 10MB</span>
                  </label>
                  <ResumeUpload onUpload={handleUpload} onRemove={handleRemoveFile} />
                </div>

                {/* Target Role & Description Form */}
                <div className="pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
                  <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] block mb-2">
                    2. Target Position Calibration
                  </label>
                  <JobInput
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    hasFile={!!file}
                  />
                </div>
              </div>

              {/* Feature Proof Strip (Homepage Consistency) */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-[#8b8b9e] pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Salary Datasets</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#5e6ad2]" />
                  <span>Sub-Second ATS Keyword Match</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />
                  <span>Phased Skill Gap Milestones</span>
                </div>
              </div>
            </m.div>
          )}

          {/* ──────────────────────────────────────────────────────────
              2. REAL-TIME ANALYSIS TELEMETRY VIEW
             ────────────────────────────────────────────────────────── */}
          {step === 'analysis' && (
            <m.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="py-20 sm:py-28 flex flex-col items-center justify-center text-center"
            >
              <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] shadow-subtle flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="text-[#5e6ad2] animate-spin" />
                
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-[#ebebef]">
                    Synthesizing Career Roadmap
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] min-h-[20px] font-mono transition-all">
                    {ANALYSIS_STEPS[messageIndex]}
                  </p>
                </div>

                {/* Linear Progress Beam */}
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-[#0d0d12] rounded-full overflow-hidden mt-2 border border-zinc-200/80 dark:border-[#1e1e2a]">
                  <m.div
                    className="h-full bg-[#5e6ad2]"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </m.div>
          )}

          {/* ──────────────────────────────────────────────────────────
              3. DE-CLUSTERED RESULTS DASHBOARD VIEW
             ────────────────────────────────────────────────────────── */}
          {step === 'results' && result && (
            <m.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Executive Role Dossier Hero Banner */}
              <div className="relative rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] p-6 sm:p-8 shadow-subtle overflow-hidden">
                {/* Subtle Horizon Glow Accent */}
                <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-[#5e6ad2]/10 via-[#5e6ad2]/5 to-transparent blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Column: Role Identity & Context Badges */}
                  <div className="space-y-3">
                    {/* Navigation Breadcrumb & Live Status */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={12} />
                        <span>Career Pathfinder</span>
                      </button>
                      <span className="text-zinc-300 dark:text-zinc-700">/</span>
                      <span className="text-zinc-900 dark:text-[#ebebef] font-semibold">Intelligence Dossier</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Calibrated</span>
                    </div>

                    {/* Prominent Role Title */}
                    <div className="space-y-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] capitalize leading-tight">
                        {result.jobRole}
                      </h1>
                      {result.competitiveEdge && (
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] max-w-2xl leading-relaxed line-clamp-2">
                          {result.competitiveEdge}
                        </p>
                      )}
                    </div>

                    {/* Metadata Badges Strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#1a1a28] border border-zinc-200 dark:border-[#26263a] text-xs font-medium text-zinc-700 dark:text-[#a0a0b8]">
                        <Building2 size={13} className="text-[#5e6ad2]" />
                        <span>{result.company ? `@ ${result.company}` : "Market Standard"}</span>
                      </div>

                      {result.levelStrategy?.detectedLevel && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#1a1a28] border border-zinc-200 dark:border-[#26263a] text-xs font-medium text-zinc-700 dark:text-[#a0a0b8]">
                          <Layers size={13} className="text-indigo-400" />
                          <span>{result.levelStrategy.detectedLevel}</span>
                        </div>
                      )}

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={13} />
                        <span>Verified from Resume</span>
                      </div>

                      {result.marketInsights?.demand && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#1a1a28] border border-zinc-200 dark:border-[#26263a] text-xs font-medium text-zinc-700 dark:text-[#a0a0b8]">
                          <Zap size={13} className="text-amber-500" />
                          <span className="capitalize">{result.marketInsights.demand} Market Demand</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Readiness Score Callout & Executive Toolbar */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0 border-t lg:border-t-0 border-zinc-100 dark:border-[#1e1e2a] pt-4 lg:pt-0">
                    {/* Compact Readiness Dial Box */}
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0d0d12] border border-zinc-200/80 dark:border-[#1e1e2a]">
                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
                          Match Readiness
                        </div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef]">
                          {result.matchScore >= 80 ? "Elite Match" : result.matchScore >= 60 ? "Competitive" : "Developing"}
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#5e6ad2]">
                        {result.matchScore}%
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] border border-zinc-200 dark:border-[#1e1e2a] transition-all cursor-pointer"
                        title="Upload a new resume or analyze another position"
                      >
                        <ArrowLeft size={13} />
                        <span>New Analysis</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadMarkdown}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-[#ebebef] bg-white dark:bg-[#1a1a28] hover:bg-zinc-100 dark:hover:bg-[#252538] border border-zinc-200 dark:border-[#26263a] transition-all cursor-pointer shadow-sm"
                        title="Download complete roadmap and gap report as Markdown"
                      >
                        <Download size={13} />
                        <span>Export Dossier</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTrackRole}
                        disabled={isTracking}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5e6ad2] hover:bg-[#4f5ac4] disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 shadow-[#5e6ad2]/20"
                      >
                        {isTracking ? <Loader2 size={13} className="animate-spin" /> : <BookmarkPlus size={13} />}
                        <span>{isTracking ? 'Saving...' : 'Track in Pipeline'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Alert */}
              {trackerFeedback && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{trackerFeedback}</span>
                </div>
              )}

              {/* Unified De-Clustered Dashboard */}
              <CareerDashboard
                data={result}
                atsData={atsResult || undefined}
                trackerRefreshSignal={trackerRefreshSignal}
                isAnalyzingAts={isAnalyzingAts}
                atsError={atsError}
                onRetryAts={handleRetryAts}
                hasJobDescription={Boolean(lastJobDescription && lastJobDescription.trim().length > 0)}
              />
            </m.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
