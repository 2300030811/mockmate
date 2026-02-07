
import { QuizQuestion } from "@/types";
import { Check } from "lucide-react";
import { useTheme } from "@/app/providers";

interface PCAPQuestionCardProps {
  question: QuizQuestion;
  selectedAnswers: string[];
  onAnswer: (option: string, isMulti: boolean) => void;
  isSubmitted: boolean;
  mode: 'practice' | 'exam';
  checkAnswer: (q: QuizQuestion, answers: string[]) => boolean;
}

export function PCAPQuestionCard({ 
  question, 
  selectedAnswers = [], 
  onAnswer, 
  isSubmitted,
  mode,
  checkAnswer
}: PCAPQuestionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isMultiSelect = (text: string, type: string) => {
    return type === 'MSQ' || /\((Choose|Select|Check)\s+(two|three|four|\multiple|\d+)/i.test(text);
  };

  const isMulti = isMultiSelect(question.question, question.type);
  
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
      <div className="mb-8">
        <h2 className={`text-xl md:text-2xl font-bold leading-relaxed mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {question.question}
        </h2>

        {/* --- CODE BLOCK RENDERING --- */}
        {question.code && (
            <div className="relative group my-4">
                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-mono font-bold rounded-bl-lg rounded-tr-lg pointer-events-none select-none ${
                    isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                    PYTHON
                </div>
                <pre className={`p-5 rounded-xl overflow-x-auto font-mono text-sm leading-loose border shadow-inner ${
                    isDark ? 'bg-[#0d1117] border-gray-800 text-gray-300' : 'bg-[#1e1e1e] border-transparent text-gray-100'
                }`}>
                    <code className="block min-w-full">{question.code}</code>
                </pre>
            </div>
        )}

        {isMulti && (
            <span className={`block text-sm font-semibold mt-2 px-3 py-1 rounded-full w-fit ${
                isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
                Select Multiple Answers
            </span>
        )}
      </div>

      <div className="space-y-4">
        {question.options && question.options.map((option, idx) => {
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

          return (
            <button
              key={idx}
              onClick={() => onAnswer(option, isMulti)}
              disabled={isSubmitted}
              className={`${optionClass} ${isSubmitted ? 'cursor-default' : ''}`}
            >
              <span className={`flex-1 text-base font-medium ${
                isDark && !isSelected ? 'text-gray-300' : 'text-gray-700'
              }`}>{option}</span>
              {isSelected && (
                <span className={isDark ? 'ml-3 text-blue-400' : 'ml-3 text-blue-600'}>
                  <Check className="h-6 w-6" />
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
              ? <span className="text-xl font-bold">✅ Correct</span>
              : <span className="text-xl font-bold">❌ Incorrect</span>
            }
          </div>

          <p className="mb-2">
            <strong>Correct Answer:</strong>{" "}
            <span className="font-mono bg-black/10 dark:bg-white/10 px-1 rounded">
            {Array.isArray(question.answer) 
              ? question.answer.join(", ") 
              : typeof question.answer === 'object' 
                ? JSON.stringify(question.answer) 
                : question.answer ?? "N/A"}
            </span>
          </p>
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
