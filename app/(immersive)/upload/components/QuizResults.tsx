"use client";

import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { saveQuizResult } from "@/app/actions/results";

interface QuizResultsProps {
  quiz: any[];
  answers: Record<number, string>;
  isDark: boolean;
  fileName?: string; // Add optional filename for better category tracking
}

export function QuizResults({ quiz, answers, isDark, fileName }: QuizResultsProps) {
  const router = useRouter();
  const savedRef = useRef(false);

  const score = quiz.filter(q => answers[q.id] === q.answer).length;
  const answeredCount = Object.keys(answers).length;
  const scorePercentage = ((score / quiz.length) * 100).toFixed(1);
  const passed = Number(scorePercentage) >= 70;

  useEffect(() => {
    if (savedRef.current) return;

    const save = async () => {
      savedRef.current = true;
      try {
        await saveQuizResult({
          sessionId: crypto.randomUUID(),
          category: fileName ? `PDF: ${fileName}` : "AI Generated",
          userAnswers: answers,
          totalQuestions: quiz.length,
          generatedQuiz: quiz,
        });
      } catch (e) {
        console.error("Failed to auto-save results", e);
      }
    };

    save();
  }, [quiz, answers, fileName]);



  return (
    <div className={`min-h-screen transition-colors duration-500 py-12 px-4 ${isDark
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950'
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
          }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
          }`} style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className={`p-10 rounded-[2.5rem] shadow-2xl border ${isDark
              ? 'bg-gray-900/60 border-gray-800 backdrop-blur-xl'
              : 'bg-white/90 border-gray-200 backdrop-blur-xl'
            }`}
        >
          {/* Result Badge */}
          <div className="text-center mb-8">
            <m.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border shadow-lg ${passed
                  ? isDark
                    ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/10'
                    : 'bg-green-50 border-green-200 text-green-700 shadow-green-100'
                  : isDark
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/10'
                    : 'bg-blue-50 border-blue-200 text-blue-700 shadow-blue-100'
                }`}>
              <span className="text-3xl animate-bounce">{passed ? '🏆' : '📚'}</span>
              <span className="text-sm font-black tracking-widest uppercase">
                {passed ? 'Outstanding Performance' : 'Knowledge Check Complete'}
              </span>
            </m.div>
          </div>

          <h2 className={`text-4xl md:text-5xl font-black mb-6 text-center ${isDark
              ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
            }`}>
            Quiz Results
          </h2>

          <p className={`text-center mb-10 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
            You answered <strong className={isDark ? "text-white" : "text-black"}>{answeredCount}</strong> out of <strong className={isDark ? "text-white" : "text-black"}>{quiz.length}</strong> questions
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center mb-12">
            <m.div
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-3xl border ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'
                }`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Total Questions</p>
              <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{quiz.length}</p>
            </m.div>

            <m.div
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-3xl border ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'
                }`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Correct</p>
              <p className="text-4xl font-black text-green-500">{score}</p>
            </m.div>

            <m.div
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-3xl border col-span-2 md:col-span-1 flex flex-col justify-center relative overflow-hidden ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-100'
                }`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Score</p>
              <div className="relative z-10">
                <p className={`text-5xl font-black bg-gradient-to-r ${passed ? 'from-green-400 to-emerald-500' : 'from-orange-400 to-red-500'} bg-clip-text text-transparent`}>
                  {scorePercentage}%
                </p>
              </div>
            </m.div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
            >
              Upload Another File
            </button>
            <button
              onClick={() => router.push('/')}
              className={`px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 ${isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-md hover:shadow-lg'
                }`}
            >
              Back to Home
            </button>
          </div>

          {/* Detailed Review Section */}
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Detailed Review
            </h3>
            {quiz.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.answer;

              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border ${isDark
                      ? isCorrect ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'
                      : isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${isCorrect
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                      }`}>
                      Question {idx + 1}: {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {q.question}
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-bold opacity-70 uppercase tracking-wider text-xs mr-2">Your Answer:</span>
                      <span className={isCorrect ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                        {userAnswer || 'Skipped'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm">
                        <span className="font-bold opacity-70 uppercase tracking-wider text-xs mr-2">Correct Answer:</span>
                        <span className="text-green-500 font-medium">{q.answer}</span>
                      </p>
                    )}
                  </div>
                  <div className={`p-4 rounded-xl text-sm ${isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
                    }`}>
                    <span className="font-bold block mb-1">Explanation:</span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </m.div>
      </div>
    </div>
  );
}
