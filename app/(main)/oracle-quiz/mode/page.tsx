"use client";

import { GenericModeSelect } from "@/components/quiz/GenericModeSelect";
import { quizThemes } from "@/lib/quiz-themes";

export default function ModeSelect() {
  return <GenericModeSelect config={quizThemes.oracle} />;
}
