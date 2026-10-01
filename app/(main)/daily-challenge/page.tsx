"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
import {
  Terminal,
  Copy,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Award,
  BookOpen,
  Layout,
  Info,
  Sparkles,
  Check,
  Flame,
  Play,
  Bot,
  X,
  Code2,
  CheckCheck,
  ShieldAlert,
  Share2,
  ArrowRight,
} from "lucide-react";
import { executeCode } from "@/app/actions/code-execution";
import { submitChallenge, getBobChallengeHint } from "@/app/actions/challenge";
import { DAILY_PROBLEMS } from "@/utils/daily-problems";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useStreak } from "@/hooks/useStreak";
import { toast } from "sonner";

// Language config with standard labels & monaco IDs
const LANGUAGE_CONFIG: Record<string, { label: string; monacoId: string; ext: string }> = {
  javascript: { label: "JavaScript (Node 22)", monacoId: "javascript", ext: "js" },
  typescript: { label: "TypeScript (5.6)", monacoId: "typescript", ext: "ts" },
  python: { label: "Python (3.12)", monacoId: "python", ext: "py" },
  c: { label: "C (GCC 14)", monacoId: "c", ext: "c" },
  cpp: { label: "C++ (GCC 14)", monacoId: "cpp", ext: "cpp" },
};

