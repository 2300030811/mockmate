
"use client";

import { useSearchParams } from "next/navigation";
import { SalesforceQuizShell } from "@/components/salesforce-quiz/SalesforceQuizShell";
import { QuizMode } from "@/types";

export default function SalesforceQuizPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const countParam = searchParams?.get("count");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <SalesforceQuizShell mode={mode} count={countParam} />;
}
