"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

// --- Types ---
type Question = {
  id: number;
  question: string;
  options: string[];
  answer?: string;
  explanation?: string;
};

// --- Icons ---
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const StarIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filled ? "fill-yellow-500 text-yellow-500" : "fill-none"}`} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function AWSQuizPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams?.get("mode") as "practice" | "exam") || "practice";

  // --- State ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isDark, setIsDark] = useState(true); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Timer State (90 mins = 5400s)
  const [timeLeft, setTimeLeft] = useState(90 * 60); 

  // --- Effects ---
  useEffect(() => {
    setLoading(true);
    fetch(`/api/quiz/aws?mode=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setQuestions([]);
        setLoading(false);
      });
  }, [mode]);

  useEffect(() => {
    if (mode === "exam" && !submitted && !loading && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, submitted, loading, timeLeft]);

  // --- Helpers ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [questions[current].id]: option });
  };

  const toggleMark = (id: number) => {
    if (marked.includes(id)) {
      setMarked(marked.filter((m) => m !== id));
    } else {
      setMarked([...marked, id]);
    }
  };

  const handleSubmit = () => {
    setShowConfirm(false);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading {mode === "exam" ? "Real Exam" : "Mock Test"}...
          </h2>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center p-10">
          <p className="text-red-500 text-xl">No questions found. Check connection.</p>
          <button 
            onClick={() => router.push('/aws-quiz/mode')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[current];

  // --- Results View ---
  if (submitted) {
    const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
    const scorePercentage = ((correctCount / questions.length) * 100).toFixed(1);
    const incorrectQuestions = questions.filter(q => answers[q.id] !== q.answer);
    const passed = Number(scorePercentage) >= 70;

    return (
      <div className={`min-h-screen transition-colors duration-500 py-12 px-4 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
          }`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
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
                passed
                  ? isDark 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-green-500/10 border-green-500/30 text-green-600'
                  : isDark 
                    ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                    : 'bg-orange-500/10 border-orange-500/30 text-orange-600'
              }`}>
                <span className="text-2xl">{passed ? '🎉' : '📚'}</span>
                <span className="text-sm font-bold tracking-wider">
                  {passed ? 'PASSED' : 'KEEP PRACTICING'}
                </span>
              </div>
            </div>

            <h2 className={`text-4xl font-extrabold mb-6 text-center ${
              isDark 
                ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
            }`}>
              {mode === "exam" ? "Exam Results" : "Practice Complete"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Questions</p>
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{questions.length}</p>
              </div>
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct</p>
                <p className="text-4xl font-bold text-green-500">{correctCount}</p>
              </div>
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Wrong/Skipped</p>
                <p className="text-4xl font-bold text-red-500">{questions.length - correctCount}</p>
              </div>
              <div className={`p-6 rounded-2xl ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</p>
                <p className={`text-4xl font-bold ${passed ? 'text-blue-500' : 'text-orange-500'}`}>
                  {scorePercentage}%
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
              >
                Retake Quiz
              </button>
              <button 
                onClick={() => router.push('/aws-quiz/mode')} 
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

  // --- Main Quiz Layout ---
  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      
      {/* NAVBAR */}
      <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 ${
        isDark 
          ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`lg:hidden p-2 rounded-lg transition ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <h1 className={`text-lg font-bold hidden sm:block ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {mode === "exam" ? "AWS Exam Mode" : "AWS Practice"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mode === "exam" && (
            <div className={`flex items-center gap-2 font-mono text-xl ${
              timeLeft < 300 ? 'text-red-500 animate-pulse' : isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <ClockIcon />
              {formatTime(timeLeft)}
            </div>
          )}
          <button 
            onClick={() => setIsDark(!isDark)} 
            className={`p-2 rounded-lg transition ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
            title="Toggle Theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className={`
          absolute lg:static inset-y-0 left-0 z-40 w-72 h-full
          transform transition-transform duration-300 ease-in-out border-r shadow-xl lg:shadow-none
          overflow-y-auto custom-scrollbar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDark 
            ? 'bg-gray-900/80 backdrop-blur-sm border-gray-800' 
            : 'bg-white/80 backdrop-blur-sm border-gray-200'
          }
        `}>
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Navigator</span>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 pb-20">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = current === idx;
                const isMarked = marked.includes(q.id);
                
                let bgClass = isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';
                let textClass = isDark ? 'text-gray-200' : 'text-gray-700';

                if (isCurrent) {
                  bgClass = isDark 
                    ? 'ring-2 ring-blue-500 bg-blue-900/40' 
                    : 'ring-2 ring-blue-500 bg-blue-50';
                } else if (isAnswered) {
                  bgClass = isDark 
                    ? 'bg-blue-900/40 border border-blue-500/50' 
                    : 'bg-blue-100 border border-blue-300';
                  textClass = isDark ? 'text-blue-200' : 'text-blue-800';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrent(idx); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                    className={`relative w-full aspect-square rounded-lg text-sm font-semibold transition-all ${bgClass} ${textClass}`}
                  >
                    {idx + 1}
                    {isMarked && <span className="absolute top-0 right-0 text-yellow-500 text-xs">★</span>}
                  </button>
                );
              })}
            </div>
            
            <div className={`mt-auto pt-4 sticky bottom-0 ${
              isDark ? 'bg-gray-900/80' : 'bg-white/80'
            } backdrop-blur-sm`}>
              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition shadow-lg hover:scale-105"
              >
                Submit {mode === "exam" ? "Exam" : "Test"}
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* MAIN QUESTION AREA */}
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-3xl mx-auto pb-20">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 mr-4">
                <p className={`text-sm mb-1 font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Question {current + 1} of {questions.length}
                </p>
                <div className={`w-full h-2.5 rounded-full ${
                  isDark ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={() => toggleMark(currentQ.id)}
                className={`p-2 rounded-full transition ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                title={marked.includes(currentQ.id) ? "Unmark" : "Mark for Review"}
              >
                <StarIcon filled={marked.includes(currentQ.id)} />
              </button>
            </div>

            <div className={`p-6 md:p-10 rounded-3xl shadow-sm border ${
              isDark 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl md:text-2xl font-bold mb-8 leading-relaxed ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {currentQ.question}
              </h2>

              <div className="space-y-4">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === option;
                  
                  let optionClass = `w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group cursor-pointer `;
                  
                  if (isSelected) {
                    optionClass += isDark
                      ? 'border-blue-500 bg-blue-900/40 text-white font-semibold shadow-sm'
                      : 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-sm';
                  } else {
                    optionClass += isDark 
                      ? 'border-gray-800 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-700' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      className={optionClass}
                    >
                      <span className={`flex-1 text-base ${
                        isDark && !isSelected ? 'text-gray-300' : ''
                      }`}>{option}</span>
                      {isSelected && (
                        <span className={isDark ? 'ml-3 text-blue-400' : 'ml-3 text-blue-600'}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {mode === "practice" && answers[currentQ.id] && (
                <div className={`mt-8 p-6 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
                  answers[currentQ.id] === currentQ.answer 
                    ? isDark
                      ? 'bg-green-900/20 border-green-800 text-green-100'
                      : 'bg-green-50 border-green-200 text-green-900'
                    : isDark
                      ? 'bg-red-900/20 border-red-800 text-red-100'
                      : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {answers[currentQ.id] === currentQ.answer 
                      ? <span className="text-xl">✅ Correct</span>
                      : <span className="text-xl">❌ Incorrect</span>
                    }
                  </div>
                  <p className="mb-2"><strong>Correct Answer:</strong> {currentQ.answer}</p>
                  {currentQ.explanation && (
                    <div className={`mt-4 pt-4 border-t ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}>
                      <p className="font-semibold mb-1 opacity-75 uppercase text-xs tracking-wider">Explanation</p>
                      <p className="leading-relaxed opacity-90">{currentQ.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-8">
              <button
                disabled={current === 0}
                onClick={() => setCurrent(current - 1)}
                className={`px-8 py-3 rounded-xl font-semibold transition ${
                  current === 0 
                    ? 'opacity-0 pointer-events-none' 
                    : isDark
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 hover:scale-105"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition shadow-lg shadow-green-600/20 hover:scale-105"
                >
                  Finish & Submit
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`p-8 rounded-3xl shadow-2xl max-w-md w-full ${
              isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'
            }`}
          >
            <h3 className={`text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Ready to Submit?</h3>
            <p className={`mb-8 text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              You have answered <span className="font-bold text-blue-500">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button 
                onClick={() => setShowConfirm(false)}
                className={`px-6 py-3 rounded-xl transition font-medium ${
                  isDark
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Continue Quiz
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-bold shadow-lg hover:scale-105"
              >
                Submit {mode === "exam" ? "Exam" : "Test"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}