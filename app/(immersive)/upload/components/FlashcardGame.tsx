"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Shuffle,
  Download,
  Layers,
  Sparkles,
  Award
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GeneratedQuizQuestion } from "@/lib/ai/models";
import { HomeBackground } from "@/components/home/HomeBackground";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface FlashcardGameProps {
  cards: GeneratedQuizQuestion[];
  isDark: boolean;
  onExit: () => void;
}

export function FlashcardGame({ cards: initialCards, isDark, onExit }: FlashcardGameProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [mastered, setMastered] = useState<number[]>([]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard Navigation: Arrow Left/Right to advance, Space or Enter to flip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMastered([]);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flashcards.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const currentCard = cards[currentIndex];
  const isMastered = mastered.includes(currentIndex);
  const masteryPercentage = Math.round((mastered.length / cards.length) * 100);

  const toggleMastery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMastered) {
      setMastered((prev) => prev.filter((id) => id !== currentIndex));
    } else {
      setMastered((prev) => [...prev, currentIndex]);
      if (currentIndex < cards.length - 1) {
        setTimeout(() => handleNext(), 280);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 flex flex-col justify-between pt-14 pb-8 transition-colors overflow-x-hidden">
      {/* Precision Grid & Horizon Illumination */}
      <HomeBackground />

      {/* Unified Platform Header */}
      <header className="fixed top-0 inset-x-0 h-14 border-b border-zinc-200/80 dark:border-[#1e1e2a]/80 bg-white/85 dark:bg-[#0d0d12]/85 backdrop-blur-md z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-[#4f5ac4] transition-colors">
              M
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-[#ebebef] tracking-tight">MockMate</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="text-xs font-mono font-medium text-zinc-500 dark:text-[#8b8b9e]">Flashcards</span>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            title="Shuffle Deck"
            aria-label="Shuffle Deck"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] border border-transparent hover:border-zinc-200 dark:hover:border-[#1e1e2a] transition-all cursor-pointer"
          >
            <Shuffle size={15} />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Export Flashcards"
            aria-label="Export Flashcards"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] border border-transparent hover:border-zinc-200 dark:hover:border-[#1e1e2a] transition-all cursor-pointer"
          >
            <Download size={15} />
          </button>

          <div className="w-px h-5 bg-zinc-200 dark:bg-[#1e1e2a] mx-1" />

          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#14141e] border border-transparent hover:border-zinc-200 dark:hover:border-[#1e1e2a] transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Exit</span>
          </button>

          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Flashcard Arena */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* Telemetry Bar */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-[#8b8b9e]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">
              Card {currentIndex + 1}
            </span>
            <span>of</span>
            <span>{cards.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              [Space] to flip • [←/→] navigate
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {mastered.length} Mastered ({masteryPercentage}%)
            </span>
          </div>
        </div>

        {/* Linear Mastery Progress Bar */}
        <div className="w-full h-1 bg-zinc-100 dark:bg-[#14141e] border border-zinc-200/80 dark:border-[#1e1e2a] rounded-full overflow-hidden">
          <m.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(mastered.length / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 3D Flip Card */}
        <div
          className="relative w-full aspect-[16/10] sm:aspect-[3/2] cursor-pointer"
          style={{ perspective: "1200px" }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <m.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40, rotateY: 0 }}
              animate={{ opacity: 1, x: 0, rotateY: isFlipped ? 180 : 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full h-full relative"
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front Face: Question / Concept */}
              <div
                className="absolute inset-0 rounded-2xl bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] hover:border-[#5e6ad2]/50 p-8 sm:p-12 shadow-subtle flex flex-col items-center justify-between text-center select-none"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Term / Concept
                  </span>
                  {isMastered && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                      <Check size={11} />
                      <span>Mastered</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef] leading-snug max-w-lg">
                  {currentCard.question}
                </h3>

                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Click or press [Space] to flip definition
                </span>
              </div>

              {/* Back Face: Definition / Answer */}
              <div
                className="absolute inset-0 rounded-2xl bg-zinc-50 dark:bg-[#11111a] border border-[#5e6ad2]/40 p-8 sm:p-12 shadow-subtle flex flex-col items-center justify-between text-center select-none"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5e6ad2]">
                    Synthesized Definition
                  </span>
                  {isMastered && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                      <Check size={11} />
                      <span>Mastered</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-w-lg">
                  <p className="text-lg sm:text-xl font-medium text-zinc-900 dark:text-[#ebebef] leading-relaxed">
                    {currentCard.answer}
                  </p>
                  {currentCard.explanation && (
                    <p className="text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed font-mono pt-1">
                      {currentCard.explanation}
                    </p>
                  )}
                </div>

                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Click or press [Space] to return
                </span>
              </div>
            </m.div>
          </AnimatePresence>
        </div>

        {/* Bottom Control Bar */}
        <div className="w-full flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              "p-2.5 rounded-xl border transition-all cursor-pointer",
              currentIndex === 0
                ? "opacity-30 border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed"
                : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-50 dark:hover:bg-[#181824]"
            )}
            title="Previous Card"
            aria-label="Previous Card"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            onClick={toggleMastery}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-subtle",
              isMastered
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-[#5e6ad2]/20"
            )}
          >
            <Check size={14} />
            <span>{isMastered ? "Mastered" : "Mark as Mastered"}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={cn(
              "p-2.5 rounded-xl border transition-all cursor-pointer",
              currentIndex === cards.length - 1
                ? "opacity-30 border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed"
                : "border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] text-zinc-700 dark:text-[#ebebef] hover:bg-zinc-50 dark:hover:bg-[#181824]"
            )}
            title="Next Card"
            aria-label="Next Card"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Restart Deck Action */}
        <button
          type="button"
          onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setDirection(0);
          }}
          className="text-xs font-mono text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Restart Deck</span>
        </button>
      </main>
    </div>
  );
}