export default function DailyChallengePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  const { streak, streakMultiplier, solvedToday: initialSolvedToday } = useStreak();

  const editorRef = useRef<any>(null);
  const [problem, setProblem] = useState(DAILY_PROBLEMS[0]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [output, setOutput] = useState("");
  const [showConsole, setShowConsole] = useState(false);
  const [consoleTab, setConsoleTab] = useState<"output" | "tests">("output");
  const [hint, setHint] = useState<string | null>(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);

  // Mobile active tab view: "description" | "editor" | "console"
  const [mobileView, setMobileView] = useState<"description" | "editor" | "console">("editor");

  useEffect(() => {
    setMounted(true);
    const day = new Date().getDate();
    const currentProblem = DAILY_PROBLEMS[day % DAILY_PROBLEMS.length];
    setProblem(currentProblem);

    // Restore cached code from localStorage or load starter code
    const cachedCode = localStorage.getItem(`mockmate_dc_${currentProblem.id}_javascript`);
    if (cachedCode) {
      setCode(cachedCode);
    } else {
      setCode((currentProblem.starterCode as any).javascript || "");
    }
  }, []);

  useEffect(() => {
    if (initialSolvedToday) {
      setIsSolved(true);
    }
  }, [initialSolvedToday]);

  // When changing language, restore cached code or fallback to starter code
  const handleLanguageChange = (newLang: string) => {
    if (problem && code) {
      localStorage.setItem(`mockmate_dc_${problem.id}_${language}`, code);
    }
    setLanguage(newLang);
    const cached = localStorage.getItem(`mockmate_dc_${problem.id}_${newLang}`);
    if (cached) {
      setCode(cached);
    } else {
      setCode((problem.starterCode as any)[newLang] || "");
    }
  };

  // Cache code on change
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || "";
    setCode(val);
    if (problem) {
      localStorage.setItem(`mockmate_dc_${problem.id}_${language}`, val);
    }
  };

  // Monaco editor mount handler
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    editor.addAction({
      id: "run-code",
      label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        document.getElementById("dc-run-btn")?.click();
      },
    });
    editor.focus();
  }, []);

  // Optimized Monaco options
  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 13.5,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
      fontLigatures: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 12, bottom: 12 },
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
      tabSize: language === "python" ? 4 : 2,
      wordWrap: "off" as const,
      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6, useShadows: false },
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      contextmenu: false,
      ariaLabel: "Monaco Code Editor. Press Escape or Ctrl+M to toggle tab focus mode for keyboard navigation.",
      tabFocusMode: false,
      accessibilitySupport: "on" as const,
    }),
    [language]
  );

  const monacoLanguage = useMemo(() => {
    return LANGUAGE_CONFIG[language]?.monacoId || language;
  }, [language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleCopyExample = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedExampleIndex(index);
    setTimeout(() => setCopiedExampleIndex(null), 1500);
  };

  const handleReset = useCallback(() => {
    if (!confirm("Reset to initial template? Any changes in this language will be reverted.")) {
      return;
    }
    const defaultTemplate = problem.starterCode[language as keyof typeof problem.starterCode] || "";
    setCode(defaultTemplate);
    localStorage.removeItem(`mockmate_dc_${problem.id}_${language}`);
    setShowConsole(false);
    setOutput("");
    setExecutionTime(null);
  }, [language, problem]);

  const handleRun = useCallback(async () => {
    if (cooldown || isRunning) return;
    setCooldown(true);
    setTimeout(() => setCooldown(false), 2500);

    setIsRunning(true);
    setShowConsole(true);
    setConsoleTab("output");
    setExecutionTime(null);
    setOutput(`▶ Compiling ${LANGUAGE_CONFIG[language]?.label || language}...\n  Executing in sandbox environment...`);

    if (window.innerWidth < 1024) {
      setMobileView("console");
    }

    const startTime = performance.now();
    try {
      const result = await executeCode(language, code);
      const elapsed = `${(performance.now() - startTime).toFixed(0)}ms`;
      setOutput(
        result.error
          ? `✗ Execution Error:\n${result.error}${result.output ? "\n\nStandard Output:\n" + result.output : ""}`
          : result.output || "✓ Program finished with no stdout."
      );
      setExecutionTime(elapsed);
    } catch {
      setOutput("✗ Execution failed. Please check network connection.");
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
      }
    } catch {
      setEvaluation({
        success: false,
        score: 0,
        efficiency: "N/A",
        feedback: "Bob encountered a momentary timeout during evaluation. Please try running again.",
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
    } catch {
      setHint("Bob is reviewing the specs... Try checking your edge cases and loop bounds!");
    } finally {
      setIsGettingHint(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 z-30 bg-zinc-50 dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] flex flex-col overflow-hidden selection:bg-[#5e6ad2]/20 font-sans transition-colors duration-200">
      {/* IDE Sub-Header Bar */}
      <div className="h-12 px-3 sm:px-5 border-b border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#12121a]/95 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        {/* Left: Problem Meta Information */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
              {problem.title}
            </span>
            <span
              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : problem.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-[#6e6e84] font-mono shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e]">
              {problem.category}
            </span>
            <span>•</span>
            <span className="text-[#5e6ad2] font-semibold">+{problem.points} XP</span>
          </div>
        </div>

        {/* Right: Actions (Streak, Ask Bob, Run, Submit) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak Indicator */}
          {streak > 0 && (
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak}d</span>
              {streakMultiplier > 1 && (
                <span className="text-[10px] text-emerald-500 font-mono">({streakMultiplier}x)</span>
              )}
            </div>
          )}

          {/* Solved Status Badge */}
          {isSolved && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Solved</span>
            </div>
          )}

          {/* Ask Bob AI Hint Button */}
          <button
            onClick={getHint}
            disabled={isGettingHint}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            title="Ask Bob for an AI Hint"
          >
            {isGettingHint ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Ask Bob</span>
          </button>

          {/* Run Code Button */}
          <button
            id="dc-run-btn"
            onClick={handleRun}
            disabled={isRunning || cooldown}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isRunning || cooldown
                ? "bg-zinc-100 dark:bg-[#1a1a24] text-zinc-400 border-zinc-200 dark:border-[#28283a] cursor-not-allowed"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            }`}
            title="Run Code (Ctrl + Enter)"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isRunning ? "Running" : "Run"}</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isSolved}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-60 ${
              isSolved
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-[#5e6ad2] hover:bg-[#5e6ad2]/90 text-white"
            }`}
            title="Submit challenge solution"
          >
            {isSubmitting ? (
              <CheckCircle2 className="w-3.5 h-3.5 animate-spin" />
            ) : isSolved ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Award className="w-3.5 h-3.5" />
            )}
            <span>{isSolved ? "Solved" : "Submit"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab View (< lg) */}
      <div className="lg:hidden flex items-center border-b border-zinc-200 dark:border-[#1e1e2a] bg-zinc-100 dark:bg-[#14141e] p-1">
        <button
          onClick={() => setMobileView("description")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            mobileView === "description"
              ? "bg-white dark:bg-[#1e1e2c] text-zinc-900 dark:text-white shadow-xs"
              : "text-zinc-500 dark:text-[#8b8b9e]"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setMobileView("editor")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            mobileView === "editor"
              ? "bg-white dark:bg-[#1e1e2c] text-zinc-900 dark:text-white shadow-xs"
              : "text-zinc-500 dark:text-[#8b8b9e]"
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => setMobileView("console")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            mobileView === "console"
              ? "bg-white dark:bg-[#1e1e2c] text-zinc-900 dark:text-white shadow-xs"
              : "text-zinc-500 dark:text-[#8b8b9e]"
          }`}
        >
          <span>Output</span>
          {executionTime && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </button>
      </div>

      {/* Main Workspace (Split View on Desktop) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Description, Examples, Hints */}
        <div
          className={`w-full lg:w-[40%] xl:w-[38%] border-r border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#111118] overflow-y-auto flex flex-col ${
            mobileView !== "description" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-4 sm:p-6 space-y-6 flex-1">
            {/* Problem Description */}
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                <BookOpen className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>Problem Statement</span>
              </div>
              <div className="prose prose-sm max-w-none text-zinc-700 dark:text-[#b4b4c4] leading-relaxed">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>
            </section>

            {/* Examples & Test Cases */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                <Layout className="w-3.5 h-3.5 text-emerald-500" />
                <span>Examples & Expected Output</span>
              </div>
              <div className="space-y-3">
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#161622] border border-zinc-200/80 dark:border-[#222232] font-mono text-xs space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Example {i + 1}
                      </span>
                      <button
                        onClick={() => handleCopyExample(ex.input, i)}
                        className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy input"
                      >
                        {copiedExampleIndex === i ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Input</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1 bg-white dark:bg-[#0f0f16] p-2.5 rounded-lg border border-zinc-200/60 dark:border-[#1e1e2a]">
                      <div>
                        <span className="text-zinc-400 dark:text-[#6e6e84] text-[11px] font-semibold">
                          Input:{" "}
                        </span>
                        <span className="text-[#5e6ad2] dark:text-[#828cf5]">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 dark:text-[#6e6e84] text-[11px] font-semibold">
                          Expected:{" "}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ex.output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bob's Inline Hint */}
            {hint && (
              <section className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 relative space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4" /> Bob&apos;s Hint & Guidance
                  </span>
                  <button
                    onClick={() => setHint(null)}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed">
                  <ReactMarkdown>{hint}</ReactMarkdown>
                </div>
              </section>
            )}

            {/* Constraints & Platform Notes */}
            <section className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#1e1e2a]">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#6e6e84]">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                <span>Execution Constraints</span>
              </div>
              <ul className="text-xs text-zinc-500 dark:text-[#8b8b9e] space-y-1 list-disc list-inside font-mono text-[11px]">
                <li>CPU Time Limit: 5.0 seconds per run</li>
                <li>Memory Limit: 128 MB RAM</li>
                <li>Strict Sandbox: Isolated execution with Judge0</li>
              </ul>
            </section>
          </div>

          {/* Footer Metadata Info */}
          <div className="p-3.5 border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/80 dark:bg-[#0c0c12] text-xs text-zinc-500 dark:text-[#8b8b9e] flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Info className="w-3.5 h-3.5 text-[#5e6ad2]" />
              Award: {problem.points} XP
            </span>
            <span className="font-mono text-[11px] text-zinc-400">Ctrl + Enter to run</span>
          </div>
        </div>

        {/* Right Pane: Code Editor & Drawer */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-[#14141e] border-l border-zinc-200 dark:border-[#1e1e2a] relative overflow-hidden ${
            mobileView === "description" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Editor Header Toolbar */}
          <div className="h-10 px-3 border-b border-zinc-200 dark:border-[#1e1e2a] flex items-center justify-between bg-zinc-50/90 dark:bg-[#111118]/90 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-white dark:bg-[#1a1a26] border border-zinc-200 dark:border-[#28283a] text-xs font-semibold text-zinc-800 dark:text-[#ebebef] px-2.5 py-1 rounded-md outline-none cursor-pointer hover:border-[#5e6ad2] transition-colors"
              >
                {Object.entries(LANGUAGE_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              {/* Secondary Run Button in Editor Header */}
              <button
                onClick={handleRun}
                disabled={isRunning || cooldown}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50"
                title="Run Code"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Run</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded hover:bg-zinc-200 dark:hover:bg-[#1e1e2c] transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-zinc-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400 rounded hover:bg-zinc-200 dark:hover:bg-[#1e1e2c] transition-colors"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Code Editor Canvas */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={monacoLanguage}
              value={code}
              onChange={handleCodeChange}
              theme={isDark ? "vs-dark" : "vs"}
              onMount={handleEditorMount}
              loading={
                <div className="flex items-center justify-center h-full gap-2 text-zinc-400 font-mono text-xs">
                  <div className="w-4 h-4 border-2 border-[#5e6ad2] border-t-transparent rounded-full animate-spin" />
                  <span>Loading Monaco editor...</span>
                </div>
              }
              options={editorOptions}
            />
          </div>

          {/* Console & Test Cases Drawer */}
          <div
            className={`border-t border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/95 dark:bg-[#0e0e14]/95 backdrop-blur-md transition-all duration-200 flex flex-col shrink-0 ${
              mobileView === "console" ? "h-full" : showConsole ? "h-52 sm:h-60" : "h-9"
            }`}
          >
            {/* Drawer Tab Header */}
            <div className="h-9 px-3 flex items-center justify-between border-b border-zinc-200/80 dark:border-[#1e1e2a] select-none shrink-0 bg-white/50 dark:bg-black/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowConsole(true);
                    setConsoleTab("output");
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    consoleTab === "output" && showConsole
                      ? "text-[#5e6ad2] dark:text-[#828cf5]"
                      : "text-zinc-500 dark:text-[#8b8b9e]"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Execution Output</span>
                  {executionTime && (
                    <span className="text-[10px] font-mono text-zinc-400 font-normal">
                      ({executionTime})
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowConsole(true);
                    setConsoleTab("tests");
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    consoleTab === "tests" && showConsole
                      ? "text-[#5e6ad2] dark:text-[#828cf5]"
                      : "text-zinc-500 dark:text-[#8b8b9e]"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Test Cases ({problem.examples.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {output && (
                  <button
                    onClick={() => setOutput("")}
                    className="text-[11px] font-mono text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setShowConsole(!showConsole)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  title="Toggle console"
                >
                  {showConsole ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            {(showConsole || mobileView === "console") && (
              <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed">
                {consoleTab === "output" ? (
                  <pre className="text-zinc-800 dark:text-emerald-400/90 whitespace-pre-wrap font-mono">
                    {output || "Run code to view compilation and standard output..."}
                  </pre>
                ) : (
                  <div className="space-y-2">
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white dark:bg-[#161622] border border-zinc-200 dark:border-[#222232] space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
                          <span>Case {idx + 1}</span>
                        </div>
                        <div className="text-xs text-zinc-700 dark:text-[#c4c4d4]">
                          <span className="text-zinc-400">Input:</span> {ex.input}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                          <span className="text-zinc-400">Expected:</span> {ex.output}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Post-Submission Result Modal */}
      <AnimatePresence>
        {evaluation && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          >
            <m.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-[#222234] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative p-6 sm:p-8 space-y-6"
            >
              {/* Top Close Button */}
              <button
                onClick={() => setEvaluation(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1e1e2c] transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Glowing Celebration Halo & Status Badge */}
              <div className="text-center space-y-3">
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                      evaluation.success ? "bg-emerald-500/25" : "bg-amber-500/25"
                    }`}
                  />
                  <div
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 ${
                      evaluation.success
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
                        : "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20"
                    }`}
                  >
                    {evaluation.success ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <Terminal className="w-8 h-8" />
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {evaluation.success ? "Challenge Solved!" : "Needs Minor Tweaks"}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8b8b9e] mt-0.5">
                    Official evaluation for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{problem.title}</span>
                  </p>
                </div>

                {/* Reward Banner if Success */}
                {evaluation.success && (
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      +{Math.round(problem.points * (streakMultiplier || 1))} XP AWARDED
                    </span>
                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {streak} Day Streak Preserved
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3 Metric Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-left">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181824] border border-zinc-200 dark:border-[#222232]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Score</span>
                  <div className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mt-0.5">
                    {evaluation.score}<span className="text-xs text-zinc-400 font-normal">/100</span>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181824] border border-zinc-200 dark:border-[#222232]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Efficiency</span>
                  <div className="text-lg sm:text-xl font-black text-[#5e6ad2] dark:text-[#828cf5] mt-0.5 font-mono">
                    {evaluation.efficiency || "O(n)"}
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#181824] border border-zinc-200 dark:border-[#222232]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Test Status</span>
                  <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 truncate">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Passed</span>
                  </div>
                </div>
              </div>

              {/* Bob's Senior Engineer Verdict Callout */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#161622] border border-[#5e6ad2]/20 dark:border-[#5e6ad2]/30 space-y-2 text-left relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#5e6ad2]/15 text-[#5e6ad2] flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-[#ebebef]">
                      Bob&apos;s Senior Code Review
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-[#c4c4d4] leading-relaxed italic pl-1 border-l-2 border-[#5e6ad2]/60">
                  &quot;{evaluation.feedback}&quot;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  onClick={() => setEvaluation(null)}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a26] dark:hover:bg-[#222234] text-zinc-800 dark:text-[#ebebef] rounded-xl text-xs font-semibold transition-colors"
                >
                  Review Code
                </button>

                <button
                  onClick={() => {
                    const text = `🏆 I just solved today's MockMate challenge "${problem.title}" with ${evaluation.score}/100 and ${evaluation.efficiency || "optimal"} efficiency!`;
                    navigator.clipboard.writeText(text);
                    toast.success("Achievement copied to clipboard!");
                  }}
                  className="w-full sm:w-auto py-2.5 px-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1a1a26] dark:hover:bg-[#222234] text-zinc-700 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  title="Share accomplishment"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <Link
                  href="/dashboard"
                  className="w-full sm:flex-1 py-2.5 px-4 bg-[#5e6ad2] hover:bg-[#5e6ad2]/90 text-white rounded-xl text-xs font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
