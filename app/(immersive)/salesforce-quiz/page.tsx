
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UniversalQuizShell } from "@/components/quiz/UniversalQuizShell";
import { QuizMode } from "@/types";

function SalesforceQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const countParam = searchParams?.get("count");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <UniversalQuizShell category="salesforce" mode={mode} count={countParam} />;
}

export default function SalesforceQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <SalesforceQuizContent />
    </Suspense>
  );
}
