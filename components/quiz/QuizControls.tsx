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
        <div className="p-4 border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 z-10 w-full">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Button
                    variant="secondary"
                    onClick={onPrev}
                    disabled={!canGoPrev}
                    className="gap-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Previous Question (Left Arrow)"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-gray-700 text-gray-300 border border-gray-600">
                        ←
                    </kbd>
                </Button>

                {canGoNext ? (
                    <Button
                        variant="primary"
                        onClick={onNext}
                        className="gap-2 px-8 focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Next Question (Right Arrow)"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                        <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/20 text-white border border-white/30">
                            →
                        </kbd>
                    </Button>
                ) : (
                    <Button
                        onClick={onFinish}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                        Finish
                    </Button>
                )}
            </div>
        </div>
    );
});

