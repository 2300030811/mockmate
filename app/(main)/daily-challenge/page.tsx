"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { type OnMount } from "@monaco-editor/react";
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
   Check,
} from "lucide-react";
import { executeCode } from "@/app/actions/code-execution";
import { submitChallenge, getBobChallengeHint } from "@/app/actions/challenge";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { useTheme } from "@/components/providers/providers";
import { Sun, Moon } from "lucide-react";
import { useDailyStreak } from "@/hooks/useDailyStreak";

// Language config with correct version labels
const LANGUAGE_CONFIG: Record<string, { label: string; monacoId: string }> = {
   javascript: { label: "JavaScript (Node 22)", monacoId: "javascript" },
   typescript: { label: "TypeScript (5.6)", monacoId: "typescript" },
   python: { label: "Python (3.12)", monacoId: "python" },
   c: { label: "C (GCC 14)", monacoId: "c" },
   cpp: { label: "C++ (GCC 14)", monacoId: "cpp" },
};

export default function DailyChallengePage() {
   const router = useRouter();
   const { theme, toggleTheme } = useTheme();
   const isDark = theme === "dark";
   const { completeChallenge } = useDailyStreak();

   const editorRef = useRef<any>(null);
   const [problem, setProblem] = useState(DAILY_PROBLEMS[0]);
   const [language, setLanguage] = useState("javascript");
   const [code, setCode] = useState("");
   const [isRunning, setIsRunning] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSolved, setIsSolved] = useState(false);
   const [output, setOutput] = useState("");
   const [showConsole, setShowConsole] = useState(false);
   const [hint, setHint] = useState<string | null>(null);
   const [isGettingHint, setIsGettingHint] = useState(false);
   const [evaluation, setEvaluation] = useState<any>(null);
   const [copied, setCopied] = useState(false);
   const [executionTime, setExecutionTime] = useState<string | null>(null);
   const [cooldown, setCooldown] = useState(false);

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

   // Monaco editor mount handler
   const handleEditorMount: OnMount = useCallback((editor, monaco) => {
      editorRef.current = editor;
      editor.addAction({
         id: "run-code",
         label: "Run Code",
         keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
         run: () => { document.getElementById("dc-run-btn")?.click(); },
      });
      editor.focus();
   }, []);

   // Optimized Monaco options
   const editorOptions = useMemo(() => ({
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
      fontLigatures: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      lineNumbers: "on" as const,
      renderLineHighlight: "line" as const,
      cursorBlinking: "smooth" as const,
      cursorSmoothCaretAnimation: "on" as const,
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: "always" as const,
      autoClosingQuotes: "always" as const,
      autoIndent: "full" as const,
      formatOnPaste: true,
      suggest: { showKeywords: true, showSnippets: true, showFunctions: true, showVariables: true },
      tabSize: language === 'python' ? 4 : 2,
      wordWrap: "off" as const,
      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6, useShadows: false },
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      contextmenu: false,
   }), [language]);

   const monacoLanguage = useMemo(() => {
      return LANGUAGE_CONFIG[language]?.monacoId || language;
   }, [language]);

   const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   }, [code]);

   const handleReset = useCallback(() => {
      setCode(problem.starterCode[language as keyof typeof problem.starterCode] || "");
      setShowConsole(false);
      setOutput("");
      setExecutionTime(null);
   }, [language, problem]);

   const handleRun = useCallback(async () => {
      if (cooldown || isRunning) return;
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);

      setIsRunning(true);
      setShowConsole(true);
      setExecutionTime(null);
      setOutput(`▶ Compiling ${LANGUAGE_CONFIG[language]?.label || language}...\n  Sending to execution engine...`);
      const startTime = performance.now();
      try {
         const result = await executeCode(language, code);
         const elapsed = `${(performance.now() - startTime).toFixed(0)}ms`;
         setOutput(result.error ? `✗ Error:\n${result.error}${result.output ? '\n\nOutput:\n' + result.output : ''}` : result.output || "✓ Program finished with no output.");
         setExecutionTime(elapsed);
      } catch (err) {
         setOutput("✗ Execution failed. Check your internet connection.");
      } finally {
         setIsRunning(false);
      }
   }, [cooldown, isRunning, language, code]);

   const handleSubmit = async () => {
      if (isSubmitting || isSolved) return;
      setIsSubmitting(true);
      setEvaluation(null);
      try {
         const runResult = await executeCode(language, code);
         const evalResult = await submitChallenge(problem.title, code, language, runResult.output);
         setEvaluation(evalResult);

         if (evalResult.success) {
            setIsSolved(true);
            completeChallenge(problem.points);
         }
      } catch (err) {
         console.error(err);
         setEvaluation({
            success: false,
            score: 0,
            efficiency: "N/A",
            feedback: "Bob encountered a hiccup during evaluation. Please try running your code again."
         });
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
      <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col overflow-hidden selection:bg-blue-500/30 transition-colors duration-300">
         {/* Header */}
         <header className="h-14 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-30 shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-3">
               <div className="md:hidden">
                  <NavigationPill showBack={true} showHome={false} className="relative z-50 scale-75 origin-left" variant="dark" />
               </div>
               <div className="hidden md:block">
                  <NavigationPill className="relative z-50 scale-90 origin-left" variant="dark" />
               </div>
               <div className="w-px h-5 bg-gray-300 dark:bg-gray-800"></div>
               <div>
                  <h1 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white/90">{problem.title}</h1>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] text-gray-500 font-bold uppercase">{problem.category}</span>
                     <div className="w-1 h-1 bg-gray-400 dark:bg-gray-700 rounded-full"></div>
                     <span className={`text-[9px] font-bold uppercase ${problem.difficulty === 'Easy' ? 'text-green-600 dark:text-green-500' :
                        problem.difficulty === 'Medium' ? 'text-amber-600 dark:text-amber-500' : 'text-red-600 dark:text-red-500'
                        }`}>
                        {problem.difficulty}
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2">
               {/* Theme Toggle */}
               <button onClick={toggleTheme} className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <AnimatePresence mode="wait">
                     {isDark ? (
                        <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                           <Sun size={16} className="text-yellow-400" />
                        </motion.div>
                     ) : (
                        <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                           <Moon size={16} />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </button>

               <button
                  onClick={getHint}
                  disabled={isGettingHint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg text-[10px] font-bold transition-all"
               >
                  {isGettingHint ? <Sparkles className="animate-spin" size={12} /> : <MessageSquare size={12} />}
                  <span className="hidden sm:inline">Ask Bob</span>
               </button>

               <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSolved}
                  className={`flex items-center gap-1.5 px-4 py-1.5 ${isSolved ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'} rounded-lg text-[10px] font-black transition-all shadow-lg active:scale-95 disabled:opacity-70`}
               >
                  {isSubmitting ? <CheckCircle2 className="animate-spin" size={12} /> : isSolved ? <CheckCircle2 size={12} /> : <Award size={12} />}
                  {isSolved ? 'SOLVED' : 'SUBMIT'}
               </button>
            </div>
         </header>

         <main className="flex-1 flex overflow-hidden">
            {/* Left Pane: Problem & Instructions */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 overflow-y-auto custom-scrollbar flex flex-col transition-colors duration-300">
               <div className="p-6 md:p-8 space-y-6 flex-1">
                  <section>
                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                        <BookOpen size={14} className="text-blue-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest">Description</h2>
                     </div>
                     <div className="prose prose-sm max-w-none prose-gray dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed">
                        <ReactMarkdown>{problem.description}</ReactMarkdown>
                     </div>
                  </section>

                  <section>
                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                        <Layout size={14} className="text-emerald-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest">Examples</h2>
                     </div>
                     <div className="space-y-3">
                        {problem.examples.map((ex, i) => (
                           <div key={i} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-3 font-mono text-xs">
                              <div className="mb-1.5"><span className="text-gray-500">Input:</span> <span className="text-blue-600 dark:text-blue-400">{ex.input}</span></div>
                              <div><span className="text-gray-500">Output:</span> <span className="text-emerald-600 dark:text-emerald-400">{ex.output}</span></div>
                           </div>
                        ))}
                     </div>
                  </section>

                  {hint && (
                     <section className="animate-fadeIn">
                        <div className="bg-purple-50 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-4 relative overflow-hidden group">
                           <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                              <MessageSquare size={80} />
                           </div>
                           <h3 className="text-purple-600 dark:text-purple-400 text-[10px] font-black mb-2 flex items-center gap-2 uppercase tracking-widest">
                              <Sparkles size={12} /> Bob&apos;s Thought
                           </h3>
                           <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose prose-sm dark:prose-invert prose-purple">
                              <ReactMarkdown>{hint}</ReactMarkdown>
                           </div>
                           <button onClick={() => setHint(null)} className="absolute top-3 right-3 text-purple-400 hover:text-purple-600 dark:text-purple-500/50 dark:hover:text-purple-500 transition-colors">
                              <RotateCcw size={12} />
                           </button>
                        </div>
                     </section>
                  )}
               </div>

               <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                     <Info size={12} />
                     <span>Solve to earn {problem.points} XP</span>
                     <span className="text-gray-400">•</span>
                     <span className="text-gray-400 normal-case tracking-normal">Ctrl+Enter to run</span>
                  </div>
               </div>
            </div>

            {/* Right Pane: Editor & Console */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] border-l border-gray-800 text-gray-400">
               {/* Editor Toolbar */}
               <div className="h-11 px-3 border-b border-gray-800 flex items-center justify-between bg-black/40">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <Terminal size={12} className="text-emerald-500" />
                        <select
                           value={language}
                           onChange={(e) => setLanguage(e.target.value)}
                           className="bg-gray-800/60 border border-gray-700/60 text-[10px] font-bold text-gray-200 px-2 py-1 rounded-md outline-none cursor-pointer uppercase hover:bg-gray-700 transition-colors appearance-none pr-7"
                           style={{
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.35rem center',
                              backgroundSize: '0.85rem'
                           }}
                        >
                           {Object.entries(LANGUAGE_CONFIG).map(([value, { label }]) => (
                              <option key={value} value={value} className="bg-gray-900">{label}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                     <button
                        id="dc-run-btn"
                        onClick={handleRun}
                        disabled={isRunning || cooldown}
                        className={`flex items-center gap-1.5 px-2.5 py-1 ${isRunning || cooldown ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'} border ${isRunning || cooldown ? 'border-gray-700/40' : 'border-emerald-500/20 hover:border-emerald-500/40'} rounded-md text-[10px] font-black uppercase tracking-wider transition-all`}
                     >
                        {isRunning ? (
                           <div className="w-2.5 h-2.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                           <Zap size={10} />
                        )}
                        {isRunning ? 'Running' : cooldown ? 'Wait' : 'Run'}
                     </button>
                     <button onClick={handleCopy} className="p-1.5 text-gray-500 hover:text-gray-200 transition-colors" title="Copy code">
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                     </button>
                     <button onClick={handleReset} className="p-1.5 text-gray-500 hover:text-amber-400 transition-colors" title="Reset to template">
                        <RotateCcw size={13} />
                     </button>
                  </div>
               </div>

               {/* Monaco Code Editor */}
               <div className="flex-1 overflow-hidden relative min-h-0">
                  <Editor
                     height="100%"
                     language={monacoLanguage}
                     value={code}
                     onChange={(value) => setCode(value || "")}
                     theme="vs-dark"
                     onMount={handleEditorMount}
                     loading={
                        <div className="flex items-center justify-center h-full gap-2 text-gray-500">
                           <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                           <span className="text-xs font-mono">Loading editor...</span>
                        </div>
                     }
                     options={editorOptions}
                  />
               </div>

               {/* Console */}
               <div className={`
             border-t border-gray-800 bg-black/95 transition-all duration-300 flex flex-col backdrop-blur-sm
             ${showConsole ? 'h-48' : 'h-9'}
           `}>
                  <div
                     className="h-9 px-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none shrink-0"
                     onClick={() => setShowConsole(!showConsole)}
                  >
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <Terminal size={12} className={isRunning ? 'text-emerald-500 animate-pulse' : 'text-gray-600'} />
                        <span>Output</span>
                        {executionTime && (
                           <span className="text-[9px] text-gray-600 normal-case tracking-normal font-medium">({executionTime})</span>
                        )}
                     </div>
                     <div className="flex items-center gap-2">
                        <ChevronRight size={12} className={`text-gray-500 transition-transform ${showConsole ? 'rotate-90' : '-rotate-90'}`} />
                     </div>
                  </div>

                  <AnimatePresence>
                     {showConsole && (
                        <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex-1 p-3 overflow-y-auto font-mono text-xs text-emerald-500/90 leading-relaxed custom-scrollbar whitespace-pre-wrap"
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
                        <p className="text-gray-400 mb-8 font-medium">Evaluation for {problem.title}</p>

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
      `}</style>
      </div>
   );
}
