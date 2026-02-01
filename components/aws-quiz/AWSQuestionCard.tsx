import { AWSQuestion } from "@/hooks/useAWSQuiz";
import { useTheme } from "@/app/providers";

interface AWSQuestionCardProps {
  question: AWSQuestion;
  selectedAnswers: string[];
  onAnswer: (option: string, isMulti: boolean) => void;
  isSubmitted: boolean;
  mode: 'practice' | 'exam';
  checkAnswer: (q: AWSQuestion, answers: string[]) => boolean;
}

export function AWSQuestionCard({ 
  question, 
  selectedAnswers = [], 
  onAnswer, 
  isSubmitted,
  mode,
  checkAnswer
}: AWSQuestionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isMultiSelect = (text: string) => {
    return /\((Choose|Select|Check)\s+(two|three|four|\multiple|\d+)/i.test(text);
  };

  const isMulti = isMultiSelect(question.question);
  
  // Show results if we are in practice mode and have answered, OR if the exam is submitted
  const showResult = (mode === 'practice' && selectedAnswers.length > 0) || isSubmitted;
  
  // Determine if the user is correct (only if we are showing results)
  const isCorrect = showResult ? checkAnswer(question, selectedAnswers) : false;

  return (
    <div className={`p-6 md:p-10 rounded-3xl shadow-sm border transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900/50 border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl md:text-2xl font-bold mb-8 leading-relaxed ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {question.question}
      </h2>

      <div className="space-y-4">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswers.includes(option);
          
          let optionClass = `w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group cursor-pointer `;
          
          if (isSelected) {
            optionClass += isDark
              ? 'border-blue-500 bg-blue-900/40 text-white font-semibold shadow-sm'
              : 'border-blue-500 bg-blue-50 text-blue-900 font-semibold shadow-sm';
          } else {
            optionClass += isDark 
              ? 'border-gray-800 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-700' 
              : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300';
          }

          // If submitted/reviewed, show correct/wrong indication on options? 
          // The original code didn't strictly color the options themselves red/green, 
          // but relied on the result box below. 
          // However, for better UX, we could highlight correct answers here if submitted.
          // For now, let's stick to the original behavior to ensure 1:1 parity first.

          return (
            <button
              key={idx}
              onClick={() => onAnswer(option, isMulti)}
              disabled={isSubmitted}
              className={`${optionClass} ${isSubmitted ? 'cursor-default' : ''}`}
            >
              <span className={`flex-1 text-base ${
                isDark && !isSelected ? 'text-gray-300' : ''
              }`}>{option}</span>
              {isSelected && (
                <span className={isDark ? 'ml-3 text-blue-400' : 'ml-3 text-blue-600'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`mt-8 p-6 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
          isCorrect
            ? isDark
              ? 'bg-green-900/20 border-green-800 text-green-100'
              : 'bg-green-50 border-green-200 text-green-900'
            : isDark
              ? 'bg-red-900/20 border-red-800 text-red-100'
              : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect
              ? <span className="text-xl">✅ Correct</span>
              : <span className="text-xl">❌ Incorrect</span>
            }
          </div>
          <p className="mb-2"><strong>Correct Answer:</strong> {question.answer}</p>
          {question.explanation && (
            <div className={`mt-4 pt-4 border-t ${
              isDark ? 'border-white/10' : 'border-black/10'
            }`}>
              <p className="font-semibold mb-1 opacity-75 uppercase text-xs tracking-wider">Explanation</p>
              <p className="leading-relaxed opacity-90">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
