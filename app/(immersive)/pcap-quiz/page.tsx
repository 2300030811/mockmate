"use client";

import { useSearchParams } from "next/navigation";
import { PCAPQuizShell } from "@/components/pcap-quiz/PCAPQuizShell";
import { QuizMode } from "@/types";

export default function PCAPQuizPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const mode: QuizMode = (modeParam === "exam") ? "exam" : "practice";

  return <PCAPQuizShell mode={mode} />;
}

// Force recompile
