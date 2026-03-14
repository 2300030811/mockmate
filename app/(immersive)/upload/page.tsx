"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { convertFileAction, generateQuizAction } from "@/app/actions/generator";
import { NavigationPill } from "@/components/ui/NavigationPill";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { cn } from "@/lib/utils";

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
  const [visionData, setVisionData] = useState<{ text: string, base64: string } | null>(null);
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
  if (!mounted) return <div className="min-h-screen bg-white dark:bg-gray-950" />;

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
    return <QuizResults quiz={quiz} answers={answers} isDark={isDark} fileName={file?.name} />;
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
    <div className={cn("min-h-screen transition-colors duration-500", isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900")}>
      {/* Premium Navigation */}
      <NavigationPill showHome showBack={false} />
      
      {/* Theme Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeSwitcher />
      </div>

      <QuizUpload
        isDark={isDark}
        file={file}
        onFileChange={handleFileChange}
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
