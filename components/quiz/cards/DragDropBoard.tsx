
"use client";

import { DragDropQuestion } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Move, X, GripVertical } from 'lucide-react';
import { useState, useCallback } from 'react';

interface DragDropBoardProps {
  question: DragDropQuestion;
  userAnswer?: any;
  onAnswer: (answer: any) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function DragDropBoard({
  question,
  userAnswer,
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: DragDropBoardProps) {
  const isMatching = !!question.drop_zones && !!question.answer_mapping;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Helper for keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // --- Format B: Matching Logic ---
  if (isMatching) {
    const currentMapping = (userAnswer as Record<string, string>) || {};
    
    const handleSelect = (item: string) => {
        if (isReviewMode) return;
        setSelectedItem(prev => prev === item ? null : item);
    };

    const handleZoneClick = (zone: string) => {
        if (isReviewMode) return;
        
        if (selectedItem) {
            // Place item
            const newMapping = { ...currentMapping, [zone]: selectedItem };
            onAnswer(newMapping);
            setSelectedItem(null);
        } else if (currentMapping[zone]) {
            // Remove item
            const newMapping = { ...currentMapping };
            delete newMapping[zone];
            onAnswer(newMapping);
        }
    };

    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className={`backdrop-blur-xl border rounded-3xl p-6 md:p-10 transition-colors duration-300
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
        `}>
            <h3 className={`text-xl md:text-2xl font-bold mb-8 leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {question.question}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Options Source */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                         <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Options</h4>
                         <span className="text-xs opacity-50">Tap or use Enter to select</span>
                    </div>
                    <div className="space-y-3" role="listbox" aria-label="Available Options">
                        {question.options.map((opt, idx) => {
                             const isPlaced = Object.values(currentMapping).includes(opt);
                             const isSelected = selectedItem === opt;
                             
                             return (
                                <motion.button
                                    key={opt}
                                    layoutId={`option-${opt}`}
                                    onClick={() => handleSelect(opt)}
                                    onKeyDown={(e) => handleKeyDown(e, () => handleSelect(opt))}
                                    whileHover={{ scale: isPlaced ? 1 : 1.02 }}
                                    whileTap={{ scale: isPlaced ? 1 : 0.98 }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
                                        ${isDark 
                                            ? 'bg-white/5 border-white/10 text-white' 
                                            : 'bg-white border-gray-200 text-gray-800'}
                                        ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/10' : ''}
                                        ${isPlaced ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-blue-500/50 cursor-pointer'}
                                    `}
                                    disabled={isPlaced || isReviewMode}
                                    aria-selected={isSelected}
                                    role="option"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                            <GripVertical className="w-4 h-4 opacity-50" />
                                        </div>
                                        <span className="font-medium">{opt}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none animate-pulse" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Drop Zones */}
                <div className="space-y-4">
                     <div className="flex items-center justify-between mb-2">
                         <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Targets</h4>
                         {selectedItem && <span className="text-xs text-blue-500 animate-pulse font-medium">Select a target below</span>}
                    </div>
                    <div className="space-y-4" role="list" aria-label="Drop Zones">
                        {question.drop_zones?.map((zone, idx) => {
                             const filledItem = currentMapping[zone];
                             const correctItem = question.answer_mapping?.[zone];
                             const isCorrect = filledItem === correctItem;
                             const canInteract = !isReviewMode && (selectedItem || filledItem);

                             return (
                                <div key={zone} className="group">
                                    <div className="mb-2 ml-1 text-sm font-medium opacity-70 flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>{idx + 1}</span>
                                        {zone}
                                    </div>
                                    <motion.div 
                                        role="button"
                                        tabIndex={canInteract ? 0 : -1}
                                        onClick={() => handleZoneClick(zone)}
                                        onKeyDown={(e) => handleKeyDown(e, () => handleZoneClick(zone))}
                                        className={`min-h-[72px] relative border-2 border-dashed rounded-xl flex items-center p-2 transition-all
                                            ${canInteract ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black' : ''}
                                            ${filledItem 
                                                ? (isDark ? 'border-solid border-white/20 bg-white/5' : 'border-solid border-gray-300 bg-gray-50') 
                                                : (isDark ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50/50')}
                                            ${selectedItem ? 'border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10' : ''}
                                            ${!filledItem && !selectedItem ? 'hover:border-white/30' : ''}
                                            ${isReviewMode && isCorrect ? '!border-green-500 !bg-green-500/10' : ''}
                                            ${isReviewMode && !isCorrect && filledItem ? '!border-red-500 !bg-red-500/10' : ''}
                                        `}
                                        aria-label={`Drop zone for ${zone}. ${filledItem ? `Current content: ${filledItem}` : 'Empty'}`}
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {filledItem ? (
                                                <motion.div
                                                    layoutId={`placed-${filledItem}`}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className={`flex-1 flex items-center justify-between p-3 rounded-lg
                                                        ${isDark ? 'bg-purple-500/20 text-purple-200' : 'bg-purple-100 text-purple-900'}
                                                    `}
                                                >
                                                    <span className="font-semibold">{filledItem}</span>
                                                    {!isReviewMode && (
                                                        <span className="p-1 rounded-full opacity-50">
                                                            <X className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="w-full flex items-center justify-center text-sm opacity-30 italic">
                                                    {selectedItem ? "Press Enter to place here" : "Empty"}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                    
                                    {isReviewMode && !isCorrect && (
                                        <div className="mt-2 text-sm text-green-500 flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4" /> Correct: <span className="font-bold">{correctItem}</span>
                                        </div>
                                    )}
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>
            
             {isReviewMode && question.explanation && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-10 p-6 rounded-3xl border-2 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <span className="text-xs font-bold">i</span>
                        </div>
                        <h4 className="text-blue-500 font-bold text-lg">Detailed Explanation</h4>
                    </div>
                    <p className={`text-base leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
                </motion.div>
            )}
        </div>
      </div>
    );
  } 
  
  // --- Format A: Multi-select Logic ---
  else {
    const currentSelection = (userAnswer as string[]) || [];

    const toggleSelection = (item: string) => {
        if (isReviewMode) return;
        
        if (currentSelection.includes(item)) {
            onAnswer(currentSelection.filter(i => i !== item));
        } else {
            onAnswer([...currentSelection, item]);
        }
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className={`backdrop-blur-xl border rounded-3xl p-6 md:p-10 transition-colors duration-300
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
            `}>
                 <h3 className={`text-xl md:text-2xl font-bold mb-8 leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {question.question}
                </h3>
                
                {/* Visual "Bucket" Metaphor */}
                <div className="flex flex-col gap-6">
                    {/* Source Pool */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="listbox" aria-label="Choices" aria-multiselectable="true">
                         {question.options.map((opt) => {
                             const isSelected = currentSelection.includes(opt);
                             return (
                                <motion.button
                                    key={opt}
                                    onClick={() => toggleSelection(opt)}
                                    onKeyDown={(e) => handleKeyDown(e, () => toggleSelection(opt))}
                                    disabled={isReviewMode}
                                    className={`p-4 rounded-xl border-2 text-left text-sm font-medium transition-all relative
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
                                        ${isDark 
                                            ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700' 
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}
                                        ${isSelected ? 'opacity-0 pointer-events-none absolute' : ''} 
                                    `}
                                    layoutId={`bucket-item-${opt}`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    {opt}
                                </motion.button>
                             );
                         })}
                    </div>

                    <div className="flex items-center justify-center py-4 opacity-30" aria-hidden="true">
                        <ArrowRight className="w-6 h-6 rotate-90" />
                    </div>

                    {/* Target Bucket */}
                    <div 
                        className={`min-h-[200px] border-2 border-dashed rounded-2xl p-6 flex flex-wrap content-start gap-3 transition-colors
                            ${isDark ? 'border-white/20 bg-black/20' : 'border-gray-300 bg-gray-50'}
                        `}
                        role="list"
                        aria-label="Selected Answers"
                    >
                        {currentSelection.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-sm opacity-40 italic">
                                Tap options above to move them here
                            </div>
                        )}
                        <AnimatePresence>
                            {currentSelection.map((item) => (
                                <motion.button
                                    key={item}
                                    layoutId={`bucket-item-${item}`}
                                    onClick={() => toggleSelection(item)}
                                    onKeyDown={(e) => handleKeyDown(e, () => toggleSelection(item))}
                                    disabled={isReviewMode}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg
                                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black
                                        ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'}
                                    `}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={`Remove ${item}`}
                                >
                                    {item}
                                    {!isReviewMode && <X className="w-4 h-4 opacity-50 ml-2" />}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {isReviewMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 pt-6"
                        >
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
                                <span className="font-bold">Correct Answer: </span>
                                {(Array.isArray(question.answer) ? question.answer : [question.answer]).join(", ")}
                            </div>
                             {question.explanation && (
                                <p className={`p-4 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white/80' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                                    {question.explanation}
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
  }
}
