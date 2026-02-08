"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QuizContainer } from "@/components/azure-quiz/QuizContainer";
import { QuizMode } from "@/hooks/useAzureQuiz";

function AzureQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  
  // Default to practice if invalid
  const mode: QuizMode = (modeParam === "exam" || modeParam === "review") ? modeParam : "practice";

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
         <QuizContainer mode={mode} />
      </div>
    </div>
  );
}

export default function AzureQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <AzureQuizContent />
    </Suspense>
  );
}
