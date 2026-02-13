
import { QuizMode } from "@/types";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/app/providers";
import { RefreshCcw, CheckCircle, Home } from "lucide-react";
import { NicknamePrompt } from "../quiz/NicknamePrompt";

interface PCAPQuizResultsProps {
  report: {
    correct: number;
    attempted: number;
    wrong: number;
    skipped: number;
    percentage: string;
    passed: boolean;
    totalQuestions: number;
  };
  onRetake: () => void;
  mode: QuizMode;
}

export function PCAPQuizResults({ report, onRetake, mode }: PCAPQuizResultsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`max-w-2xl w-full p-8 rounded-3xl shadow-2xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}>
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            report.passed 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            <span className="text-5xl font-bold">{report.percentage}%</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-2">
            {report.passed ? "Certified Pythonista!" : "Keep practicing!"}
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {report.passed 
              ? "You've demonstrated solid understanding of Python." 
              : "Review the concepts and try again."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className={`p-4 rounded-2xl text-center ${
            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Total</p>
            <p className="text-2xl font-black">{report.totalQuestions}</p>
          </div>
          <div className={`p-4 rounded-2xl text-center ${
            isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700'
          }`}>
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Correct</p>
            <p className="text-2xl font-black">{report.correct}</p>
          </div>
          <div className={`p-4 rounded-2xl text-center ${
            isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Wrong</p>
            <p className="text-2xl font-black">{report.wrong}</p>
          </div>
          <div className={`p-4 rounded-2xl text-center ${
            isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
          }`}>
            <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Skipped</p>
            <p className="text-2xl font-black">{report.skipped}</p>
          </div>
        </div>

        {/* Leaderboard Nickname Prompt */}
        {mode === 'exam' && (
            <div className="mb-10">
                <NicknamePrompt 
                    score={report.correct}
                    totalQuestions={report.totalQuestions}
                    category="pcap"
                />
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={onRetake}
            className="flex-1 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Retake Quiz
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="secondary"
            className="flex-1 py-6 text-lg font-bold"
          >
            <Home className="mr-2 h-5 w-5" />
            Dashbaord
          </Button>
        </div>
      </div>
    </div>
  );
}
