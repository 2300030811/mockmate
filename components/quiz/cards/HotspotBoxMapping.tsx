
"use client";

import { HotspotBoxMappingQuestion } from "@/types";
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface HotspotBoxMappingProps {
  question: HotspotBoxMappingQuestion;
  userAnswer?: Record<number, string>; // Map box index to selected option
  onAnswer: (answer: Record<number, string>) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function HotspotBoxMapping({
  question,
  userAnswer = {},
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: HotspotBoxMappingProps) {
  
  const handleSelect = (boxIndex: number, option: string) => {
    if (isReviewMode) return;
    onAnswer({
      ...userAnswer,
      [boxIndex]: option
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className={`backdrop-blur-xl border rounded-3xl p-6 md:p-10 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        <h3 className={`text-xl md:text-2xl font-bold mb-8 leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {question.question}
        </h3>

        <div className="space-y-6">
          {question.boxes.map((box, boxIndex) => {
            const selectedOption = userAnswer[boxIndex];
            const correctOption = box.answer;
            const isCorrect = selectedOption === correctOption;

            return (
              <motion.div 
                key={boxIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: boxIndex * 0.1 }}
                className={`p-6 rounded-2xl border-2 transition-colors
                  ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}
                  ${isReviewMode && isCorrect ? '!border-green-500/50 !bg-green-500/10' : ''}
                  ${isReviewMode && !isCorrect && selectedOption ? '!border-red-500/50 !bg-red-500/10' : ''}
                `}
              >
                {/* Label */}
                <div className={`font-medium mb-4 text-lg ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                  {box.label}
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-3">
                  {box.options.map((option, optIndex) => {
                    const isSelected = selectedOption === option;
                    const isTheCorrectOption = correctOption === option;

                    let buttonClass = '';
                    let borderColor = '';
                    let bgColor = '';
                    let textColor = '';

                    if (isReviewMode) {
                      if (isTheCorrectOption) {
                        borderColor = 'border-green-500/50';
                        bgColor = 'bg-green-500/20';
                        textColor = 'text-green-500';
                      } else if (isSelected && !isTheCorrectOption) {
                        borderColor = 'border-red-500/50';
                        bgColor = 'bg-red-500/20';
                        textColor = 'text-red-500';
                      } else {
                        borderColor = isDark ? 'border-white/20' : 'border-gray-200';
                        bgColor = 'bg-transparent';
                        textColor = isDark ? 'text-white/50' : 'text-gray-400';
                      }
                    } else if (isSelected) {
                      borderColor = 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
                      bgColor = 'bg-blue-500/20';
                      textColor = isDark ? 'text-white font-bold' : 'text-blue-900 font-bold';
                    } else {
                      borderColor = isDark ? 'border-white/20' : 'border-gray-200';
                      bgColor = isDark ? 'bg-white/5' : 'bg-white';
                      textColor = isDark ? 'text-white/70' : 'text-gray-700';
                    }

                    buttonClass = `px-5 py-3 rounded-xl border-2 font-medium transition-all ${borderColor} ${bgColor} ${textColor} text-sm md:text-base`;

                    return (
                      <motion.button
                        key={optIndex}
                        onClick={() => handleSelect(boxIndex, option)}
                        className={buttonClass}
                        whileHover={!isReviewMode ? { scale: 1.05 } : {}}
                        whileTap={!isReviewMode ? { scale: 0.95 } : {}}
                        layout
                      >
                         <span className="flex items-center gap-2">
                            {option}
                             {isReviewMode && isTheCorrectOption && <Check className="w-4 h-4 ml-1" />}
                             {isReviewMode && isSelected && !isTheCorrectOption && <X className="w-4 h-4 ml-1" />}
                         </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Show correct answer if wrong */}
                <AnimatePresence>
                    {isReviewMode && !isCorrect && selectedOption && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 text-sm text-green-500 flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Correct answer: <span className="font-bold">{correctOption}</span>
                    </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            );
          })}
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
