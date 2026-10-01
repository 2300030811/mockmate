"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import { convertFileAction, generateQuizAction } from "@/app/actions/generator";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { HomeBackground } from "@/components/home/HomeBackground";

// Sub-components
import { QuizUpload } from "./components/QuizUpload";
import { QuizGame } from "./components/QuizGame";
import { QuizResults } from "./components/QuizResults";
import { FlashcardGame } from "./components/FlashcardGame";

export default function UploadPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // State
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Settings
  const [customApiKey, setCustomApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai" | "groq" | "auto">("auto");
  const [count, setCount] = useState(15);
  const [difficulty, setDifficulty] = useState("medium");
  const [mode, setMode] = useState<"quiz" | "flashcard">("quiz");
  const [visionData, setVisionData] = useState<{ text: string; base64: string } | null>(null);
  const [loadingStep, setLoadingStep] = useState("");

  // Sync mounted state to prevent hydration flicker
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError("");
      setVisionData(null);
    }
  };

  const handleGenerate = async (useVision: boolean = false) => {
    if (!file && !visionData) return;
    setIsUploading(true);
    setError("");
    setLoadingStep("Reading your document...");
    setQuiz(null); // Clear previous quiz
    setAnswers({}); // Clear answers
    setShowResults(false);

    try {
      let textContent = "";
      let base64Pdf = "";

      if (useVision && visionData) {
        base64Pdf = visionData.base64;
        setLoadingStep("AI Vision is analyzing the pages...");
      } else {
        const formData = new FormData();
        formData.append("file", file!);

        const convertData = await convertFileAction(formData);

        if (convertData && 'error' in convertData) {
          throw new Error(convertData.error as string);
        }

        if (convertData.isScanned) {
          setVisionData({ text: "", base64: convertData.base64 || "" });
          setIsUploading(false);
          return;
        }
        textContent = convertData.text || "";
      }

      setLoadingStep(mode === "flashcard" ? "Extracting key concepts..." : "Crafting high-quality quiz questions...");

      const questions = await generateQuizAction(
        textContent,
        provider,
        customApiKey,
        base64Pdf,
        count,
        difficulty,
        mode
      );

      if (questions && 'error' in questions) {
        throw new Error(questions.error as string);
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI could not generate valid content. Try a different file.");
      }

      setQuiz(questions);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
      setLoadingStep("");
    }
  };

  // Prevent flash during hydration
  if (!mounted) return <div className="min-h-screen bg-white dark:bg-[#0d0d12]" />;

  const isDark = resolvedTheme === "dark";

  // --- RENDERING LOGIC ---

  // 1. Flashcard View
  if (quiz && quiz.length > 0 && mode === "flashcard") {
    return (
      <FlashcardGame
        cards={quiz}
        isDark={isDark}
        onExit={() => {
          setQuiz(null);
          setMode("quiz");
        }}
      />
    );
  }

  // 2. Results View (Quiz Only)
  if (quiz && showResults) {
    return (
      <QuizResults
        quiz={quiz}
        answers={answers}
        isDark={isDark}
        fileName={file?.name}
        onRetake={() => {
          setAnswers({});
          setCurrent(0);
          setShowResults(false);
        }}
        onReset={() => {
          setQuiz(null);
          setFile(null);
          setAnswers({});
          setCurrent(0);
          setShowResults(false);
        }}
      />
    );
  }

  // 3. Quiz View
  if (quiz && quiz.length > 0) {
    return (
      <QuizGame
        quiz={quiz}
        current={current}
        setCurrent={setCurrent}
        answers={answers}
        setAnswers={setAnswers}
        setShowResults={setShowResults}
        isDark={isDark}
        setTheme={setTheme}
      />
    );
  }

  // 4. Upload View (Default)
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 pt-14 transition-colors overflow-x-hidden">
      {/* Precision 28px Grid & Horizon Illumination */}
      <HomeBackground />

      {/* Unified Platform Header */}
      <header className="fixed top-0 inset-x-0 h-14 border-b border-zinc-200/80 dark:border-[#1e1e2a]/80 bg-white/85 dark:bg-[#0d0d12]/85 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-[#4f5ac4] transition-colors">
              M
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] tracking-tight">MockMate</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-[#8b8b9e]">AI Quiz Generator</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] border border-transparent hover:border-zinc-200 dark:hover:border-[#1e1e2a] transition-all"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Back to Hub</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </header>

      <QuizUpload
        isDark={isDark}
        file={file}
        onFileChange={handleFileChange}
        onClearFile={() => { setFile(null); setVisionData(null); setError(""); }}
        error={error}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        count={count}
        setCount={setCount}
        isUploading={isUploading}
        loadingStep={loadingStep}
        handleGenerate={handleGenerate}
        visionData={visionData}
        setVisionData={setVisionData}
        provider={provider}
        setProvider={setProvider}
        setCustomApiKey={setCustomApiKey}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );
}
