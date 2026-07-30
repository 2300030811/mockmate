"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuizMode } from "@/types";
import { Menu, Layout, Sun, Moon, Clock } from "lucide-react";
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
  if (seconds <= 60) return 'text-red-500 font-black animate-pulse';
  if (seconds <= 300) return 'text-amber-500 font-bold';
  if (seconds <= 600) return 'text-yellow-500 font-bold';
  return 'text-emerald-600 dark:text-emerald-400 font-bold';
};

const QuizTimer = memo(({ seconds }: { seconds: number }) => {
  return (
    <div
      data-testid="exam-timer"
      aria-label={`Time remaining: ${formatTime(seconds)}`}
      className={`flex items-center gap-2 font-mono text-xl ${getTimerColor(seconds)}`}
    >
      <Clock className="w-5 h-5" />
      {formatTime(seconds)}
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
    <nav className="h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-900 dark:text-gray-200"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <div
          onClick={() => router.push(`/${category}-quiz/mode`)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          title={`Back to ${categoryName} Menu`}
        >
          <Layout className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-bold hidden sm:block text-gray-900 dark:text-white">
            {categoryName} {mode === "exam" ? "Exam Mode" : "Practice"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center">
          <UserAuthSection />
          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-4"></div>
        </div>

        <Button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          variant="ghost"
          size="icon"
          className={isDark ? "text-yellow-400" : "text-gray-600"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {mode === "exam" && (
          <QuizTimer seconds={timeRemaining} />
        )}
      </div>
    </nav>
  );
});

QuizNavbar.displayName = "QuizNavbar";

