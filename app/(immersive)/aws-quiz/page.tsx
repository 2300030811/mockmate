"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UniversalQuizShell } from "@/components/quiz/UniversalQuizShell";
import { QuizMode } from "@/types";

function AWSQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <UniversalQuizShell category="aws" mode={mode} />;
}

export default function AWSQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <AWSQuizContent />
    </Suspense>
  );
}