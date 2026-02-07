
"use client";

import { useSearchParams } from "next/navigation";
import { MongoDBQuizShell } from "@/components/mongodb-quiz/MongoDBQuizShell";
import { QuizMode } from "@/types";

export default function MongoDBQuizPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <MongoDBQuizShell mode={mode} />;
}
