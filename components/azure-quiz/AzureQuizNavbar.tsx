"use client";

import { useRouter } from "next/navigation";
import { QuizMode } from "@/hooks/useAzureQuiz";
import { Home, Menu, Cloud, Sun, Moon } from "lucide-react";

interface AzureQuizNavbarProps {
  mode: QuizMode;
  isDark: boolean;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  timeRemaining: number;
  isSubmitted: boolean;
}

export function AzureQuizNavbar({
  mode,
  isDark,
  toggleTheme,
  sidebarOpen,
  setSidebarOpen,
  timeRemaining,
  isSubmitted,
}: AzureQuizNavbarProps) {
  const router = useRouter();

  return (
    <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 backdrop-blur-sm border-b transition-colors duration-300
        ${isDark ? 'bg-slate-900/80 border-white/5' : 'bg-white/80 border-gray-200'}
    `}>
        <div className="flex items-center gap-4">
              {mode !== "exam" && (
                <button
                  onClick={() => router.push("/")}
                  className={`p-2 rounded-lg transition ${
                    isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-900"
                  }`}
                  title="Home"
                >
                  <Home className="w-6 h-6" />
                </button>
              )}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className={`lg:hidden p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-blue-500" />
                  <h1 className="text-lg font-bold hidden sm:block">
                    {mode === "exam" ? "Azure Exam Simulator" : "Azure Practice"}
                  </h1>
              </div>
        </div>

        <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'hover:bg-white/10 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>

              {mode === 'exam' && !isSubmitted && (
                <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg border ${
                    timeRemaining < 300 
                        ? 'border-red-500 text-red-500 bg-red-500/10' 
                        : (isDark ? 'border-white/20 text-white bg-white/5' : 'border-gray-300 text-gray-900 bg-gray-100')
                }`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
            )}
              {mode === 'review' && (
                <div className="px-3 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    Review
                </div>
            )}
        </div>
    </nav>
  );
}
