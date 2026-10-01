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
        } bg-white dark:bg-[#0d0d12] border-zinc-200 dark:border-[#1e1e2a]`}>

        <div className="p-4 border-b flex items-center justify-between border-zinc-200 dark:border-[#1e1e2a]">
          <div>
            <h2 className="font-semibold text-sm text-zinc-900 dark:text-[#ebebef]">
              Question Navigator
            </h2>
            <p className="text-[11px] text-zinc-400 dark:text-[#6e6e84] mt-0.5 font-mono">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:text-[#8b8b9e] dark:hover:text-[#ebebef]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e] pb-1 border-b border-zinc-100 dark:border-[#181824]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[3px] bg-[#5e6ad2]" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[3px] bg-emerald-500/30 border border-emerald-500" />
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Marked</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Question Navigator">
            {questions.map((q, index) => {
              const { isAnswered, isMarked, isCurrent } = getQuestionStatus(q);

              let bgClass = 'bg-zinc-50 dark:bg-[#14141e]';
              let borderClass = 'border-zinc-200 dark:border-[#1e1e2a]';
              let textClass = 'text-zinc-600 dark:text-[#8b8b9e]';

              if (isCurrent) {
                borderClass = 'border-[#5e6ad2] ring-2 ring-[#5e6ad2]/20';
                bgClass = 'bg-[#5e6ad2]';
                textClass = 'text-white font-bold';
              } else if (isAnswered) {
                bgClass = 'bg-emerald-500/10 dark:bg-emerald-500/15';
                borderClass = 'border-emerald-500/30 dark:border-emerald-500/40';
                textClass = 'text-emerald-600 dark:text-emerald-400 font-medium';
              }

              const statusText = `${isCurrent ? 'current, ' : ''}${isAnswered ? 'answered' : 'unanswered'}${isMarked ? ', marked for review' : ''}`;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  aria-label={`Question ${index + 1}, ${statusText}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`relative h-9 rounded-md flex items-center justify-center text-xs font-mono transition-all border ${bgClass} ${borderClass} ${textClass} hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] cursor-pointer`}
                >
                  {index + 1}
                  {isMarked && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#0d0d12]">
          <div className="flex justify-between items-center mb-2 text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
            <span>Completion</span>
            <span className="font-semibold text-zinc-900 dark:text-[#ebebef] tabular-nums">
              {Math.round((answeredCount / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full mb-5 bg-zinc-100 dark:bg-[#181824] overflow-hidden">
            <div
              className="bg-[#5e6ad2] h-full transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>

          <Button
            onClick={onOpenSubmitModal}
            className="w-full bg-[#5e6ad2] hover:bg-[#4f59b8] text-white font-semibold text-xs h-10 shadow-subtle cursor-pointer"
          >
            Submit {mode === 'exam' ? 'Exam Session' : 'Practice Lab'}
          </Button>
        </div>
      </aside>
    </>
  );
});

QuizSidebar.displayName = "QuizSidebar";

