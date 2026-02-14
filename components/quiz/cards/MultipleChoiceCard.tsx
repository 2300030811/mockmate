
"use client";

import { useState } from 'react';
import { MCQQuestion } from '@/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MultipleChoiceCardProps {
  question: MCQQuestion;
  selectedAnswers?: string[];
  onAnswer: (answers: string[]) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
  category?: string;
}

export function MultipleChoiceCard({
  question,
  selectedAnswers = [],
  onAnswer,
  isReviewMode = false,
  isDark = true,
  category = 'pcap',
}: MultipleChoiceCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getLanguage = () => {
    switch(category) {
        case 'pcap': return 'python';
        case 'oracle': return 'java';
        default: return 'javascript';
    }
  };

  const getCorrectAnswers = (): string[] => {
    const rawAnswer = question.answer;
    if (!rawAnswer) return [];

    let rawArray: string[] = [];
    if (Array.isArray(rawAnswer)) {
        rawArray = rawAnswer.filter((a): a is string => typeof a === 'string');
    } else if (typeof rawAnswer === 'string') {
        if (rawAnswer.includes(',')) {
            rawArray = rawAnswer.split(',').map(s => s.trim());
        } else {
            rawArray = [rawAnswer];
        }
    }

    return rawArray.map(val => {
        // 1. Single letter reference (A, B, C...)
        if (val.length === 1 && /[A-Z]/i.test(val)) {
            return val.toUpperCase();
        }
        // 2. Index in options
        const answerIndex = question.options.findIndex(opt => opt === val);
        if (answerIndex !== -1) {
            return String.fromCharCode(65 + answerIndex);
        }
        // 3. Fallback
        return val.toUpperCase();
    }).filter(Boolean);
  };

  const correctAnswers = getCorrectAnswers();
  const isMSQ = question.type === 'MSQ' || correctAnswers.length > 1;

  const handleToggle = (letter: string) => {
    if (isReviewMode) return;

    if (isMSQ) {
      if (selectedAnswers.includes(letter)) {
        onAnswer(selectedAnswers.filter(a => a !== letter));
      } else {
        onAnswer([...selectedAnswers, letter]);
      }
    } else {
      onAnswer([letter]);
    }
  };

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
                    <img 
                        src={question.image} 
                        alt="Question Reference" 
                        className="w-full h-auto object-contain max-h-[500px] bg-black/50"
                    />
                </div>
            )}

            {question.code && (
                <div className="rounded-xl overflow-hidden border border-white/10 my-6 shadow-2xl relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-2 py-1 bg-black/50 rounded text-xs text-white backdrop-blur">
                            {getLanguage()}
                        </div>
                    </div>
                    <SyntaxHighlighter 
                        language={getLanguage()} 
                        style={isDark ? vscDarkPlus : vs}
                        customStyle={{
                            margin: 0,
                            padding: '1.5rem',
                            fontSize: '0.95rem',
                            backgroundColor: isDark ? '#09090b' : '#f8f9fa' // Zinc-950 or gray-50
                        }}
                        showLineNumbers={true}
                        lineNumberStyle={{ minWidth: "2em", paddingRight: "1em", opacity: 0.3 }}
                    >
                        {question.code}
                    </SyntaxHighlighter>
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

                if (isReviewMode) {
                if (isTheCorrectAnswer) {
                    borderColor = "border-green-500/50";
                    bgColor = "bg-green-500/20";
                    textColor = isDark ? "text-white font-bold" : "text-green-900 font-bold";
                } else if (isSelected && !isTheCorrectAnswer) {
                    borderColor = "border-red-500/50";
                    bgColor = "bg-red-500/20";
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
                    ${isReviewMode && isTheCorrectAnswer ? 'bg-green-500 border-none text-white' : ''}
                    ${isReviewMode && isSelected && !isTheCorrectAnswer ? 'bg-red-500 border-none text-white' : ''}
                    `}>
                    {letter}
                    </div>
                    
                    <span className={`text-left text-base md:text-lg flex-1 ${textColor} relative z-10`}>{option}</span>
                    
                    {isReviewMode && isTheCorrectAnswer && (
                    <div className="ml-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in spin-in-12 duration-300">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    )}
                    
                     {isReviewMode && isSelected && !isTheCorrectAnswer && (
                    <div className="ml-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <XCircle className="w-4 h-4 text-white" />
                    </div>
                    )}
                </motion.button>
                );
            })}
          </AnimatePresence>
        </div>

        {isReviewMode && question.explanation && (
            <div className="mt-8">
                 <Button 
                    onClick={() => setShowExplanation(!showExplanation)}
                    variant="ghost"
                    className="w-full flex justify-between items-center group"
                 >
                    <span className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                        Explanation
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
                                className={`mt-4 p-6 rounded-3xl border-2 ${isDark ? 'bg-blue-500/10 border-blue-500/20 shadow-xl' : 'bg-blue-50 border-blue-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <span className="text-xs font-bold">i</span>
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
}
