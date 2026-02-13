"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OracleQuizShell } from "@/components/oracle-quiz/OracleQuizShell";
import { QuizMode } from "@/types";

function OracleQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <OracleQuizShell mode={mode} />;
}

export default function OracleQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <OracleQuizContent />
    </Suspense>
  );
}
