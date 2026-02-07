"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuizMode } from "@/types";
import { Home, Menu, Code, Sun, Moon, Clock } from "lucide-react";

interface QuizNavbarProps {
  mode: QuizMode;
  timeRemaining: number;
  isDark: boolean;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function QuizNavbar({
  mode,
  timeRemaining,
  isDark,
  toggleTheme,
  sidebarOpen,
  setSidebarOpen,
}: QuizNavbarProps) {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 ${
      isDark 
        ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800' 
        : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        {mode !== "exam" && (
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="icon"
            className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Button>
        )}
        <Button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          variant="ghost"
          size="icon"
          className={`lg:hidden ${isDark ? 'text-gray-200' : 'text-gray-900'}`}
        >
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6 text-blue-500" />
          <h1 className={`text-lg font-bold hidden sm:block ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {mode === "exam" ? "PCAP Exam Mode" : "PCAP Practice"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          className={isDark ? "text-yellow-400" : "text-gray-600"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        
        {mode === "exam" && (
          <div className={`flex items-center gap-2 font-mono text-xl ${
            timeRemaining < 300 ? 'text-red-500 animate-pulse' : isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>
    </nav>
  );
}
