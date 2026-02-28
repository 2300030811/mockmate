"use client";

import { memo } from "react";
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
  onOpenSubmitModal: () => void;
  mode: QuizMode;
}

export const QuizSidebar = memo(({
  isOpen,
  setIsOpen,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  markedQuestions,
  onOpenSubmitModal,
  mode,
}: QuizSidebarProps) => {

  const getQuestionStatus = (q: QuizQuestion) => {
    const ans = userAnswers[q.id];
    let isAnswered = false;

    if (ans !== undefined && ans !== null) {
      if (Array.isArray(ans)) isAnswered = ans.length > 0;
      else if (typeof ans === 'object') isAnswered = Object.keys(ans).length > 0;
      else if (typeof ans === 'string') isAnswered = ans.trim().length > 0;
      else isAnswered = true;
    }

    const isMarked = markedQuestions.includes(q.id);
    const isCurrent = questions[currentQuestionIndex].id === q.id;

    return { isAnswered, isMarked, isCurrent };
  };

  const answeredCount = questions.filter(q => getQuestionStatus(q).isAnswered).length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col border-r ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`}>

        <div className="p-4 border-b flex items-center justify-between border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Question Navigator
          </h2>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex flex-wrap gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 opacity-70">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-70">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-70">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Marked</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, index) => {
              const { isAnswered, isMarked, isCurrent } = getQuestionStatus(q);

              let bgClass = 'bg-gray-100 dark:bg-gray-800';
              let borderClass = 'border-transparent';
              let textClass = 'text-gray-600 dark:text-gray-400';

              if (isCurrent) {
                borderClass = 'border-blue-500 ring-2 ring-blue-500/20';
                bgClass = 'bg-blue-50 dark:bg-blue-900/20';
                textClass = 'text-blue-500 font-bold';
              } else if (isAnswered) {
                bgClass = 'bg-green-50 dark:bg-green-900/20';
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
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-4 text-sm font-medium">
            <span className="opacity-50">Progress</span>
            <span className="font-bold">{answeredCount}/{questions.length}</span>
          </div>
          <div className="w-full h-2 rounded-full mb-6 bg-gray-200 dark:bg-gray-800">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>

          <Button
            onClick={onOpenSubmitModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
          >
            Submit {mode === 'exam' ? 'Exam' : 'Test'}
          </Button>
        </div>
      </aside>
    </>
  );
});

QuizSidebar.displayName = "QuizSidebar";

