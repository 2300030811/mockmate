"use client";

import { QuizQuestion, QuizMode } from "@/types";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Circle, Bookmark, X } from "lucide-react";

interface QuizSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: Record<string | number, string[]>;
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
  
  const getQuestionStatus = (q: QuizQuestion) => {
    const isAnswered = userAnswers[q.id]?.length > 0;
    const isMarked = markedQuestions.includes(q.id);
    const isCurrent = questions[currentQuestionIndex].id === q.id;
    
    return { isAnswered, isMarked, isCurrent };
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col border-r ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h2 className={`font-bold text-lg ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Question Navigator
          </h2>
          <Button 
            onClick={() => setIsOpen(false)} 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${
                isDark ? 'bg-blue-500' : 'bg-blue-600'
              }`} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Marked</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, index) => {
              const { isAnswered, isMarked, isCurrent } = getQuestionStatus(q);
              
              let bgClass = isDark ? 'bg-gray-800' : 'bg-gray-100';
              let borderClass = 'border-transparent';
              let textClass = isDark ? 'text-gray-400' : 'text-gray-600';

              if (isCurrent) {
                borderClass = 'border-blue-500 ring-2 ring-blue-500/20';
                bgClass = isDark ? 'bg-blue-900/20' : 'bg-blue-50';
                textClass = 'text-blue-500 font-bold';
              } else if (isAnswered) {
                bgClass = isDark ? 'bg-green-900/20' : 'bg-green-50';
                textClass = 'text-green-500 font-medium';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`relative h-10 rounded-lg flex items-center justify-center text-sm transition-all border ${bgClass} ${borderClass} ${textClass} hover:opacity-80`}
                >
                  {index + 1}
                  {isMarked && (
                    <div className="absolute -top-1 -right-1">
                       <Bookmark className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`p-4 border-t ${
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex justify-between items-center mb-4 text-sm">
             <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
               Progress
             </span>
             <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
               {Object.keys(userAnswers).length}/{questions.length}
             </span>
          </div>
          <div className={`w-full h-2 rounded-full mb-4 ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
             <div 
               className="bg-blue-500 h-2 rounded-full transition-all duration-300"
               style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
             />
          </div>
          
          <Button 
            onClick={onOpenSubmitModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit {mode === 'exam' ? 'Exam' : 'Quiz'}
          </Button>
        </div>

      </aside>
    </>
  );
}
