"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UniversalQuizShell } from "@/components/quiz/UniversalQuizShell";
import { QuizMode } from "@/types";

function WTNQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <UniversalQuizShell category="wtn-m1" mode={mode} />;
}

export default function WTNQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <WTNQuizContent />
    </Suspense>
  );
}
