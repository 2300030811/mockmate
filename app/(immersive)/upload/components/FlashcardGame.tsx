"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Check, X, Shuffle, Download } from "lucide-react";
import { GeneratedQuizQuestion } from "@/lib/ai/models";

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
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard Navigation
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
    setMastered([]); // Reset mastery on shuffle for a fresh start
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flashcards.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const currentCard = cards[currentIndex];
  const isMastered = mastered.includes(currentIndex);



  const toggleMastery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMastered) {
      setMastered(prev => prev.filter(id => id !== currentIndex));
    } else {
      setMastered(prev => [...prev, currentIndex]);
      // Auto advance if mastering
      setTimeout(() => {
          if (currentIndex < cards.length - 1) handleNext();
      }, 300);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
      isDark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Header */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
        <button 
          onClick={onExit}
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border shadow-sm transition-all hover:scale-105 ${
            isDark ? "bg-gray-800/80 border-gray-700 text-gray-300" : "bg-white/80 border-gray-200 text-gray-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>

        <button 
          onClick={handleShuffle}
          className={`p-2 rounded-full backdrop-blur-md border shadow-sm transition-all hover:scale-105 ${
            isDark ? "bg-gray-800/80 border-gray-700 text-gray-300 hover:text-blue-400" : "bg-white/80 border-gray-200 text-gray-600 hover:text-blue-600"
          }`}
          title="Shuffle Deck"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button 
          onClick={handleDownload}
          className={`p-2 rounded-full backdrop-blur-md border shadow-sm transition-all hover:scale-105 ${
            isDark ? "bg-gray-800/80 border-gray-700 text-gray-300 hover:text-green-400" : "bg-white/80 border-gray-200 text-gray-600 hover:text-green-600"
          }`}
          title="Download Flashcards"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Flashcards</h2>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Card {currentIndex + 1} of {cards.length} • {mastered.length} Mastered
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
            <div className="relative w-12 h-12">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-800" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * (mastered.length / cards.length))} className="text-green-500 transition-all duration-500 ease-out" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {Math.round((mastered.length / cards.length) * 100)}%
                </div>
            </div>
            <div className="text-left">
                <p className="text-sm font-bold">Mastery Level</p>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {mastered.length} of {cards.length} cards learned
                </p>
            </div>
        </div>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full max-w-2xl aspect-[3/2]" 
        style={{ perspective: "1000px" }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50, rotateY: 0 }}
            animate={{ opacity: 1, x: 0, rotateY: isFlipped ? 180 : 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative cursor-pointer group"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <div 
              className={`absolute inset-0 rounded-3xl shadow-xl border-2 flex flex-col items-center justify-center p-8 text-center transition-all ${
                isDark 
                  ? "bg-gray-900 border-gray-800 group-hover:border-blue-500/50" 
                  : "bg-white border-gray-200 group-hover:border-blue-400/50"
              }`}
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-xs font-bold uppercase tracking-wider opacity-50 mb-4">Term / Concept</span>
              <h3 className="text-3xl md:text-4xl font-bold leading-tight select-none">
                {currentCard.question}
              </h3>
              <p className="absolute bottom-6 text-xs opacity-40 animate-pulse">Click to flip</p>
              
              {/* Mastery Indicator (Front) */}
              {isMastered && (
                 <div className="absolute top-4 right-4 text-green-500 bg-green-500/10 p-2 rounded-full">
                     <Check className="w-5 h-5" />
                 </div>
              )}
            </div>

            {/* Back */}
            <div 
              className={`absolute inset-0 rounded-3xl shadow-xl border-2 flex flex-col items-center justify-center p-8 text-center ${
                isDark 
                  ? "bg-blue-950/40 border-blue-500/30 backdrop-blur-sm" 
                  : "bg-blue-50 border-blue-200"
              }`}
              style={{ 
                backfaceVisibility: "hidden", 
                transform: "rotateY(180deg)" 
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-wider opacity-50 mb-4 text-blue-500">Definition</span>
                <p className="text-xl md:text-2xl font-medium leading-relaxed select-none">
                    {currentCard.answer}
                </p>
                {currentCard.explanation && (
                    <div className={`mt-6 p-4 rounded-xl text-sm text-left w-full ${
                        isDark ? "bg-black/40 text-gray-300" : "bg-white/60 text-gray-600"
                    }`}>
                        <span className="font-bold block mb-1 opacity-75">Context:</span>
                        {currentCard.explanation}
                    </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-10">
        <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-4 rounded-full transition-all ${
                currentIndex === 0 
                    ? "opacity-30 cursor-not-allowed" 
                    : isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
        >
            <ArrowLeft className="w-6 h-6" />
        </button>

        <button
            onClick={toggleMastery}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                isMastered
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                    : isDark ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-green-500 hover:text-green-500" : "bg-white text-gray-500 border border-gray-300 hover:border-green-500 hover:text-green-500"
            }`}
        >
            {isMastered ? (
                <>
                    <Check className="w-5 h-5" />
                    Mastered
                </>
            ) : (
                <>
                    <div className="w-5 h-5 rounded-full border-2 border-current" />
                    Mark as Known
                </>
            )}
        </button>

        <button 
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`p-4 rounded-full transition-all ${
                currentIndex === cards.length - 1 
                    ? "opacity-30 cursor-not-allowed" 
                    : isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
        >
            <ArrowRight className="w-6 h-6" />
        </button>
      </div>
      
      {/* Restart */}
      <button 
        onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            setDirection(0);
        }}
        className={`mt-4 text-sm flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        <RotateCcw className="w-3 h-3" />
        Restart Deck
      </button>
    </div>
  );
}
