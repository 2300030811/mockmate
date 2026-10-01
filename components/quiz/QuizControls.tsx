"use client";

import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

interface QuizControlsProps {
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    onFinish: () => void;
}

export const QuizControls = memo(function QuizControls({
    canGoPrev,
    canGoNext,
    onPrev,
    onNext,
    onFinish
}: QuizControlsProps) {
    return (
        <div className="p-3 sm:p-4 border-t bg-white dark:bg-[#0d0d12] border-zinc-200 dark:border-[#1e1e2a] z-10 w-full transition-colors">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Button
                    variant="secondary"
                    onClick={onPrev}
                    disabled={!canGoPrev}
                    className="gap-2 border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50 dark:bg-[#14141e] text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1a1a26] text-xs font-semibold h-9 px-4 disabled:opacity-30 cursor-pointer"
                    aria-label="Previous Question (Left Arrow)"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                    <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-mono rounded bg-zinc-200 dark:bg-[#1e1e2a] text-zinc-600 dark:text-[#8b8b9e] border border-zinc-300 dark:border-[#2a2a3a]">
                        ←
                    </kbd>
                </Button>

                {canGoNext ? (
                    <Button
                        onClick={onNext}
                        className="gap-2 px-6 bg-[#5e6ad2] hover:bg-[#4f59b8] text-white dark:bg-[#5e6ad2] dark:hover:bg-[#4f59b8] dark:text-white text-xs font-semibold h-9 shadow-subtle border border-transparent cursor-pointer"
                        aria-label="Next Question (Right Arrow)"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/20 text-white border border-white/25">
                            →
                        </kbd>
                    </Button>
                ) : (
                    <Button
                        onClick={onFinish}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-7 text-xs font-semibold h-9 shadow-subtle cursor-pointer"
                    >
                        Submit Test
                    </Button>
                )}
            </div>
        </div>
    );
});

