"use client";

import { useSearchParams } from "next/navigation";
import { AWSQuizShell } from "@/components/aws-quiz/AWSQuizShell";
import { QuizMode } from "@/hooks/useAWSQuiz";

export default function AWSQuizPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <AWSQuizShell mode={mode} />;
}