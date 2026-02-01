"use client";

import { CaseStudyQuestion } from '@/lib/azure-quiz-service';


interface CaseStudyEvaluatorProps {
  question: CaseStudyQuestion;
  userAnswer?: Record<number, "Yes" | "No">; // Map index to answer
  onAnswer: (answer: Record<number, "Yes" | "No">) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function CaseStudyEvaluator({
  question,
  userAnswer = {},
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: CaseStudyEvaluatorProps) {

  const handleToggle = (index: number, value: "Yes" | "No") => {
    onAnswer({
      ...userAnswer,
      [index]: value
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
       {/* Scenario Panel */}
       <div className={`border rounded-2xl p-6 transition-colors duration-300
         ${isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-100'}
       `}>
         <h4 className="text-blue-500 font-semibold mb-3 uppercase tracking-wider text-sm">Case Study Scenario</h4>
         <p className={`leading-relaxed text-lg ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
           {question.scenario}
         </p>
       </div>

      <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Evaluate the following statements based on the scenario:
        </h3>

        <div className="space-y-4">
            {question.statements.map((stmt, idx) => {
                const currentVal = userAnswer[idx];
                const correctVal = stmt.answer;
                const isCorrect = currentVal === correctVal;

                return (
                    <div key={idx} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-colors
                      ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}
                    `}>
                        <span className={`font-medium flex-1 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{stmt.text}</span>
                        
                        <div className="flex items-center gap-4 shrink-0">
                            {/* Yes Button */}
                            <button
                                onClick={() => handleToggle(idx, "Yes")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                                    ${currentVal === "Yes" 
                                        ? 'bg-green-500 text-white border-green-500' 
                                        : (isDark ? 'bg-transparent text-white/50 border-white/20 hover:border-white/40' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50')}
                                    ${isReviewMode && correctVal === "Yes" ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-black' : ''}
                                `}
                            >
                                Yes
                            </button>
                            
                             {/* No Button */}
                             <button
                                onClick={() => handleToggle(idx, "No")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                                    ${currentVal === "No" 
                                        ? 'bg-red-500 text-white border-red-500' 
                                        : (isDark ? 'bg-transparent text-white/50 border-white/20 hover:border-white/40' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50')}
                                    ${isReviewMode && correctVal === "No" ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-black' : ''}
                                `}
                            >
                                No
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
        
         {isReviewMode && (
           <div 
            className={`mt-6 p-4 border rounded-xl animate-in fade-in duration-300 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
           >
             <h4 className="text-blue-500 font-medium mb-2">Explanation</h4>
             <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
           </div>
        )}
      </div>
    </div>
  );
}
