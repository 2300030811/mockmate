import { QuizQuestion } from "@/types";
import { Check, Code } from "lucide-react";
import { useTheme } from "@/app/providers";

import { useState } from "react";

interface PCAPQuestionCardProps {
  question: QuizQuestion;
  selectedAnswers: string[];
  onAnswer: (option: string, isMulti: boolean) => void;
  isSubmitted: boolean;
  mode: "practice" | "exam";
  checkAnswer: (q: QuizQuestion, answers: string[]) => boolean;
}

export function PCAPQuestionCard({
  question,
  selectedAnswers = [],
  onAnswer,
  isSubmitted,
  mode,
  checkAnswer,
}: PCAPQuestionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isMultiSelect = (text: string, type: string) => {
    return (
      type === "MSQ" ||
      /\((Choose|Select|Check)\s+(two|three|four|\multiple|\d+)/i.test(text)
    );
  };

  const isMulti = isMultiSelect(question.question, question.type);

  // Show results if we are in practice mode and have answered, OR if the exam is submitted
  const showResult =
    (mode === "practice" && selectedAnswers.length > 0) || isSubmitted;

  // Determine if the user is correct (only if we are showing results)
  const isCorrect = showResult ? checkAnswer(question, selectedAnswers) : false;

  // Handle options properly if they are undefined or not array (though strict checks should prevent this)
  const options = "options" in question ? question.options || [] : [];

  // Detect if the question text itself contains embedded code (Python keywords, \n newlines, etc.)
  const hasEmbeddedCode = (text: string): boolean => {
    const codePatterns =
      /(\bdef\b|\bclass\b|\bimport\b|\bprint\b|\bfor\b.*:|\bwhile\b.*:|\bif\b.*:|\btry\b:|\bexcept\b|\blambda\b|\breturn\b)/;
    const hasNewlines = text.includes("\\n") || text.includes("\n");
    const hasIndentation = /\n\s{2,}/.test(text) || /\\n\s{2,}/.test(text);
    return (codePatterns.test(text) && hasNewlines) || hasIndentation;
  };

  // Extract question text and code from embedded format
  const extractQuestionAndCode = (
    text: string,
  ): { questionText: string; codeBlock: string | null } => {
    // Common patterns: "What is the output of the following code?\n\ncode here"
    // Or the code is fully embedded in the question text
    const splitPatterns = [
      /^(.*?(?:following code|code snippet|this code|program|script)[?:.]?\s*)\n([\s\S]+)$/i,
      /^(.*?(?:following code|code snippet|this code|program|script)[?:.]?\s*)\\n([\s\S]+)$/i,
      /^(.*?\?)\s*\n\n([\s\S]*(?:def |class |import |print|for |while |if |lambda )[\s\S]*)$/i,
    ];

    for (const pattern of splitPatterns) {
      const match = text.match(pattern);
      if (match) {
        return { questionText: match[1].trim(), codeBlock: match[2].trim() };
      }
    }

    // If the whole text looks like code, treat it all as code
    if (hasEmbeddedCode(text)) {
      return { questionText: "", codeBlock: text };
    }

    return { questionText: text, codeBlock: null };
  };

  // Get the explicit code field or try to extract embedded code
  const explicitCode =
    "code" in question
      ? ((question as any).code as string | undefined)
      : undefined;
  const { questionText, codeBlock } = explicitCode
    ? { questionText: question.question, codeBlock: null } // If explicit code exists, don't parse the question
    : extractQuestionAndCode(question.question);

  const codeToRender = explicitCode || codeBlock;

  // Render the code snippet box
  const renderCodeSnippet = (code: string) => {
    // Normalize escaped newlines to actual newlines
    const normalizedCode = code.replace(/\\n/g, "\n").replace(/\\t/g, "  ");
    const lines = normalizedCode.split("\n");

    return (
      <div
        className={`mb-6 rounded-xl overflow-hidden border ${
          isDark ? "border-gray-700 bg-gray-950" : "border-gray-200 bg-gray-50"
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider border-b ${
            isDark
              ? "bg-gray-800/80 border-gray-700 text-gray-400"
              : "bg-gray-100 border-gray-200 text-gray-500"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>Python Code</span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>
        {/* Code body with line numbers */}
        <div className="overflow-x-auto">
          <pre
            className={`p-4 text-sm leading-relaxed font-mono ${
              isDark ? "text-gray-300" : "text-gray-800"
            }`}
          >
            <code>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span
                    className={`inline-block w-8 text-right mr-4 select-none ${
                      isDark ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    );
  };

  const displayQuestionText = explicitCode ? question.question : questionText;

  return (
    <div
      className={`p-6 md:p-10 rounded-3xl shadow-sm border transition-colors duration-300 ${
        isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        {displayQuestionText && (
          <h2
            className={`text-xl md:text-2xl font-bold leading-relaxed ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {displayQuestionText}
          </h2>
        )}

        {isMulti && (
          <span
            className={`block text-sm font-semibold mt-2 px-3 py-1 rounded-full w-fit ${
              isDark
                ? "bg-blue-900/30 text-blue-400"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            Select Multiple Answers
          </span>
        )}
      </div>

      {/* Code Snippet Box */}
      {codeToRender && renderCodeSnippet(codeToRender)}

      <div className="space-y-4">
        {options.map((option: string, idx: number) => {
          const isSelected = selectedAnswers.includes(option);

          let optionClass = `w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group cursor-pointer `;

          if (isSelected) {
            optionClass += isDark
              ? "border-blue-500 bg-blue-900/40 text-white font-semibold shadow-sm"
              : "border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-sm";
          } else {
            optionClass += isDark
              ? "border-gray-800 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-700"
              : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300";
          }

          return (
            <button
              key={idx}
              onClick={() => onAnswer(option, isMulti)}
              disabled={isSubmitted}
              className={`${optionClass} ${isSubmitted ? "cursor-default" : ""}`}
            >
              <span
                className={`flex-1 text-base font-medium ${
                  isDark && !isSelected ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {option}
              </span>
              {isSelected && (
                <span
                  className={
                    isDark ? "ml-3 text-blue-400" : "ml-3 text-blue-600"
                  }
                >
                  <Check className="h-6 w-6" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div
          className={`mt-8 p-6 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
            isCorrect
              ? isDark
                ? "bg-green-900/20 border-green-800 text-green-100"
                : "bg-green-50 border-green-200 text-green-900"
              : isDark
                ? "bg-red-900/20 border-red-800 text-red-100"
                : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <span className="text-xl font-bold">✅ Correct</span>
            ) : (
              <span className="text-xl font-bold">❌ Incorrect</span>
            )}
          </div>

          <p className="mb-2">
            <strong>Correct Answer:</strong>{" "}
            <span className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded">
              {Array.isArray(question.answer)
                ? question.answer.join(", ")
                : typeof question.answer === "object"
                  ? JSON.stringify(question.answer)
                  : (question.answer ?? "N/A")}
            </span>
          </p>
          {question.explanation && (
            <div
              className={`mt-4 pt-4 border-t ${
                isDark ? "border-white/10" : "border-black/10"
              }`}
            >
              <p className="font-semibold mb-1 opacity-75 uppercase text-xs tracking-wider">
                Explanation
              </p>
              <p className="leading-relaxed opacity-90">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
