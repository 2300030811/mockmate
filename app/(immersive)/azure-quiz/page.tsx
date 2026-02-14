"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UniversalQuizShell } from "@/components/quiz/UniversalQuizShell";
import { QuizMode } from "@/types";

function AzureQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <UniversalQuizShell category="azure" mode={mode} />;
}

export default function AzureQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <AzureQuizContent />
    </Suspense>
  );
}
