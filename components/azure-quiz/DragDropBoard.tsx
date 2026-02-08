"use client";

import { useState, useEffect } from 'react';
 
// Note: Usually we prefer dnd-kit or react-beautiful-dnd. 
// Since I don't know exactly what's installed besides local hints, I'll use a generic HTML5 approach if lib is missing, 
// BUT framer-motion has Reorder or `drag` props. 
// Re-reading rules: "Avoid using placeholders". 
// Safe bet: Framer Motion drag is great for simple things, but complex lists are hard.
// Let's use simple HTML5 Drag and Drop which requires no zero extra libs, OR Framer Motion basic drag.
// The user has `framer-motion` installed. 


import { DragDropQuestion } from '@/types';

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
  // We need to differentiate between:
  // 1. Multi-select Drag (Format A): Drag items from a pool to an "Answer Area".
  // 2. Matching (Format B): Drag items from a pool to specific "Drop Zones".

  const isMatching = !!question.drop_zones && !!question.answer_mapping;

  // Track selected item for Click-to-Drop (Mobile/Accessibility)
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Handlers for HTML5 D&D
  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData("text/plain", item);
  };

  if (isMatching) {
    // FORMAT B: Matching
    const currentMapping = (userAnswer as Record<string, string>) || {};
    
    const handleDrop = (e: React.DragEvent, zone: string) => {
      e.preventDefault();
      const item = e.dataTransfer.getData("text/plain");
      onAnswer({ ...currentMapping, [zone]: item });
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-colors duration-300
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
        `}>
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{question.question}</h3>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Options Source */}
                <div className="flex-1 space-y-3">
                    <h4 className={`text-sm uppercase tracking-wider mb-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Options</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {question.options.map((opt) => {
                             // Check if placed anywhere (visual cue only, don't disable)
                             const isPlaced = Object.values(currentMapping).includes(opt);
                            return (
                                <div 
                                    key={opt}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, opt)}
                                    onClick={() => setSelectedItem(selectedItem === opt ? null : opt)}
                                    className={`p-3 border rounded-lg text-sm cursor-grab active:cursor-grabbing transition-all select-none
                                        ${isDark 
                                            ? 'bg-indigo-500/20 border-indigo-500/30 text-white hover:bg-indigo-500/30' 
                                            : 'bg-indigo-50 border-indigo-100 text-indigo-900 hover:bg-indigo-100'}
                                        ${isPlaced ? 'opacity-50' : 'opacity-100'}
                                        ${selectedItem === opt ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black' : ''}
                                    `}
                                >
                                    {opt}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Drop Zones */}
                <div className="flex-1 space-y-3">
                    <h4 className={`text-sm uppercase tracking-wider mb-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Targets</h4>
                    <div className="space-y-4">
                        {question.drop_zones?.map((zone) => {
                             const filledItem = currentMapping[zone];
                             const correctItem = question.answer_mapping?.[zone];
                             const isCorrect = filledItem === correctItem;

                             return (
                                <div key={zone} className="flex flex-col gap-1">
                                    <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{zone}</span>
                                    <div 
                                        onDrop={(e) => handleDrop(e, zone)}
                                        onDragOver={handleDragOver}
                                        onClick={() => {
                                            if (selectedItem) {
                                                // Place selected item
                                                onAnswer({ ...currentMapping, [zone]: selectedItem });
                                                setSelectedItem(null);
                                            } else if (filledItem) {
                                                // Remove existing item
                                                const newMapping = { ...currentMapping };
                                                delete newMapping[zone];
                                                onAnswer(newMapping);
                                            }
                                        }}
                                        className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors cursor-pointer relative group
                                            ${filledItem 
                                                ? (isDark ? 'border-solid bg-white/5' : 'border-solid bg-gray-50 border-gray-300') 
                                                : (isDark ? 'border-white/20 bg-black/20' : 'border-gray-300 bg-gray-100')}
                                            ${isReviewMode && isCorrect ? (isDark ? 'border-green-500/50 bg-green-500/10' : 'border-green-500 bg-green-50') : ''}
                                            ${isReviewMode && !isCorrect && filledItem ? (isDark ? 'border-red-500/50 bg-red-500/10' : 'border-red-500 bg-red-50') : ''}
                                            ${selectedItem ? (isDark ? 'border-indigo-500/50 bg-indigo-500/10 animate-pulse' : 'border-indigo-500 bg-indigo-50 animate-pulse') : ''}
                                            ${filledItem && !selectedItem ? 'hover:border-red-500/50 hover:bg-red-500/10' : ''}
                                        `}
                                        title={filledItem ? "Click to remove" : "Click or Drop here"}
                                    >
                                        {filledItem ? (
                                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{filledItem}</span>
                                        ) : (
                                            <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Drop answer here</span>
                                        )}
                                        {/* Remove Hint Icon on Hover */}
                                        {filledItem && (
                                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                                                ×
                                            </div>
                                        )}
                                    </div>
                                    {isReviewMode && !isCorrect && (
                                        <span className="text-xs text-green-500">Correct: {correctItem}</span>
                                    )}
                                </div>
                             );
                        })}
                    </div>
                </div>
            </div>
            
             {isReviewMode && (
                <div className={`mt-6 p-4 border rounded-xl ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                    <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
                </div>
            )}
        </div>
      </div>
    );
  } else {
    // FORMAT A: Multi-select
    // Drag items into a single bucket
    const currentSelection = (userAnswer as string[]) || [];

    const handleDropInBox = (e: React.DragEvent) => {
        e.preventDefault();
        const item = e.dataTransfer.getData("text/plain");
        if (!currentSelection.includes(item)) {
            onAnswer([...currentSelection, item]);
        }
    };
    
    const removeItem = (item: string) => {
        onAnswer(currentSelection.filter(i => i !== item));
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className={`backdrop-blur-xl border rounded-2xl p-6 transition-colors duration-300
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
            `}>
                <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{question.question}</h3>
                
                {/* Pool */}
                <div className="mb-8">
                    <p className={`text-sm mb-3 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Available Options (Drag to box below)</p>
                    <div className="flex flex-wrap gap-2">
                         {question.options.map((opt) => {
                             const isSelected = currentSelection.includes(opt);
                             return (
                                <div 
                                    key={opt}
                                    draggable={!isSelected}
                                    onDragStart={(e) => handleDragStart(e, opt)}
                                    onClick={() => !isSelected && setSelectedItem(selectedItem === opt ? null : opt)}
                                    className={`px-4 py-2 border rounded-lg text-sm cursor-grab select-none
                                        ${isDark 
                                            ? 'bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700' 
                                            : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'}
                                        ${isSelected ? 'opacity-40 cursor-not-allowed' : ''}
                                        ${selectedItem === opt ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black' : ''}
                                    `}
                                >
                                    {opt}
                                </div>
                             );
                         })}
                    </div>
                </div>

                {/* Target Box */}
                <div 
                    onDrop={handleDropInBox}
                    onDragOver={handleDragOver}
                    onClick={() => {
                        if (selectedItem && !currentSelection.includes(selectedItem)) {
                            onAnswer([...currentSelection, selectedItem]);
                            setSelectedItem(null);
                        }
                    }}
                    className={`min-h-[150px] border-2 border-dashed rounded-xl p-4 flex flex-wrap gap-2 content-start cursor-pointer transition-colors
                        ${isDark ? 'border-white/20 bg-black/20' : 'border-gray-300 bg-gray-50'}
                        ${selectedItem ? (isDark ? 'border-indigo-500/50 bg-indigo-500/10 animate-pulse' : 'border-indigo-500 bg-indigo-50 animate-pulse') : ''}
                    `}
                >
                    {currentSelection.length === 0 && (
                        <div className={`w-full h-full flex items-center justify-center text-sm pointer-events-none ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            Drag correct answers here
                        </div>
                    )}
                    {currentSelection.map((item) => (
                        <div key={item} className={`flex items-center gap-2 px-3 py-1.5 border rounded text-sm
                            ${isDark ? 'bg-purple-500/20 border-purple-500/40 text-white' : 'bg-purple-100 border-purple-200 text-purple-900'}
                        `}>
                            {item}
                            {(
                                <button onClick={() => removeItem(item)} className={`${isDark ? 'text-white/50 hover:text-white' : 'text-purple-400 hover:text-purple-700'}`}>
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {isReviewMode && (
                    <div className="mt-4 space-y-2">
                        <div className="text-sm">
                            <span className="text-green-500 font-bold">Correct Answers: </span> 
                            <span className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}>{(question.answer as string[]).join(", ")}</span>
                        </div>
                        <p className={`p-3 border rounded-lg text-sm ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-white/80' : 'bg-blue-50 border-blue-100 text-gray-700'}`}>{question.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
  }
}
