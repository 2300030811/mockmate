
"use client";

import { HotspotYesNoTableQuestion } from "@/types";
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface HotspotYesNoTableNewProps {
  question: HotspotYesNoTableQuestion;
  userAnswer?: Record<number, "Yes" | "No">; // Map statement index to answer
  onAnswer: (answer: Record<number, "Yes" | "No">) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function HotspotYesNoTableNew({
  question,
  userAnswer = {},
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: HotspotYesNoTableNewProps) {
  
  const handleToggle = (index: number, value: "Yes" | "No") => {
    if (isReviewMode) return;
    onAnswer({
      ...userAnswer,
      [index]: value
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

        <div className="space-y-4">
            {/* Header for Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-2 text-sm font-bold uppercase tracking-widest opacity-50">
                <div className="col-span-8">Statement</div>
                <div className="col-span-2 text-center">Yes</div>
                <div className="col-span-2 text-center">No</div>
            </div>

            {question.statements.map((stmt, idx) => {
                const currentVal = userAnswer[idx];
                const correctVal = stmt.answer;
                const isCorrect = currentVal === correctVal;

                return (
                 <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl border-2 transition-all items-center
                            ${isDark 
                                ? 'bg-white/5 border-white/5 hover:border-white/10' 
                                : 'bg-gray-50 border-gray-100 hover:border-blue-200'}
                            ${isReviewMode && isCorrect ? '!border-green-500/50 !bg-green-500/10' : ''}
                            ${isReviewMode && !isCorrect ? '!border-red-500/50 !bg-red-500/10' : ''}
                        `}
                    >
                        <div className="col-span-1 md:col-span-8 font-medium text-lg leading-snug">
                            {stmt.text}
                        </div>
                        
                        <div className="col-span-1 md:col-span-4 flex gap-4 md:grid md:grid-cols-2">
                             {/* Yes Button */}
                             <button
                                onClick={() => handleToggle(idx, "Yes")}
                                disabled={isReviewMode}
                                className={`flex-1 md:w-auto py-3 rounded-xl font-bold transition-all relative overflow-hidden
                                    ${currentVal === "Yes" 
                                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                                        : (isDark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-white border text-gray-400 hover:bg-gray-50')}
                                    ${isReviewMode && correctVal === "Yes" && currentVal !== "Yes" ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-black' : ''}
                                `}
                             >
                                Yes
                             </button>

                             {/* No Button */}
                             <button
                                onClick={() => handleToggle(idx, "No")}
                                disabled={isReviewMode}
                                className={`flex-1 md:w-auto py-3 rounded-xl font-bold transition-all relative overflow-hidden
                                    ${currentVal === "No" 
                                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                                        : (isDark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-white border text-gray-400 hover:bg-gray-50')}
                                    ${isReviewMode && correctVal === "No" && currentVal !== "No" ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-black' : ''}
                                `}
                             >
                                No
                             </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
        
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
