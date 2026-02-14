"use client";

import { HotspotSentenceQuestion } from "@/types";

interface HotspotSentenceProps {
  question: HotspotSentenceQuestion;
  userAnswer?: string;
  onAnswer: (answer: string) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function HotspotSentenceCompletion({
  question,
  userAnswer,
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: HotspotSentenceProps) {
  const isCorrect = userAnswer === question.answer;

  // Split question at the blank (represented by ___)
  const parts = question.question.split('__________');
  const hasBlank = parts.length > 1;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        {/* Question with blank */}
        <div className={`text-xl md:text-2xl font-semibold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {hasBlank ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>{parts[0]}</span>
              <div className={`inline-flex items-center min-w-[200px] px-4 py-2 rounded-lg border-2 border-dashed transition-all
                ${userAnswer 
                  ? (isDark ? 'border-blue-500/50 bg-blue-500/10' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-white/30 bg-white/5' : 'border-gray-300 bg-gray-100')
                }
                ${isReviewMode && isCorrect ? (isDark ? 'border-green-500/50 bg-green-500/10' : 'border-green-500 bg-green-50') : ''}
                ${isReviewMode && !isCorrect && userAnswer ? (isDark ? 'border-red-500/50 bg-red-500/10' : 'border-red-500 bg-red-50') : ''}
              `}>
                {userAnswer ? (
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {userAnswer}
                  </span>
                ) : (
                  <span className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    Select an option below
                  </span>
                )}
              </div>
              {parts[1] && <span>{parts[1]}</span>}
            </div>
          ) : (
            <span>{question.question}</span>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <h4 className={`text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            Select the correct option:
          </h4>
          {question.hotspot_options.map((option, index) => {
            const isSelected = userAnswer === option;
            const isTheCorrectAnswer = question.answer === option;

            let borderColor = isDark ? "border-white/10" : "border-gray-200";
            let bgColor = isDark ? "bg-white/5" : "bg-white";
            let textColor = isDark ? "text-white/90" : "text-gray-700";

            if (isReviewMode) {
              if (isTheCorrectAnswer) {
                borderColor = "border-green-500/50";
                bgColor = "bg-green-500/10";
                textColor = isDark ? "text-white" : "text-gray-900";
              } else if (isSelected && !isTheCorrectAnswer) {
                borderColor = "border-red-500/50";
                bgColor = "bg-red-500/10";
                textColor = isDark ? "text-white" : "text-gray-900";
              }
            } else if (isSelected) {
              borderColor = "border-blue-500";
              bgColor = "bg-blue-500/10";
              textColor = isDark ? "text-white" : "text-blue-900";
            }

            return (
              <button
                key={index}
                onClick={() => onAnswer(option)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${borderColor} ${bgColor} transition-all duration-200 group
                  ${'hover:scale-[1.01] active:scale-[0.99] hover:brightness-105'}
                `}
              >
                <span className={`text-left ${textColor} font-medium`}>{option}</span>
                
                {isReviewMode && isTheCorrectAnswer && (
                  <span className="ml-auto text-green-500 text-sm font-medium flex items-center gap-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Correct
                  </span>
                )}
                {isReviewMode && isSelected && !isTheCorrectAnswer && (
                  <span className="ml-auto text-red-500 text-sm font-medium flex items-center gap-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Your Answer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isReviewMode && question.explanation && (
          <div 
            className={`mt-6 p-4 border rounded-xl animate-in fade-in duration-300 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
          >
            <h4 className="text-blue-500 font-medium mb-2">Explanation</h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
