
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers";

interface MongoDBQuizResultsProps {
    report: {
        correct: number;
        attempted: number;
        wrong: number;
        skipped: number;
        percentage: string;
        passed: boolean;
    };
    onRetake: () => void;
    mode: 'practice' | 'exam';
}

export function MongoDBQuizResults({ report, onRetake, mode }: MongoDBQuizResultsProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen transition-colors duration-500 py-12 px-4 ${
            isDark 
              ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-green-950' 
              : 'bg-gradient-to-br from-gray-50 via-white to-green-50'
          }`}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                isDark ? 'bg-green-500/10' : 'bg-green-500/20'
              }`}></div>
              <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                isDark ? 'bg-teal-500/10' : 'bg-teal-500/20'
              }`} style={{animationDelay: '1s'}}></div>
            </div>
    
            <div className="relative z-10 max-w-5xl mx-auto space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`p-8 rounded-3xl shadow-lg border ${
                  isDark 
                    ? 'bg-gray-900/50 border-gray-800' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Result Badge */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                    report.passed
                      ? isDark 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-green-500/10 border-green-500/30 text-green-600'
                      : isDark 
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                        : 'bg-orange-500/10 border-orange-500/30 text-orange-600'
                  }`}>
                    <span className="text-2xl">{report.passed ? '🎉' : '📚'}</span>
                    <span className="text-sm font-bold tracking-wider">
                      {report.passed ? 'PASSED' : 'KEEP PRACTICING'}
                    </span>
                  </div>
                </div>
    
                <h2 className={`text-4xl font-extrabold mb-6 text-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-white via-green-100 to-teal-100 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-gray-900 via-green-900 to-teal-900 bg-clip-text text-transparent'
                }`}>
                  {mode === "exam" ? "Exam Results" : "Practice Complete"}
                </h2>
    
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-8">
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total No of Attempted</p>
                    <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{report.attempted}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct</p>
                    <p className="text-4xl font-bold text-green-500">{report.correct}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wrong</p>
                    <p className="text-4xl font-bold text-red-500">{report.wrong}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Skipped</p>
                    <p className="text-4xl font-bold text-orange-500">{report.skipped}</p>
                  </div>
                  <div className={`p-6 rounded-2xl ${
                    isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</p>
                    <p className={`text-4xl font-bold ${report.passed ? 'text-green-500' : 'text-orange-500'}`}>
                      {report.percentage}%
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={onRetake} 
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:scale-105"
                  >
                    Retake Quiz
                  </button>
                  <button 
                    onClick={() => router.push('/mongodb-quiz/mode')} 
                    className={`px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg'
                    }`}
                  >
                    Change Mode
                  </button>
                  <button 
                    onClick={() => router.push('/')} 
                    className={`px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                        : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg'
                    }`}
                  >
                    Home
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
    );
}
