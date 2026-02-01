"use client";

import { HotspotQuestion } from '@/lib/azure-quiz-service';


interface HotspotYesNoTableProps {
  question: HotspotQuestion;
  userAnswer?: Record<string, "Yes" | "No">;
  onAnswer: (answer: Record<string, "Yes" | "No">) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function HotspotYesNoTable({
  question,
  userAnswer = {},
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: HotspotYesNoTableProps) {
  
  const handleToggle = (rowText: string, value: "Yes" | "No") => {
    onAnswer({
      ...userAnswer,
      [rowText]: value
    });
  };
  
  const rows = Object.keys(question.answer);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className={`backdrop-blur-xl border rounded-2xl p-6 md:p-8 transition-colors duration-300
        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}
      `}>
        <h3 className={`text-xl md:text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {question.question}
        </h3>

        <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-700'}`}>
                <th className="p-4 font-medium">Description / Statement</th>
                <th className="p-4 font-medium w-24 text-center">Yes</th>
                <th className="p-4 font-medium w-24 text-center">No</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {rows.map((rowKey) => {
                const currentVal = userAnswer[rowKey];
                const correctVal = question.answer[rowKey];
                
                const displayText = question.rows && question.rows[Number(rowKey.replace('Box',''))-1] 
                    ? question.rows[Number(rowKey.replace('Box',''))-1] 
                    : rowKey;

                return (
                  <tr key={rowKey} className={`transition-colors ${isDark ? 'bg-white/5 hover:bg-white/[0.07]' : 'bg-white hover:bg-gray-50'}`}>
                    <td className={`p-4 font-medium ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                      {displayText}
                    </td>
                    <td className="p-4 text-center">
                       <button
                         onClick={() => handleToggle(rowKey, "Yes")}
                         className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto
                           ${currentVal === "Yes" ? 'bg-purple-500 border-purple-500' : (isDark ? 'border-white/30' : 'border-gray-300 bg-white')}
                           ${isReviewMode && correctVal === "Yes" ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-black' : ''}
                         `}
                       >
                         {currentVal === "Yes" && <div className="w-2 h-2 bg-white rounded-full" />}
                       </button>
                    </td>
                    <td className="p-4 text-center">
                        <button
                         onClick={() => handleToggle(rowKey, "No")}
                         className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto
                           ${currentVal === "No" ? 'bg-purple-500 border-purple-500' : (isDark ? 'border-white/30' : 'border-gray-300 bg-white')}
                           ${isReviewMode && correctVal === "No" ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-black' : ''}
                         `}
                       >
                         {currentVal === "No" && <div className="w-2 h-2 bg-white rounded-full" />}
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isReviewMode && (
           <div 
            className={`mt-6 p-4 border rounded-xl animate-in fade-in duration-300 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
           >
             <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
           </div>
        )}
      </div>
    </div>
  );
}
