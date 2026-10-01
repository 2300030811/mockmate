"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuizMode } from "@/types";
import { Menu, ArrowLeft, Sun, Moon, Clock, ShieldCheck } from "lucide-react";
import { UserAuthSection } from "../UserAuthSection";
import { useTheme } from "@/components/providers/providers";

interface QuizNavbarProps {
  category: string;
  mode: QuizMode;
  timeRemaining: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const getTimerColor = (seconds: number) => {
  if (seconds <= 60) return 'text-rose-500 font-bold animate-pulse';
  if (seconds <= 300) return 'text-amber-500 font-semibold';
  if (seconds <= 600) return 'text-yellow-500 font-semibold';
  return 'text-emerald-600 dark:text-emerald-400 font-semibold';
};

const QuizTimer = memo(({ seconds }: { seconds: number }) => {
  return (
    <div
      data-testid="exam-timer"
      aria-label={`Time remaining: ${formatTime(seconds)}`}
      className="flex items-center gap-2 px-3 py-1 rounded-[5px] bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a]"
    >
      <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-[#6e6e84]" />
      <span className={`font-mono text-sm tracking-tight tabular-nums ${getTimerColor(seconds)}`}>
        {formatTime(seconds)}
      </span>
    </div>
  );
});

QuizTimer.displayName = "QuizTimer";

export const QuizNavbar = memo(({
  category,
  mode,
  timeRemaining,
  sidebarOpen,
  setSidebarOpen,
}: QuizNavbarProps) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const categoryName = category.toUpperCase();

  return (
    <nav className="h-14 flex-none z-50 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-[#0d0d12] border-b border-zinc-200 dark:border-[#1e1e2a] transition-colors">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="ghost"
          size="icon"
          className="lg:hidden text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e]"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <button
          onClick={() => router.push(`/${category}-quiz/mode`)}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] transition-colors cursor-pointer"
          title={`Back to ${categoryName} Mode Selection`}
        >
          <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-center">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span className="hidden sm:inline">Exit to Mode</span>
        </button>

        <div className="h-4 w-px bg-zinc-200 dark:bg-[#1e1e2a] hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono tracking-wider text-zinc-900 dark:text-[#ebebef] uppercase">
            {categoryName}
          </span>
          <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-medium border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] text-zinc-600 dark:text-[#8b8b9e]">
            {mode === "exam" ? "PROCTORED EXAM" : "PRACTICE LAB"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {mode === "exam" && (
          <QuizTimer seconds={timeRemaining} />
        )}

        <div className="hidden md:flex items-center">
          <UserAuthSection />
          <div className="w-px h-4 bg-zinc-200 dark:bg-[#1e1e2a] mx-3" />
        </div>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
});

QuizNavbar.displayName = "QuizNavbar";

