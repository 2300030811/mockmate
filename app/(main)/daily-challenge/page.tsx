"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/themes/prism-tomorrow.css";
import { 
  Terminal, 
  Zap, 
  Copy, 
  RotateCcw, 
  ChevronRight, 
  MessageSquare, 
  CheckCircle2, 
  Award,
  BookOpen,
  Layout,
  Info,
  Sparkles,
  Search,
  ArrowLeft
} from "lucide-react";
import { executeCode } from "@/app/actions/code-execution";
import { getBobChallengeHint, submitChallengeAction } from "@/app/actions/challenge";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { useTheme } from "@/components/providers/providers";
import { Sun, Moon } from "lucide-react";
import { useDailyStreak } from "@/hooks/useDailyStreak";

export default function DailyChallengePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { completeChallenge } = useDailyStreak();

  const [problem, setProblem] = useState(DAILY_PROBLEMS[0]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState("");
  const [showConsole, setShowConsole] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    const day = new Date().getDate();
    const currentProblem = DAILY_PROBLEMS[day % DAILY_PROBLEMS.length];
    setProblem(currentProblem);
    setCode((currentProblem.starterCode as any).javascript || "");
  }, []);

  useEffect(() => {
    if (problem) {
        setCode((problem.starterCode as any)[language] || "");
    }
  }, [language, problem]);

  const handleRun = async () => {
    setIsRunning(true);
    setShowConsole(true);
    setOutput("Executing tests...");
    try {
      const result = await executeCode(language, code);
      setOutput(result.error ? `Error: ${result.error}\n\n${result.output}` : result.output || "Program finished with no output.");
    } catch (err) {
      setOutput("Execution failed. Check your internet connection.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First run code to get output
      const runResult = await executeCode(language, code);
      const evalResult = await submitChallengeAction(problem.title, code, language, runResult.output);
      setEvaluation(evalResult);
      
      if (evalResult.success) {
          completeChallenge(problem.points);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHint = async () => {
    setIsGettingHint(true);
    setHint(null);
    try {
      const result = await getBobChallengeHint(problem.title, code, language);
      setHint(result.markdown);
    } catch (err) {
      setHint("Bob is taking a coffee break. Try checking your logic again!");
    } finally {
      setIsGettingHint(false);
    }
  };

  return (
    // Fixed positioning to cover the footer from the main layout
    <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col overflow-hidden selection:bg-blue-500/30 transition-colors duration-300">
      {/* Header */}
      <header className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-30 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
              <NavigationPill showBack={true} showHome={false} className="relative z-50 scale-75 origin-left" />
          </div>
          <div className="hidden md:block">
             <NavigationPill className="relative z-50 scale-90 origin-left" />
          </div>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-800"></div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white/90">{problem.title}</h1>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-gray-500 font-bold uppercase">{problem.category}</span>
               <div className="w-1 h-1 bg-gray-400 dark:bg-gray-700 rounded-full"></div>
               <span className={`text-[10px] font-bold uppercase ${
                 problem.difficulty === 'Easy' ? 'text-green-600 dark:text-green-500' : 
                 problem.difficulty === 'Medium' ? 'text-amber-600 dark:text-amber-500' : 'text-red-600 dark:text-red-500'
               }`}>
                 {problem.difficulty}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
             <AnimatePresence mode="wait">
               {isDark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                     <Sun size={18} className="text-yellow-400" />
                  </motion.div>
               ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                     <Moon size={18} />
                  </motion.div>
               )}
             </AnimatePresence>
          </button>

          <button 
            onClick={getHint}
            disabled={isGettingHint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-xl text-xs font-bold transition-all"
          >
            {isGettingHint ? <Sparkles className="animate-spin" size={14} /> : <MessageSquare size={14} />}
            Ask Bob for Hint
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {isSubmitting ? <CheckCircle2 className="animate-spin" size={14} /> : <Award size={14} />}
            Submit Solution
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem & Instructions */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 overflow-y-auto custom-scrollbar flex flex-col drop-shadow-2xl transition-colors duration-300">
           <div className="p-8 space-y-8 flex-1">
              <section>
                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                    <BookOpen size={16} className="text-blue-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest">Description</h2>
                 </div>
                 <div className="prose prose-sm max-w-none prose-gray dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                 </div>
              </section>

              <section>
                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                    <Layout size={16} className="text-emerald-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest">Examples</h2>
                 </div>
                 <div className="space-y-4">
                    {problem.examples.map((ex, i) => (
                       <div key={i} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-4 font-mono text-xs">
                          <div className="mb-2"><span className="text-gray-500">Input:</span> <span className="text-blue-600 dark:text-blue-400">{ex.input}</span></div>
                          <div><span className="text-gray-500">Output:</span> <span className="text-emerald-600 dark:text-emerald-400">{ex.output}</span></div>
                       </div>
                    ))}
                 </div>
              </section>

              {hint && (
                 <section className="animate-fadeIn">
                    <div className="bg-purple-50 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-5 relative overflow-hidden group">
                       <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                          <MessageSquare size={80} />
                       </div>
                       <h3 className="text-purple-600 dark:text-purple-400 text-xs font-black mb-3 flex items-center gap-2 uppercase tracking-widest">
                          <Sparkles size={14} /> Bob&apos;s Thought
                       </h3>
                       <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert prose-purple">
                          <ReactMarkdown>{hint}</ReactMarkdown>
                       </div>
                       <button onClick={() => setHint(null)} className="absolute top-4 right-4 text-purple-400 hover:text-purple-600 dark:text-purple-500/50 dark:hover:text-purple-500 transition-colors">
                          <RotateCcw size={14} />
                       </button>
                    </div>
                 </section>
              )}
           </div>
           
           <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                 <div className="flex items-center gap-2">
                    <Info size={14} /> Solve to earn 10 XP
                 </div>
              </div>
           </div>
        </div>

        {/* Right Pane: Editor & Console - Always Dark for Code Readability */}
        <div className="flex-1 flex flex-col bg-[#0d0d0d] border-l border-gray-800 text-gray-400">
           {/* Editor Toolbar */}
           <div className="h-12 px-4 border-b border-gray-800 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Environment</span>
                    <select 
                       value={language}
                       onChange={(e) => setLanguage(e.target.value)}
                       className="bg-gray-800/50 border border-gray-700 text-[10px] font-bold text-blue-400 px-2 py-1 rounded-lg outline-none cursor-pointer uppercase hover:bg-gray-800 transition-colors"
                    >
                       <option value="javascript">JavaScript (Node v18)</option>
                       <option value="python">Python (v3.10)</option>
                       <option value="cpp">C++ (GCC 10)</option>
                    </select>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                    {isRunning ? <Zap className="animate-pulse" size={12} /> : <Zap size={12} />}
                    Run Code
                 </button>
                 <button 
                   onClick={() => setCode(problem.starterCode[language as keyof typeof problem.starterCode] || "")}
                   className="p-1.5 text-gray-500 hover:text-white transition-colors"
                 >
                    <RotateCcw size={14} />
                 </button>
              </div>
           </div>

           {/* Code Editor */}
           <div className="flex-1 overflow-auto custom-scrollbar relative">
              <div className="absolute inset-0">
                 <Editor
                    value={code}
                    onValueChange={c => setCode(c)}
                    highlight={code => highlight(code, (languages as any)[language === 'cpp' ? 'cpp' : language] || languages.clike, language)}
                    padding={24}
                    style={{
                       fontFamily: '"Fira code", "Fira Mono", monospace',
                       fontSize: 14,
                       minHeight: '100%',
                       backgroundColor: 'transparent'
                    }}
                    className="prism-editor"
                 />
              </div>
           </div>

           {/* Console */}
           <div className={`
             border-t border-gray-800 bg-black transition-all duration-300 flex flex-col
             ${showConsole ? 'h-48' : 'h-10'}
           `}>
              <div 
                 className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                 onClick={() => setShowConsole(!showConsole)}
              >
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <Terminal size={14} className={isRunning ? 'text-green-500 animate-pulse' : 'text-gray-600'} />
                    Console Output
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-white">
                       <ChevronRight size={14} className={showConsole ? 'rotate-90' : '-rotate-90'} />
                    </button>
                 </div>
              </div>
              
              <AnimatePresence>
                 {showConsole && (
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="flex-1 p-4 overflow-y-auto font-mono text-xs text-green-500/80 leading-relaxed custom-scrollbar whitespace-pre-wrap"
                    >
                       {output || "Run your code to see the output..."}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </main>

      {/* Submission Overlay */}
      <AnimatePresence>
        {evaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-900 border border-white/10 rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12 text-center">
                 <div className={`w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl shadow-2xl relative
                   ${evaluation.success ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}
                 `}>
                    {evaluation.success ? <CheckCircle2 size={48} /> : <Terminal size={48} />}
                    <div className="absolute inset-0 rounded-full border-4 border-current opacity-20 animate-ping"></div>
                 </div>

                 <h2 className="text-3xl font-black mb-2">{evaluation.success ? "Challenge Solved!" : "Keep Trying!"}</h2>
                 <p className="text-gray-400 mb-8 font-medium">Evaluation for Array Intersection</p>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                       <div className="text-[10px] text-gray-500 font-black uppercase mb-1">Score</div>
                       <div className="text-3xl font-black text-white">{evaluation.score}</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                       <div className="text-[10px] text-gray-500 font-black uppercase mb-1">Efficiency</div>
                       <div className="text-3xl font-black text-purple-400">{evaluation.efficiency}</div>
                    </div>
                 </div>

                 <div className="text-left bg-black/40 rounded-2xl p-6 mb-8 text-sm text-gray-400 leading-relaxed italic border-l-4 border-blue-500">
                    &quot;{evaluation.feedback}&quot;
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => setEvaluation(null)}
                      className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold transition-all"
                    >
                       Back to Editor
                    </button>
                    <button 
                      onClick={() => router.push("/")}
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                       Return Home
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .prism-editor textarea { outline: none !important; }
      `}</style>
    </div>
  );
}
