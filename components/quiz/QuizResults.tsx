
import React from "react";
import { m } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { NicknamePrompt } from "./NicknamePrompt";
import { QuizMode, QuizAnswer } from "@/types";

interface QuizResultsProps {
  category: string;
  mode: QuizMode;
  stats: {
    passed: boolean;
    correct: number;
    wrong: number;
    attempted: number;
    skipped: number;
    percentage: string;
  };
  questionsLength: number;
  userAnswers: Record<string | number, QuizAnswer>;
  onReview: () => void;
  onRetake: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  category,
  mode,
  stats,
  questionsLength,
  userAnswers,
  onReview,
  onRetake,
}) => {
  const router = useRouter();

  const StatTile = ({
    label,
    value,
    subtext,
    colorClass,
    delay,
  }: {
    label: string;
    value: string | number;
    subtext: string;
    colorClass?: string;
    delay: number;
  }) => (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] text-left transition-colors hover:border-zinc-300 dark:hover:border-[#28283a]"
    >
      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84] mb-1">
        {label}
      </p>
      <p className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${colorClass || "text-zinc-900 dark:text-[#ebebef]"}`}>
        {value}
      </p>
      <p className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] mt-0.5 truncate">
        {subtext}
      </p>
    </m.div>
  );

  const numericPercentage = parseFloat(stats.percentage) || 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative overflow-hidden">
      {/* Background ambient grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27273a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Double bezel hardware card container */}
      <m.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative z-10 w-full max-w-2xl rounded-2xl p-1 bg-zinc-200/60 dark:bg-[#1a1a24] border border-zinc-200 dark:border-[#222230] shadow-2xl"
      >
        <div className="rounded-[14px] bg-white dark:bg-[#12121a] p-6 sm:p-8 md:p-9 border border-zinc-100 dark:border-[#1e1e2c]">
          {/* Top Hardware Terminal Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200/80 dark:border-[#1e1e2a]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2e2e42]" />
                <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2e2e42]" />
                <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-[#2e2e42]" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] ml-2">
                {category.toUpperCase()} {"//"} {mode.toUpperCase()} EVALUATION
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wider ${
                stats.passed
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              {stats.passed ? `PASSED • ${stats.percentage}%` : `FAILED • ${stats.percentage}%`}
            </span>
          </div>

          {/* Outcome Status Badge */}
          <div className="text-center mb-5">
            <m.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border transition-all ${
                stats.passed
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 shadow-md shadow-emerald-500/10"
                  : "bg-rose-500/10 border-rose-500/25 text-rose-500 shadow-md shadow-rose-500/10"
              }`}
            >
              {stats.passed ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </m.div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-[#ebebef]">
              {stats.passed ? "Examination Passed!" : "Keep Practicing!"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] max-w-md mx-auto mt-1">
              You&apos;ve completed the {category.toUpperCase()} {mode} assessment session. Minimum passing benchmark is 70.0%.
            </p>
          </div>

          {/* Benchmark Gauge Comparison */}
          <div className="mb-5 p-3.5 rounded-xl bg-zinc-50 dark:bg-[#101017] border border-zinc-200 dark:border-[#1e1e2a] text-left">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-zinc-500 dark:text-[#8b8b9e]">Score vs. Target Threshold</span>
              <span className={`font-semibold tabular-nums ${stats.passed ? "text-emerald-500" : "text-rose-500"}`}>
                {stats.percentage}% (Min. 70.0%)
              </span>
            </div>
            <div className="relative h-2 w-full bg-zinc-200 dark:bg-[#181824] rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-amber-400 z-10"
                title="Passing threshold: 70%"
              />
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  stats.passed ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(2, numericPercentage))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 dark:text-[#6e6e84] mt-1.5">
              <span>0%</span>
              <span className="text-amber-500 font-medium">Passing Line: 70.0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Bento Stats 4-Column Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <StatTile
              label="Final Score"
              value={`${stats.percentage}%`}
              subtext={stats.passed ? "Benchmark Met" : "Target: 70.0%"}
              colorClass={stats.passed ? "text-emerald-500" : "text-rose-500"}
              delay={0.05}
            />
            <StatTile
              label="Correct"
              value={stats.correct}
              subtext={stats.attempted > 0 ? `${Math.round((stats.correct / stats.attempted) * 100)}% accuracy` : "0 answered"}
              colorClass="text-emerald-500"
              delay={0.1}
            />
            <StatTile
              label="Incorrect"
              value={stats.wrong}
              subtext={`${stats.wrong} missed`}
              colorClass="text-rose-500"
              delay={0.15}
            />
            <StatTile
              label="Total Questions"
              value={questionsLength}
              subtext={`${stats.skipped} skipped`}
              delay={0.2}
            />
          </div>

          {/* Nickname / Leaderboard Entry (Exam Mode) */}
          {mode === "exam" && (
            <div className="mb-5">
              <NicknamePrompt userAnswers={userAnswers} totalQuestions={questionsLength} category={category} />
            </div>
          )}

          {/* Primary Action Controls */}
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <Button
                onClick={onReview}
                variant="primary"
                className="flex-1 h-10 rounded-xl text-xs sm:text-sm font-semibold bg-[#5e6ad2] hover:bg-[#525ec2] text-white shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Review Answers</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={onRetake}
                variant="outline"
                className="flex-1 h-10 rounded-xl text-xs sm:text-sm font-medium border-zinc-200 dark:border-[#262638] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] text-zinc-700 dark:text-[#c4c4d4] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </Button>
            </div>

            {/* Sub-navigation Links */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <button
                onClick={() => router.push(`/${category}-quiz/mode`)}
                className="text-zinc-500 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#5e6ad2] transition-colors cursor-pointer"
              >
                ← Back to Menu
              </button>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-[#262638]" />
              <button
                onClick={() => router.push("/certification")}
                className="text-zinc-500 dark:text-[#8b8b9e] hover:text-[#5e6ad2] dark:hover:text-[#5e6ad2] transition-colors cursor-pointer"
              >
                Switch Certification →
              </button>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
};

