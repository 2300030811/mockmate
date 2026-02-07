
"use client";

import { Button } from "@/components/ui/Button";
import { QuizMode, QuizQuestion } from "@/types";
import { X, Star } from "lucide-react";

interface QuizSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: Record<string | number, any>;
  markedQuestions: (string | number)[];
  isDark: boolean;
  onOpenSubmitModal: () => void;
  mode: QuizMode;
}

export function QuizSidebar({
  isOpen,
  setIsOpen,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  markedQuestions,
  isDark,
  onOpenSubmitModal,
  mode,
}: QuizSidebarProps) {
  
  return (
    <>
      <aside className={`
        absolute lg:static inset-y-0 left-0 z-40 w-72 h-full
        transform transition-transform duration-300 ease-in-out border-r shadow-xl lg:shadow-none
        overflow-y-auto custom-scrollbar
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDark 
          ? 'bg-gray-900/80 backdrop-blur-sm border-gray-800' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
        }
      `}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Navigator</span>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon">
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2 pb-20">
            {questions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id]?.length;
              const isCurrent = currentQuestionIndex === idx;
              const isMarked = markedQuestions.includes(q.id);
              
              let bgClass = isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';
              let textClass = isDark ? 'text-gray-200' : 'text-gray-700';

              if (isCurrent) {
                bgClass = isDark 
                  ? 'ring-2 ring-green-500 bg-green-900/40' 
                  : 'ring-2 ring-green-500 bg-green-50';
              } else if (isAnswered) {
                bgClass = isDark 
                  ? 'bg-green-900/40 border border-green-500/50' 
                  : 'bg-green-100 border border-green-300';
                textClass = isDark ? 'text-green-200' : 'text-green-800';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => { setCurrentQuestionIndex(idx); if(window.innerWidth < 1024) setIsOpen(false); }}
                  className={`relative w-full aspect-square rounded-lg text-sm font-semibold transition-all ${bgClass} ${textClass}`}
                >
                  {idx + 1}
                  {isMarked && (
                    <div className="absolute top-0 right-0 p-0.5">
                       <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className={`mt-auto pt-4 sticky bottom-0 ${
            isDark ? 'bg-gray-900/80' : 'bg-white/80'
          } backdrop-blur-sm`}>
            <Button 
              onClick={onOpenSubmitModal}
              variant="primary"
              className="w-full shadow-lg"
            >
              Submit {mode === "exam" ? "Exam" : "Test"}
            </Button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
