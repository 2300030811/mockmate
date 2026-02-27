"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  analyzeProjectCode,
  AnalysisResult,
  ScoreBreakdown,
} from "@/app/actions/project-analysis";
import ReactMarkdown from "react-markdown";
import {
  BrainCircuit,
  Loader2,
  Sparkles,
  Lightbulb,
  Activity,
  Copy,
  Check,
  Target,
  Code2,
  Shield,
  CheckCircle2,
  AlertCircle,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectInsightsProps {
  files: Record<string, any>;
  description: string;
  challengeContext?: {
    difficulty?: "Easy" | "Medium" | "Hard";
    hints?: string[];
    expertSolution?: string;
    validationRegex?: Record<string, string>;
    readOnlyFiles?: string[];
  };
  autoTrigger?: boolean;
  onTriggered?: () => void;
}

const dimensionConfig = [
  { key: "correctness" as const, label: "Correctness", icon: Target, color: "blue" },
  { key: "codeQuality" as const, label: "Code Quality", icon: Code2, color: "purple" },
  { key: "bestPractices" as const, label: "Best Practices", icon: Shield, color: "amber" },
  { key: "completeness" as const, label: "Completeness", icon: CheckCircle2, color: "emerald" },
];

const colorMap: Record<string, { bg: string; fill: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", fill: "bg-blue-500", text: "text-blue-500" },
  purple: { bg: "bg-purple-500/10", fill: "bg-purple-500", text: "text-purple-500" },
  amber: { bg: "bg-amber-500/10", fill: "bg-amber-500", text: "text-amber-500" },
  emerald: { bg: "bg-emerald-500/10", fill: "bg-emerald-500", text: "text-emerald-500" },
};

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalDuration = 1000;
    let startTime = performance.now();

    const animate = (now: number) => {
      let elapsed = now - startTime;
      let progress = Math.min(elapsed / totalDuration, 1);

      // Power 4 out easing
      const ease = 1 - Math.pow(1 - progress, 4);

      const current = Math.floor(ease * (end - start) + start);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
}

export function ProjectInsights({
  files,
  description,
  challengeContext,
  autoTrigger,
  onTriggered
}: ProjectInsightsProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadingMessages = [
    "Initializing Staff Engineer...",
    "Scanning code structure...",
    "Comparing against solution patterns...",
    "Evaluating correctness & edge cases...",
    "Assessing code quality & best practices...",
    "Computing multi-dimensional score...",
  ];

  const handleAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setLoadingStep(0);

    // Animate loading steps
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      // Convert Sandpack files to simplified format
      const simplifiedFiles = Object.entries(files).reduce(
        (acc: any, [key, val]) => {
          acc[key] = { code: val.code };
          return acc;
        },
        {},
      );

      const data = await analyzeProjectCode(simplifiedFiles, description, challengeContext);

      if (data.error && !data.markdown) {
        setError(data.error);
      } else {
        setResult(data);
        setHistory(prev => [data, ...prev.slice(0, 4)]); // Keep last 5
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reach AI service. Please check your connection.");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  }, [files, description, challengeContext]);

  // Handle auto-trigger
  useEffect(() => {
    if (autoTrigger && !isAnalyzing) {
      handleAnalysis();
      onTriggered?.();
    }
  }, [autoTrigger, isAnalyzing, handleAnalysis, onTriggered]);

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
    setIsCopied(true);
    toast.success("Analysis copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return "text-green-500";
    if (score > 60) return "text-amber-500";
    if (score > 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBarColor = (score: number) => {
    if (score > 80) return "bg-green-500";
    if (score > 60) return "bg-amber-500";
    if (score > 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getVerdict = (score: number) => {
    if (score > 85) return "Excellent Work";
    if (score > 70) return "Good Progress";
    if (score > 50) return "Needs Improvement";
    if (score > 30) return "Keep Working";
    return "Not Started";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Hard": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="text-purple-500" />
          AI Code Review
        </h3>
        <div className="flex items-center gap-2">
          {result && !isAnalyzing && (
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
              title="Copy Analysis"
            >
              {isCopied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          )}
          {!isAnalyzing && (
            <button
              onClick={handleAnalysis}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
            >
              <Sparkles size={14} />
              {result ? (error ? "Try Again" : "Re-Analyze") : "Run Analysis"}
            </button>
          )}
        </div>
      </div>

      {isAnalyzing ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 animate-fadeIn">
          <div className="relative mb-6">
            <Loader2 size={48} className="text-purple-500 animate-spin" />
            <BrainCircuit className="absolute inset-0 m-auto text-purple-600 w-6 h-6 animate-pulse" />
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-white mb-1 whitespace-nowrap">
            {loadingMessages[loadingStep]}
          </p>
          <div className="flex items-center gap-1.5">
            {loadingMessages.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= loadingStep ? "bg-purple-500 scale-x-110" : "bg-gray-200 dark:bg-gray-800"}`}
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-xl space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-2">
            <h4 className="text-gray-900 dark:text-white font-bold">Analysis Failed</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {error}
            </p>
          </div>
          <button
            onClick={handleAnalysis}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-red-500/20"
          >
            Retry Analysis
          </button>
        </div>
      ) : result ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 animate-fadeIn">
          {/* History / Comparison Bar */}
          {history.length > 1 && (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto whitespace-nowrap no-scrollbar">
              <History size={14} className="text-gray-400 shrink-0" />
              <div className="flex items-center gap-2">
                {history.slice(0, 5).map((item, i) => {
                  const isCurrent = i === 0;
                  const prev = history[i + 1];
                  const diff = prev ? item.score - prev.score : 0;

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all ${isCurrent ? "bg-purple-600 text-white border-purple-500" : "bg-gray-50 dark:bg-white/5 text-gray-400 border-transparent"}`}
                    >
                      Attempt {history.length - i}
                      <span className="opacity-60">•</span>
                      {item.score}%
                      {diff !== 0 && (
                        <span className={`ml-0.5 flex items-center ${diff > 0 ? (isCurrent ? "text-green-300" : "text-green-500") : (isCurrent ? "text-red-300" : "text-red-500")}`}>
                          {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {Math.abs(diff)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overall Score Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Activity size={100} />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Overall Score
                  </div>
                  {challengeContext?.difficulty && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${getDifficultyColor(challengeContext.difficulty)}`}>
                      {challengeContext.difficulty}
                    </span>
                  )}
                </div>
                <div className={`text-4xl font-black ${getScoreColor(result.score)} flex items-baseline gap-1`}>
                  <AnimatedNumber value={result.score} />
                  <span className="text-sm opacity-50 uppercase tracking-tighter">/100</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-bold">
                  Verdict
                </div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {getVerdict(result.score)}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.score}%` }}
                transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                className={`h-full rounded-full ${getScoreBarColor(result.score)}`}
              ></motion.div>
            </div>
          </div>

          {/* Multi-Dimensional Breakdown */}
          {result.breakdown && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">
                Score Breakdown
              </div>
              <div className="space-y-3">
                {dimensionConfig.map(({ key, label, icon: Icon, color }, index) => {
                  const val = result.breakdown[key];
                  const colors = colorMap[color];
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg} shrink-0`}>
                        <Icon size={14} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                          <span className={`text-xs font-black ${getScoreColor(val)}`}>
                            {val}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 1, delay: 0.1 * (index + 1), ease: "easeOut" }}
                            className={`h-full rounded-full ${colors.fill}`}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Markdown Analysis content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                ul: ({ ...props }) => (
                  <ul className="space-y-2 my-4" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="flex gap-2 items-start text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 block"></span>
                    <span {...props} />
                  </li>
                ),
                strong: ({ ...props }) => (
                  <strong
                    className="font-bold text-gray-900 dark:text-white"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-sm font-bold uppercase tracking-wider text-gray-500 mt-6 mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-sm font-bold uppercase tracking-wider text-gray-500 mt-6 mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2"
                    {...props}
                  />
                ),
              }}
            >
              {result.markdown}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Lightbulb size={24} />
          </div>
          <h4 className="text-gray-900 dark:text-white font-medium mb-2">
            Ready for Review?
          </h4>
          <p className="text-sm text-gray-500 max-w-xs">
            Click &quot;Run Analysis&quot; to let our AI scan your code for
            potential bugs, improvements, and styling issues.
          </p>
        </div>
      )}
    </div>
  );
}
