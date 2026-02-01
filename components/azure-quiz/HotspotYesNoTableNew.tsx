"use client";

interface Statement {
  text: string;
  answer: "Yes" | "No";
}

interface HotspotYesNoTableNewProps {
  question: {
    id: number;
    type: string;
    question: string;
    statements: Statement[];
    explanation?: string;
  };
  userAnswer?: Record<number, "Yes" | "No">; // Map statement index to answer
  onAnswer: (answer: Record<number, "Yes" | "No">) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function HotspotYesNoTableNew({
  question,
  userAnswer = {},
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: HotspotYesNoTableNewProps) {
  
  const handleToggle = (index: number, value: "Yes" | "No") => {
    onAnswer({
      ...userAnswer,
      [index]: value
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
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
                <th className="p-4 font-medium">Statement</th>
                <th className="p-4 font-medium w-24 text-center">Yes</th>
                <th className="p-4 font-medium w-24 text-center">No</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {question.statements.map((stmt, index) => {
                const currentVal = userAnswer[index];
                const correctVal = stmt.answer;

                return (
                  <tr key={index} className={`transition-colors ${isDark ? 'bg-white/5 hover:bg-white/[0.07]' : 'bg-white hover:bg-gray-50'}`}>
                    <td className={`p-4 font-medium ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                      {stmt.text}
                    </td>
                    <td className="p-4 text-center">
                       <button
                         onClick={() => handleToggle(index, "Yes")}
                         className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto
                           ${currentVal === "Yes" ? 'bg-blue-500 border-blue-500' : (isDark ? 'border-white/30' : 'border-gray-300 bg-white')}
                           ${isReviewMode && correctVal === "Yes" ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-black' : ''}
                         `}
                       >
                         {currentVal === "Yes" && <div className="w-2 h-2 bg-white rounded-full" />}
                       </button>
                    </td>
                    <td className="p-4 text-center">
                        <button
                         onClick={() => handleToggle(index, "No")}
                         className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto
                           ${currentVal === "No" ? 'bg-blue-500 border-blue-500' : (isDark ? 'border-white/30' : 'border-gray-300 bg-white')}
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

        {isReviewMode && question.explanation && (
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
