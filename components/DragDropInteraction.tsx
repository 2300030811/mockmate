import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";

type DragDropItem = {
  id: string;
  text: string;
};

type DragDropProps = {
  sources: DragDropItem[]; // The initial list of items to choose from
  correctOrder: string[]; // Array of IDs in the correct order
  onComplete: (isCorrect: boolean) => void;
  isDark: boolean;
};

export default function DragDropInteraction({
  sources,
  correctOrder,
  onComplete,
  isDark,
}: DragDropProps) {
  // Items available to be moved to answer area
  const [sourceList, setSourceList] = useState<DragDropItem[]>(sources);
  
  // Items placed in the answer area
  const [answerList, setAnswerList] = useState<DragDropItem[]>([]);
  
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveToAnswer = (item: DragDropItem) => {
    if (isChecked) return; // Locked after checking
    setSourceList(sourceList.filter((i) => i.id !== item.id));
    setAnswerList([...answerList, item]);
  };

  const moveToSource = (item: DragDropItem) => {
    if (isChecked) return;
    setAnswerList(answerList.filter((i) => i.id !== item.id));
    setSourceList([...sourceList, item]);
  };

  const checkAnswer = () => {
    // 1. Must use all items? Usually yes for ordering.
    // 2. Order must match correctOrder.
    const currentIds = answerList.map((i) => i.id);
    
    // Check length
    if (currentIds.length !== correctOrder.length) {
      alert("Please place all items in the Answer Area.");
      return;
    }

    // Check strict order
    const correct = currentIds.every((id, index) => id === correctOrder[index]);
    
    setIsCorrect(correct);
    setIsChecked(true);
    onComplete(correct);
  };

  const reset = () => {
    setSourceList(sources);
    setAnswerList([]);
    setIsChecked(false);
    setIsCorrect(false);
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${
      isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
    }`}>
      <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Interactive Challenge: Arrange the resources
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* SOURCE COLUMN */}
        <div className={`p-4 rounded-xl border-2 border-dashed ${
           isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
        }`}>
          <p className={`mb-4 text-sm font-bold uppercase tracking-wider ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>Available Resources</p>
          
          <div className="space-y-2 min-h-[200px]">
            {sourceList.map((item) => (
              <motion.button
                layoutId={item.id}
                key={item.id}
                onClick={() => moveToAnswer(item)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg text-left font-medium shadow-sm flex items-center justify-between group ${
                  isDark 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-cyan-400'
                }`}
              >
                {item.text}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500">
                  →
                </span>
              </motion.button>
            ))}
            {sourceList.length === 0 && (
                <p className="text-center italic opacity-50 py-10">All items placed</p>
            )}
          </div>
        </div>

        {/* TARGET COLUMN (Reorderable) */}
        <div className={`p-4 rounded-xl border-2 ${
           isChecked 
             ? isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
             : isDark ? 'border-cyan-500/30 bg-gray-800' : 'border-cyan-500/30 bg-blue-50'
        }`}>
           <p className={`mb-4 text-sm font-bold uppercase tracking-wider ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>Answer Area (Top to Bottom)</p>
          
          <Reorder.Group axis="y" values={answerList} onReorder={setAnswerList} className="space-y-2 min-h-[200px]">
            {answerList.map((item) => (
              <Reorder.Item key={item.id} value={item}>
                <div className={`w-full p-3 rounded-lg text-left font-medium shadow-sm flex items-center justify-between cursor-grab active:cursor-grabbing ${
                    isDark 
                        ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/30' 
                        : 'bg-white text-cyan-900 border border-cyan-200'
                }`}>
                    <span onClick={() => moveToSource(item)} className="cursor-pointer hover:text-red-500 px-2">
                        ←
                    </span>
                    <span className="flex-1 text-center">{item.text}</span>
                    <span className="opacity-50">☰</span>
                </div>
              </Reorder.Item>
            ))}
            {answerList.length === 0 && (
                <div className="h-full flex items-center justify-center text-center italic opacity-50 py-10 border-2 border-dashed rounded-lg border-transparent">
                    Drag or click left items to add here
                </div>
            )}
          </Reorder.Group>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-6 flex justify-end gap-3">
        {!isChecked ? (
            <button
                onClick={checkAnswer}
                disabled={answerList.length === 0}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Check Answer
            </button>
        ) : (
            <div className="flex items-center gap-4 animate-in fade-in">
                <span className={`font-bold text-lg ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? "Correct! 🎉" : "Incorrect. Try Again."}
                </span>
                {!isCorrect && (
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        Reset
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
