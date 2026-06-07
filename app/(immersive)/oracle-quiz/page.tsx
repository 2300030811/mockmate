"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UniversalQuizShell } from "@/components/quiz/UniversalQuizShell";
import { QuizMode } from "@/types";

function OracleQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const countParam = searchParams?.get("count");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <UniversalQuizShell category="oracle" mode={mode} count={countParam} />;
}

export default function OracleQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <OracleQuizContent />
    </Suspense>
  );
}
