"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { GenericModeSelect } from "@/components/quiz/GenericModeSelect";
import { resolveCategory } from "@/lib/quiz-registry";
import { quizThemes } from "@/lib/quiz-themes";
import type { QuizCategoryId } from "@/lib/quiz-registry";

export default function DynamicModeSelect() {
  const params = useParams<{ quizSlug: string }>();
  const slug = params?.quizSlug ?? "";

  const config = resolveCategory(slug);
  if (!config) {
    notFound();
  }

  const theme = quizThemes[config.id as QuizCategoryId];
  if (!theme) {
    notFound();
  }

  return <GenericModeSelect config={theme} />;
}
