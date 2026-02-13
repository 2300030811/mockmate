import { QuizMode } from "@/types";
import { CheckCircle, XCircle, RefreshCw, Trophy } from "lucide-react";
import { useTheme } from "@/app/providers";
import { NicknamePrompt } from "../quiz/NicknamePrompt";

interface OracleQuizResultsProps {
  report: {
    correct: number;
    attempted: number;
    wrong: number;
    skipped: number;
    percentage: string;
    passed: boolean;
  };
  onRetake: () => void;
  mode: QuizMode;
}

export function OracleQuizResults({ report, onRetake, mode }: OracleQuizResultsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-red-950'
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      <div className={`max-w-2xl w-full rounded-3xl shadow-2xl p-8 md:p-12 text-center border ${
         isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
      }`}>
        
        {/* Icon Header */}
        <div className="mb-8 flex justify-center">
          {report.passed ? (
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
              <Trophy className="w-24 h-24 text-yellow-500 relative z-10 animate-bounce" />
            </div>
          ) : (
            <div className="bg-red-100 p-6 rounded-full dark:bg-red-900/30">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-4xl font-extrabold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {report.passed ? "Congratulations!" : "Keep Practicing!"}
        </h2>
        <p className={`text-lg mb-8 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {report.passed 
            ? "You have mastered the Oracle concepts." 
            : "Review your mistakes and try again to improve your score."}
        </p>

        {/* Score Ring */}
        <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
           <svg className="w-full h-full transform -rotate-90">
             <circle
               cx="96"
               cy="96"
               r="88"
               fill="none"
               stroke={isDark ? "#374151" : "#E5E7EB"}
               strokeWidth="12"
             />
             <circle
               cx="96"
               cy="96"
               r="88"
               fill="none"
               stroke={report.passed ? "#10B981" : "#EF4444"}
               strokeWidth="12"
               strokeDasharray={2 * Math.PI * 88}
               strokeDashoffset={2 * Math.PI * 88 * (1 - parseFloat(report.percentage) / 100)}
               className="transition-all duration-1000 ease-out"
               strokeLinecap="round"
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className={`text-5xl font-black ${
               isDark ? 'text-white' : 'text-gray-900'
             }`}>
               {report.percentage}%
             </span>
             <span className={`text-sm font-medium uppercase tracking-wider mt-1 ${
               isDark ? 'text-gray-500' : 'text-gray-400'
             }`}>
               Score
             </span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
            <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-green-600'}`}>Correct</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{report.correct}</p>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-red-50'}`}>
            <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-red-600'}`}>Wrong</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>{report.wrong}</p>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>Attempted</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{report.attempted}</p>
          </div>
          <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
             <p className={`text-sm font-bold uppercase mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Skipped</p>
             <p className={`text-3xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{report.skipped}</p>
          </div>
        </div>

        {/* Leaderboard Nickname Prompt */}
        {mode === 'exam' && (
            <div className="mb-10 text-left">
                <NicknamePrompt 
                    score={report.correct}
                    totalQuestions={report.attempted + report.skipped}
                    category="oracle"
                />
            </div>
        )}

        {/* Action Button */}
        <button
          onClick={onRetake}
          className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90 active:scale-95"
        >
          <RefreshCw className="w-6 h-6" />
          Retake Quiz
        </button>

      </div>
    </div>
  );
}
