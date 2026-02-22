"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/providers";
import { convertFileAction, generateQuizAction } from "@/app/actions/generator";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

// Sub-components
import { QuizUpload } from "./components/QuizUpload";
import { QuizGame } from "./components/QuizGame";
import { QuizResults } from "./components/QuizResults";
import { FlashcardGame } from "./components/FlashcardGame";

export default function UploadPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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
        
        if (convertData.isScanned) {
           setVisionData({ text: "", base64: convertData.base64 || "" });
           setIsUploading(false);
           return;
        }
        textContent = convertData.text;
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

      if (!questions || questions.length === 0) {
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
        toggleTheme={toggleTheme}
      />
    );
  }

  // 4. Upload View (Default)
  return (
    <div className={isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"}>
       {/* Navigation Pill */}
       <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95 group">
          <Home className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
          <span>Home</span>
        </Link>
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
