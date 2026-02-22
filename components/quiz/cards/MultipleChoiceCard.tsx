
"use client";

import { useState, memo, useEffect, useCallback } from 'react';
import { MCQQuestion, QuizMode } from '@/types';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCorrectAnswers, getLanguageForCategory } from '@/utils/quiz-helpers';

const SyntaxBlock = dynamic(() => import("../SyntaxBlock").then(mod => mod.SyntaxBlock), {
    ssr: false,
    loading: () => <div className="h-32 w-full animate-pulse bg-zinc-900/50 rounded-xl" />
});

interface MultipleChoiceCardProps {
  question: MCQQuestion;
  selectedAnswers?: string[];
  onAnswer: (answers: string[]) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
  category?: string;
  mode?: QuizMode;
}

export const MultipleChoiceCard = memo(({
  question,
  selectedAnswers = [],
  onAnswer,
  isReviewMode = false,
  isDark = true,
  category = 'pcap',
  mode = 'practice',
}: MultipleChoiceCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const correctAnswers = getCorrectAnswers(question);
  const language = getLanguageForCategory(category);
  const isMSQ = question.type === 'MSQ' || correctAnswers.length > 1;

  const handleToggle = useCallback((letter: string) => {
    if (isReviewMode) return;

    if (isMSQ) {
      const newAnswers = selectedAnswers.includes(letter)
        ? selectedAnswers.filter(a => a !== letter)
        : [...selectedAnswers, letter];
      onAnswer(newAnswers);
      
      // Auto-show explanation if any answer selected in practice mode
      if (mode === 'practice' && newAnswers.length > 0) {
        setShowExplanation(true);
      }
    } else {
      onAnswer([letter]);
      // Auto-show explanation on selection in practice mode
      if (mode === 'practice') {
        setShowExplanation(true);
      }
    }
  }, [isReviewMode, isMSQ, selectedAnswers, onAnswer, mode]);

  // Keyboard Shortcuts (A, B, C, D)
  useEffect(() => {
    if (isReviewMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        // Skip if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E', 'F'].includes(key)) {
            const index = key.charCodeAt(0) - 65;
            if (index < question.options.length) {
                handleToggle(key);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question.options.length, isReviewMode, handleToggle]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className={`backdrop-blur-xl border rounded-3xl p-6 md:p-10 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        <div className="mb-8">
            <h3 className={`text-xl md:text-2xl font-bold mb-6 leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {question.question}
            </h3>

            {question.image && (
                <div className="my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={question.image} 
                        alt="Question Reference" 
                        className="w-full h-auto object-contain max-h-[500px] bg-black/50"
                    />
                </div>
            )}

            {question.code && (
                <div className="my-6">
                    <SyntaxBlock 
                        code={question.code}
                        language={language}
                        isDark={isDark}
                    />
                </div>
            )}
            
            {isMSQ && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Multiple Selection</span>
                </div>
            )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {question.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C...
                const isSelected = selectedAnswers.includes(letter);
                const isTheCorrectAnswer = correctAnswers.includes(letter);
                
                let borderColor = isDark ? "border-white/10" : "border-gray-200";
                let bgColor = isDark ? "bg-white/5" : "bg-white";
                let textColor = isDark ? "text-white/90" : "text-gray-700";
                let circleBorder = isDark ? "border-white/30" : "border-gray-300";

                const isPracticeModeHighlight = mode === 'practice' && isSelected;

                if (isReviewMode || isPracticeModeHighlight) {
                  if (isTheCorrectAnswer) {
                      borderColor = "border-green-500/50";
                      bgColor = isDark ? "bg-green-500/20" : "bg-green-50";
                      textColor = isDark ? "text-white font-bold" : "text-green-900 font-bold";
                  } else if (isSelected && !isTheCorrectAnswer) {
                      borderColor = "border-red-500/50";
                      bgColor = isDark ? "bg-red-500/20" : "bg-red-50";
                      textColor = isDark ? "text-white" : "text-red-900";
                  }
                } else if (isSelected) {
                  borderColor = "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
                  bgColor = isDark ? "bg-blue-500/20" : "bg-blue-50";
                  textColor = isDark ? "text-white font-bold" : "text-blue-900 font-bold";
                  circleBorder = "border-transparent";
                }

                return (
                <motion.button
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleToggle(letter)}
                    disabled={isReviewMode}
                    className={`w-full flex items-center p-5 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all duration-300 group relative overflow-hidden
                        ${!isReviewMode && 'hover:translate-x-1 active:scale-[0.99] hover:border-blue-500/50'}
                    `}
                >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-5 transition-all duration-300 relative z-10
                    ${circleBorder} ${isSelected ? 'bg-blue-500 text-white shadow-lg' : isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}
                    ${(isReviewMode || isPracticeModeHighlight) && isTheCorrectAnswer ? 'bg-green-500 border-none text-white' : ''}
                    ${(isReviewMode || isPracticeModeHighlight) && isSelected && !isTheCorrectAnswer ? 'bg-red-500 border-none text-white' : ''}
                    `}>
                    {letter}
                    </div>
                    
                    <div className={`text-left flex-1 ${textColor} relative z-10 overflow-hidden`}>
                        {(() => {
                            const trimmed = option.trim();
                            const isCodeLike = 
                                ((trimmed.startsWith('{') || trimmed.startsWith('[')) && (trimmed.endsWith('}') || trimmed.endsWith(']'))) ||
                                /^db\./.test(trimmed) ||
                                /^\$/.test(trimmed) ||
                                (trimmed.startsWith('Collection') && trimmed.includes('{_id:'));
                            
                            if (isCodeLike) {
                                return (
                                    <div className={`relative flex w-full border-l-4 ${isSelected ? (isDark ? 'border-blue-500' : 'border-blue-600') : (isDark ? 'border-white/10 group-hover:border-white/20' : 'border-gray-300 group-hover:border-gray-400')} rounded-xl overflow-hidden transition-colors shadow-inner`}>
                                        <code className={`block font-mono text-[13px] md:text-sm p-4 w-full ${isDark ? 'bg-[#1e1e1e] text-[#d4d4d4]' : 'bg-[#f8f9fa] text-[#24292e]'} leading-relaxed whitespace-pre-wrap`}>
                                            {trimmed.includes(', {') ? trimmed.replace(/, \{/g, ',\n{') : trimmed}
                                        </code>
                                    </div>
                                );
                            }
                            return <span className="text-base md:text-lg">{option}</span>;
                        })()}
                    </div>
                    
                    {(isReviewMode || isPracticeModeHighlight) && isTheCorrectAnswer && (
                    <div className="ml-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in spin-in-12 duration-300">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    )}
                    
                     {(isReviewMode || isPracticeModeHighlight) && isSelected && !isTheCorrectAnswer && (
                    <div className="ml-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <XCircle className="w-4 h-4 text-white" />
                    </div>
                    )}
                </motion.button>
                );
            })}
          </AnimatePresence>
        </div>

        {(isReviewMode || mode === 'practice') && question.explanation && (
            <div className="mt-8">
                 <Button 
                    onClick={() => setShowExplanation(!showExplanation)}
                    variant="ghost"
                    className="w-full flex justify-between items-center group"
                 >
                    <span className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                        {mode === 'practice' ? 'Why this answer?' : 'Explanation'}
                    </span>
                    <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                        {showExplanation ? "Hide" : "Show"}
                    </span>
                 </Button>
                
                <AnimatePresence>
                    {showExplanation && (
                         <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                         >
                             <div 
                                className={`mt-4 p-6 rounded-3xl border-2 ${isDark ? 'bg-blue-600/10 border-blue-500/20 shadow-xl' : 'bg-blue-50 border-blue-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-blue-500 font-bold text-lg">Detailed Explanation</h4>
                                </div>
                                <p className={`text-base md:text-lg leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}
        

      </div>
    </div>
  );
});

MultipleChoiceCard.displayName = "MultipleChoiceCard";
