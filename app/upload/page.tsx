"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "../providers";

// --- Utility for cleaner classes ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Icons ---
const CloudIcon = () => (
  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
      d="M5 13l4 4L19 7" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<any[] | null>(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [customApiKey, setCustomApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai" | "groq" | "auto">("groq");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const convertRes = await fetch("/api/convert", { method: "POST", body: formData });
      if (!convertRes.ok) {
        let errorMsg = "File conversion failed";
        try {
            const errData = await convertRes.json();
            if (errData.error) errorMsg = errData.error;
        } catch (e) { /* ignore json parse error */ }
        throw new Error(errorMsg);
      }
      const convertData = await convertRes.json();
      
      // 🚫 STRICT BLOCK: Unreadable/Scanned PDFs
      if (convertData.isScanned) {
         throw new Error(
           "❌ Unreadable File Detected.\n\n" +
           "This PDF appears to be a scanned image. We can only process files with selectable text.\n" +
           "--> Please upload a conversational/text-based PDF."
         );
      }

      const quizRes = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            content: convertData.text,
            apiKey: customApiKey,
            provider: provider 
        }),
      });

      if (!quizRes.ok) {
        let errorMsg = "Quiz generation failed";
        try {
          const errData = await quizRes.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) { /* ignore parse error */ }
        throw new Error(errorMsg);
      }
      const quizData = await quizRes.json();

      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error("AI could not generate valid questions. Try a smaller file.");
      }

      setQuiz(quizData.questions);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  // -------------------- QUIZ VIEW --------------------
  if (quiz && quiz.length > 0) {
    const q = quiz[current];
    
    if (!q) return <div className="p-10 text-center">Loading question...</div>;

    const score = quiz.filter(q => answers[q.id] === q.answer).length;
    const progress = ((current + 1) / quiz.length) * 100;
    const answeredCount = Object.keys(answers).length;

    if (showResults) {
      const scorePercentage = ((score / quiz.length) * 100).toFixed(1);
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

          <div className="relative z-10 max-w-5xl mx-auto">
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
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                }`}>
                  <span className="text-2xl">{passed ? '🎉' : '📚'}</span>
                  <span className="text-sm font-bold tracking-wider">
                    {passed ? 'EXCELLENT WORK' : 'QUIZ COMPLETE'}
                  </span>
                </div>
              </div>

              <h2 className={`text-4xl font-extrabold mb-6 text-center ${
                isDark 
                  ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
              }`}>
                Quiz Complete!
              </h2>

              <p className={`text-center mb-8 text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                You answered {answeredCount} out of {quiz.length} questions
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-8">
                <div className={`p-6 rounded-2xl ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Questions</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{quiz.length}</p>
                </div>
                <div className={`p-6 rounded-2xl ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Correct</p>
                  <p className="text-4xl font-bold text-green-500">{score}</p>
                </div>
                <div className={`p-6 rounded-2xl col-span-2 md:col-span-1 ${
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
                  Upload Another File
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

    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}>
        
        {/* Navbar */}
        <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 ${
          isDark 
            ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800' 
            : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h1 className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              AI Quiz Generator
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowResults(true)}
              className={`text-sm font-bold px-3 py-2 rounded-lg transition ${
                isDark 
                  ? 'text-red-400 hover:bg-red-900/20' 
                  : 'text-red-500 hover:bg-red-50'
              }`}
            >
              Finish Now
            </button>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-lg transition ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto py-10 px-4">
          <div className="max-w-3xl mx-auto">
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className={`flex justify-between text-sm font-medium mb-2 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>Question {current + 1} of {quiz.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className={`h-2.5 w-full rounded-full ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-8 rounded-3xl shadow-lg border ${
                  isDark 
                    ? 'bg-gray-900/50 border-gray-800' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                    isDark 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    AI Generated
                  </span>
                </div>
                
                <h2 className={`text-2xl font-bold mb-8 leading-relaxed ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {q.question}
                </h2>

                <div className="space-y-4">
                  {q.options.map((opt: string, i: number) => {
                    const normalizeStr = (s: string) => s.replace(/\s+/g, "").toLowerCase();
                    const isSelected = answers[q.id] === opt;
                    // Loose comparison to prevent "Red Correct Answer" bugs
                    const isCorrect = q.answer === opt || normalizeStr(q.answer) === normalizeStr(opt);
                    const isWrong = isSelected && !isCorrect;
                    const showFeedback = !!answers[q.id];

                    let buttonStyle = "";
                    
                    if (showFeedback) {
                      if (isCorrect) {
                        buttonStyle = isDark
                          ? "border-green-500 bg-green-900/40 text-green-200"
                          : "border-green-500 bg-green-50 text-green-700";
                      } else if (isWrong) {
                        buttonStyle = isDark
                          ? "border-red-500 bg-red-900/40 text-red-200"
                          : "border-red-500 bg-red-50 text-red-700";
                      } else {
                        buttonStyle = isDark
                          ? "opacity-50 border-gray-800 text-gray-500"
                          : "opacity-50 border-gray-200 text-gray-400";
                      }
                    } else if (isSelected) {
                      buttonStyle = isDark
                        ? "border-blue-500 bg-blue-900/40 text-white"
                        : "border-blue-500 bg-blue-50 text-blue-900";
                    } else {
                      buttonStyle = isDark
                        ? "border-gray-800 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-700 text-gray-300"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 text-gray-900";
                    }

                    return (
                      <button
                        key={i}
                        disabled={showFeedback}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        className={cn(
                          "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 font-medium text-lg",
                          buttonStyle
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {showFeedback && isCorrect && (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {answers[q.id] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-5 rounded-xl border ${
                      isDark 
                        ? "bg-blue-900/20 border-blue-800 text-blue-200" 
                        : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="font-bold text-sm uppercase tracking-wide opacity-70 mb-1">Explanation</p>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                disabled={current === 0}
                onClick={() => setCurrent(c => c - 1)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  current === 0 
                    ? 'opacity-0 pointer-events-none' 
                    : isDark
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {current < quiz.length - 1 ? (
                <button
                  onClick={() => setCurrent(c => c + 1)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-600/20 hover:scale-105"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => setShowResults(true)}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition shadow-lg shadow-green-600/20 hover:scale-105"
                >
                  Finish Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- UPLOAD VIEW --------------------
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
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

      <div className="relative z-10 w-full max-w-4xl">
        
        {/* Logo Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
            isDark 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
              : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
          }`}>
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-bold tracking-wider">AI QUIZ GENERATOR</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className={`text-5xl md:text-6xl font-extrabold mb-6 text-center ${
            isDark 
              ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
          }`}
        >
          Transform PDFs into
          <br />
          Interactive Quizzes
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-xl mb-12 text-center ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Upload your study materials and let AI generate smart quizzes instantly
        </motion.p>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`p-8 md:p-12 rounded-3xl shadow-lg border ${
            isDark 
              ? 'bg-gray-900/50 border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        >
          
          <div className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${
            file 
              ? isDark
                ? "border-green-500 bg-green-900/20" 
                : "border-green-500 bg-green-50"
              : isDark
                ? "border-gray-700 hover:border-blue-500 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            <div className="flex flex-col items-center justify-center relative z-10">
              {file ? (
                <>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isDark ? 'bg-green-900/40' : 'bg-green-100'
                  }`}>
                    <CheckIcon />
                  </div>
                  <p className={`font-bold text-lg truncate max-w-xs ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{file.name}</p>
                  <p className="text-sm text-green-500 mt-1 font-medium">Ready to upload</p>
                </>
              ) : (
                <>
                  <div className="text-blue-500 group-hover:scale-110 transition-transform">
                    <CloudIcon />
                  </div>
                  <p className={`font-semibold text-lg ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Click to browse</p>
                  <p className={`text-sm mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>or drag and drop your PDF or TXT file here</p>
                </>
              )}
            </div>
          </div>
          
          <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
             💡 Tip: For faster results and no limits, upload <b>Text-based PDFs</b> (selectable text).
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl text-sm font-medium ${
                isDark 
                  ? 'bg-red-900/20 text-red-400 border border-red-800' 
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
              {error.includes("quota") && (
                <p className="text-xs mt-2 opacity-75">
                  Try adding your own API key below to bypass the limit.
                </p>
              )}
            </motion.div>
          )}

          {/* Optional API Key Input */}
          <div className="mt-6 text-left">
            <details className="group">
              <summary className={`text-sm font-medium cursor-pointer list-none flex items-center gap-2 ${
                isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'
              } transition`}>
                <span className="transition-transform group-open:rotate-90">▶</span>
                Use Custom API Key (Optional)
              </summary>
              <div className="mt-4 space-y-4">
                
                {/* Provider Selector */}
                <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 rounded-xl w-fit border border-gray-200/50">
                  <button
                    onClick={() => setProvider("auto")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "auto"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ⚡ Auto
                  </button>
                  <button
                    onClick={() => setProvider("gemini")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "gemini"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    onClick={() => setProvider("groq")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "groq"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Groq
                  </button>
                  <button
                    onClick={() => setProvider("openai")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      provider === "openai"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    OpenAI
                  </button>
                </div>

                <input 
                  type="password" 
                  placeholder={
                    provider === "openai" ? "Paste OpenAI API Key (sk-...)" :
                    provider === "groq" ? "Paste Groq API Key (gsk_...)" :
                    provider === "gemini" ? "Paste Google Gemini API Key" :
                    "Optional: Leave empty to use system keys"
                  }
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark 
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
                <p className={`text-xs pl-1 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {provider === "auto" ? "Attempts Gemini first, then falls back to Groq if quota exceeded." :
                   provider === "groq" ? "Uses Llama-3-70b on Groq Hardware (Fastest)." :
                   provider === "openai" ? "Requires a paid OpenAI account." :
                   "Uses Google's Gemini-1.5-Flash model."}
                </p>
              </div>
            </details>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!file || isUploading}
            className={`mt-8 w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              isUploading || !file
                ? isDark
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Quiz...
              </span>
            ) : (
              "Generate Quiz 🚀"
            )}
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`mt-8 flex flex-wrap gap-6 justify-center text-sm ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant Generation</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Smart Explanations</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}