"use client";

import { QuizMode } from "@/hooks/useAzureQuiz";
import { QuizQuestion } from "@/lib/azure-quiz-service";
import { X } from "lucide-react";

interface AzureQuizSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: Record<number, any>;
  isDark: boolean;
  isSubmitted: boolean;
  onOpenSubmitModal: () => void;
  mode: QuizMode;
}

export function AzureQuizSidebar({
  isOpen,
  setIsOpen,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  isDark,
  isSubmitted,
  onOpenSubmitModal,
  mode,
}: AzureQuizSidebarProps) {
  
  return (
    <>
        <aside className={`
            absolute lg:static inset-y-0 left-0 z-40 w-72 h-full backdrop-blur-md border-r transition-colors duration-300
            transform transition-transform ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isDark ? 'bg-slate-900/90 border-white/5' : 'bg-white/90 border-gray-200'}
        `}>
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Navigator</span>
                    <button onClick={() => setIsOpen(false)} className={isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-5 gap-2 pb-4">
                        {questions.map((q, idx) => {
                            const isAnswered = !!userAnswers[q.id];
                            const isCurrent = currentQuestionIndex === idx;
                            
                            // Define Classes
                            let baseClass = "relative w-full aspect-square rounded-lg text-sm font-semibold transition-all flex items-center justify-center border ";
                            
                            if (isCurrent) {
                                baseClass += "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20";
                            } else if (isAnswered) {
                                baseClass += isDark 
                                ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                : "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100";
                            } else {
                                baseClass += isDark
                                ? "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100";
                            }

                            return (
                                <button
                                key={q.id}
                                onClick={() => { setCurrentQuestionIndex(idx); if(window.innerWidth < 1024) setIsOpen(false); }}
                                className={baseClass}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Submit Button in Sidebar */}
                <div className={`mt-auto pt-4 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                        {!isSubmitted && (
                        <button
                            onClick={onOpenSubmitModal}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition shadow-lg"
                        >
                            {mode === 'exam' ? 'Submit Exam' : 'Finish Practice'}
                        </button>
                        )}
                </div>
            </div>
        </aside>
        
        {/* Overlay for mobile */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
        )}
    </>
  );
}
