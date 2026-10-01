"use client";

import { m } from "framer-motion";
import { Volume2, VolumeX, ShieldAlert, Sparkles, UserCheck, BarChart3 } from "lucide-react";

interface ScoreCardProps {
  score: number;
  isSpeaking: boolean;
  onSpeak: () => void;
}

export const ScoreCard = ({ score, isSpeaking, onSpeak }: ScoreCardProps) => {
  const getScoreRating = (s: number) => {
    if (s >= 85)
      return {
        label: "Elite Candidate",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
        recruiterScan: "Passed (High Signal)",
        recruiterColor: "text-emerald-600 dark:text-emerald-400",
        passRate: "88% Estimated",
        percentile: "Top 8%",
      };
    if (s >= 70)
      return {
        label: "Competitive Contender",
        color: "text-[#5e6ad2]",
        bg: "bg-[#5e6ad2]/10 border-[#5e6ad2]/20",
        recruiterScan: "Borderline Pass",
        recruiterColor: "text-[#5e6ad2]",
        passRate: "64% Estimated",
        percentile: "Top 28%",
      };
    if (s >= 50)
      return {
        label: "Needs Targeted Revision",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20",
        recruiterScan: "High Dropoff Risk",
        recruiterColor: "text-amber-600 dark:text-amber-400",
        passRate: "35% Estimated",
        percentile: "52nd Percentile",
      };
    return {
      label: "Major Overhaul Required",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      recruiterScan: "Likely 6s Rejection",
      recruiterColor: "text-rose-600 dark:text-rose-400",
      passRate: "<15% Estimated",
      percentile: "Bottom 20%",
    };
  };

  const rating = getScoreRating(score);

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="lg:col-span-4 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 flex flex-col justify-between shadow-surface relative overflow-hidden text-left"
    >
      <div>
        {/* Header with Live Audio Status */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-[#1a1a26] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-500 dark:text-[#8b8b9e]">
              Hireability Index
            </span>
          </div>

          <button
            onClick={onSpeak}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all active:scale-95 border ${
              isSpeaking
                ? "bg-orange-500/10 text-orange-500 border-orange-500/30 animate-pulse shadow-sm"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-[#101017] dark:hover:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] border-zinc-200 dark:border-[#1e1e2a] hover:text-zinc-900 dark:hover:text-[#ebebef]"
            }`}
            title={isSpeaking ? "Stop Voice Narration" : "Play Voice Narration"}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={13} className="text-orange-500" />
                <span className="text-orange-500 font-semibold">Speaking</span>
                <span className="flex gap-0.5 ml-0.5">
                  <span className="w-0.5 h-2.5 bg-orange-500 animate-pulse" />
                  <span className="w-0.5 h-3 bg-orange-500 animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-orange-500 animate-pulse delay-150" />
                </span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>Audio</span>
              </>
            )}
          </button>
        </div>

        {/* Big Score Number */}
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span
              className="text-5xl sm:text-6xl font-bold font-mono text-zinc-900 dark:text-[#ebebef] tracking-tight tabular-nums"
              aria-label={`Hireability score: ${score} out of 100`}
            >
              {score}
            </span>
            <span className="text-zinc-400 dark:text-[#5a5a6e] font-mono text-base font-normal">
              / 100
            </span>
          </div>

          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${rating.bg} ${rating.color}`}
          >
            {rating.label}
          </span>
        </div>

        {/* Precision Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div
            className="w-full h-2 bg-zinc-100 dark:bg-[#0f0f16] rounded-full overflow-hidden border border-zinc-200/80 dark:border-[#1a1a26]"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Hireability score"
          >
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
              className={`h-full rounded-full ${
                score >= 80
                  ? "bg-emerald-500"
                  : score >= 60
                  ? "bg-[#5e6ad2]"
                  : score >= 40
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
            />
          </div>
          <div className="flex justify-between text-[9.5px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Telemetry Matrix (Fills the previous empty space with high-value recruiter signals) */}
        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono mb-4">
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26] hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:-translate-y-0.5 transition-all duration-150 cursor-default">
            <div className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">6-SEC SCAN</div>
            <div className={`font-semibold mt-0.5 ${rating.recruiterColor}`}>
              {rating.recruiterScan}
            </div>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26] hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:-translate-y-0.5 transition-all duration-150 cursor-default">
            <div className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">PASS PROBABILITY</div>
            <div className="font-semibold text-zinc-800 dark:text-[#ebebef] mt-0.5">
              {rating.passRate}
            </div>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26] hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:-translate-y-0.5 transition-all duration-150 cursor-default">
            <div className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">CAMPUS PERCENTILE</div>
            <div className="font-semibold text-zinc-800 dark:text-[#ebebef] mt-0.5">
              {rating.percentile}
            </div>
          </div>
          <div className="p-2 rounded bg-zinc-50 dark:bg-[#0f0f16] border border-zinc-200/60 dark:border-[#1a1a26] hover:border-zinc-300 dark:hover:border-[#3a3a52] hover:-translate-y-0.5 transition-all duration-150 cursor-default">
            <div className="text-[9.5px] text-zinc-400 dark:text-[#5a5a6e]">EVALUATION ENGINE</div>
            <div className="font-semibold text-[#5e6ad2] mt-0.5">
              Dual ATS + LLM
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-100 dark:border-[#1a1a26] flex items-center justify-between text-[10.5px] font-mono text-zinc-400 dark:text-[#5a5a6e]">
        <span>MockMate Diagnostic Heuristic</span>
        <span>Standard 2026 Rubric</span>
      </div>
    </m.div>
  );
};
