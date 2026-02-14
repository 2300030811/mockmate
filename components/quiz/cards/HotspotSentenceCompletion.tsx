
"use client";

import { HotspotSentenceQuestion } from "@/types";
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

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
      <div className={`backdrop-blur-xl border rounded-3xl p-6 md:p-10 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        {/* Question with blank */}
        <div className={`text-xl md:text-2xl font-semibold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {hasBlank ? (
            <div className="flex flex-wrap items-center gap-3 leading-loose">
              <span>{parts[0]}</span>
              <motion.div 
                layout
                className={`inline-flex items-center min-w-[200px] px-4 py-2 rounded-lg border-2 border-dashed transition-all
                ${userAnswer 
                  ? (isDark ? 'border-blue-500/50 bg-blue-500/10' : 'border-blue-500 bg-blue-50')
                  : (isDark ? 'border-white/30 bg-white/5' : 'border-gray-300 bg-gray-100')
                }
                ${isReviewMode && isCorrect ? '!border-green-500/50 !bg-green-500/10' : ''}
                ${isReviewMode && !isCorrect && userAnswer ? '!border-red-500/50 !bg-red-500/10' : ''}
              `}>
                {userAnswer ? (
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {userAnswer}
                  </span>
                ) : (
                  <span className={`text-sm italic ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    Select option below
                  </span>
                )}
              </motion.div>
              {parts[1] && <span>{parts[1]}</span>}
            </div>
          ) : (
            <span>{question.question}</span>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            Select the correct option:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {question.hotspot_options.map((option, index) => {
                const isSelected = userAnswer === option;
                const isTheCorrectAnswer = question.answer === option;

                let borderColor = isDark ? "border-white/10" : "border-gray-200";
                let bgColor = isDark ? "bg-white/5" : "bg-white";
                let textColor = isDark ? "text-white/90" : "text-gray-700";

                if (isReviewMode) {
                if (isTheCorrectAnswer) {
                    borderColor = "border-green-500/50";
                    bgColor = "bg-green-500/20";
                    textColor = isDark ? "text-white" : "text-gray-900";
                } else if (isSelected && !isTheCorrectAnswer) {
                    borderColor = "border-red-500/50";
                    bgColor = "bg-red-500/20";
                    textColor = isDark ? "text-white" : "text-gray-900";
                }
                } else if (isSelected) {
                borderColor = "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
                bgColor = "bg-blue-500/20";
                textColor = isDark ? "text-white font-bold" : "text-blue-900 font-bold";
                }

                return (
                <motion.button
                    key={index}
                    layout
                    whileHover={!isReviewMode ? { scale: 1.02, x: 5 } : {}}
                    whileTap={!isReviewMode ? { scale: 0.98 } : {}}
                    onClick={() => !isReviewMode && onAnswer(option)}
                    disabled={isReviewMode}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all duration-200 group`}
                >
                    <span className={`text-left ${textColor} text-lg font-medium`}>{option}</span>
                    
                    {isReviewMode && isTheCorrectAnswer && (
                    <div className="ml-auto flex items-center gap-2 text-green-500 font-bold">
                        Correct <Check className="w-5 h-5" />
                    </div>
                    )}
                    {isReviewMode && isSelected && !isTheCorrectAnswer && (
                    <div className="ml-auto flex items-center gap-2 text-red-500 font-bold">
                        Incorrect <X className="w-5 h-5" />
                    </div>
                    )}
                </motion.button>
                );
            })}
          </div>
        </div>

        {/* Explanation */}
        {isReviewMode && question.explanation && (
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-8 p-6 border rounded-3xl ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
           >
             <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold">
                <div className="p-1 rounded bg-blue-500/20"><Check className="w-4 h-4" /></div>
                Explanation
             </div>
             <p className={`text-base md:text-lg ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
           </motion.div>
        )}
      </div>
    </div>
  );
}
