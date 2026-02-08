
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MongoDBQuizShell } from "@/components/mongodb-quiz/MongoDBQuizShell";
import { QuizMode } from "@/types";

function MongoDBQuizContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <MongoDBQuizShell mode={mode} />;
}

export default function MongoDBQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Quiz...</div>}>
      <MongoDBQuizContent />
    </Suspense>
  );
}
