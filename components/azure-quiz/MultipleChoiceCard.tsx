"use client";


import { MCQQuestion } from '@/types';

interface MultipleChoiceCardProps {
  question: MCQQuestion;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function MultipleChoiceCard({
  question,
  selectedAnswer,
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: MultipleChoiceCardProps) {
  // Handle both letter-based answers (A, B, C) and text-based answers (Yes, No, option text)
  const getCorrectAnswerLetter = () => {
    const rawAnswer = question.answer;
    
    // If it's an array, we might be in MSQ mode but this component seems built for single select.
    // Let's assume for this card we just take the first if array, or return raw.
    // Better: check if it's array and handle safely.
    if (Array.isArray(rawAnswer)) {
        // If MSQ, we can't easily map to a single letter. Return null or handle differently.
        // For now, let's treat it as string if possible or just use the first element if it matches.
        return rawAnswer[0]; // Fallback
    }

    // If answer is already a letter (A, B, C, etc.), return it
    if (rawAnswer.length === 1 && /[A-Z]/i.test(rawAnswer)) {
      return rawAnswer.toUpperCase();
    }
    // Otherwise, find the index of the answer text in options
    const answerIndex = question.options.findIndex(opt => opt === rawAnswer);
    if (answerIndex !== -1) {
      return String.fromCharCode(65 + answerIndex); // Convert to A, B, C, etc.
    }
    return rawAnswer; // Fallback
  };

  const correctAnswerLetter = getCorrectAnswerLetter();
  const isCorrect = selectedAnswer === correctAnswerLetter;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        <h3 className={`text-xl md:text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C...
            const isSelected = selectedAnswer === letter;
            const isTheCorrectAnswer = correctAnswerLetter === letter;
            
            let borderColor = isDark ? "border-white/10" : "border-gray-200";
            let bgColor = isDark ? "bg-white/5" : "bg-white";
            let textColor = isDark ? "text-white/90" : "text-gray-700";
            let circleBorder = isDark ? "border-white/30" : "border-gray-300";
            let circleText = isDark ? "text-white/70" : "text-gray-500";

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
              circleBorder = "border-transparent";
              circleText = "text-white";
            }

            return (
              <button
                key={index}
                onClick={() => onAnswer(letter)}
                className={`w-full flex items-center p-4 rounded-xl border ${borderColor} ${bgColor} transition-all duration-200 group relative overflow-hidden
                    ${'hover:scale-[1.01] active:scale-[0.99] hover:brightness-105'}
                `}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center mr-4 transition-colors
                  ${circleBorder} ${isSelected ? 'bg-blue-500 text-white' : circleText}
                `}>
                  {letter}
                </div>
                <span className={`text-left ${textColor}`}>{option}</span>
                
                {isReviewMode && isTheCorrectAnswer && (
                  <span className="ml-auto text-green-500 text-sm font-medium">Correct</span>
                )}
                {isReviewMode && isSelected && !isTheCorrectAnswer && (
                  <span className="ml-auto text-red-500 text-sm font-medium">Your Answer</span>
                )}
              </button>
            );
          })}
        </div>

        {isReviewMode && (
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
