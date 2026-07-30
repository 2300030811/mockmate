"use client";

import { Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { UniversalQuizShell } from "@/components/quiz/UniversalQuizShell";
import { QuizMode } from "@/types";
import { resolveCategory } from "@/lib/quiz-registry";
import type { QuizCategoryId } from "@/lib/quiz-registry";

function QuizContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const config = resolveCategory(slug);

  if (!config) {
    notFound();
  }

  const modeParam = searchParams?.get("mode");
  const countParam = searchParams?.get("count");
  const mode: QuizMode = modeParam === "exam" ? "exam" : "practice";

  return (
    <UniversalQuizShell
      category={config.id as QuizCategoryId}
      mode={mode}
      count={countParam}
    />
  );
}

export default function DynamicQuizPage() {
  const params = useParams<{ quizSlug: string }>();
  const slug = params?.quizSlug ?? "";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
          Loading Quiz...
        </div>
      }
    >
      <QuizContent slug={slug} />
    </Suspense>
  );
}
