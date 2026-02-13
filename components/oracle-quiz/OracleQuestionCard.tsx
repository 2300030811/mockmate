import { QuizQuestion } from "@/types";
import { Check, X } from "lucide-react";
import { useTheme } from "@/app/providers";

interface OracleQuestionCardProps {
  question: QuizQuestion;
  selectedAnswers: string[];
  onAnswer: (option: string, isMulti: boolean) => void;
  isSubmitted: boolean;
  mode: 'practice' | 'exam';
  checkAnswer: (q: QuizQuestion, answers: string[]) => boolean;
}

export function OracleQuestionCard({ 
  question, 
  selectedAnswers = [], 
  onAnswer, 
  isSubmitted,
  mode,
  checkAnswer
}: OracleQuestionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isMultiSelect = (text: string) => {
    const textMatch = /\((Choose|Select|Check)\s+(two|three|four|\multiple|\d+)/i.test(text);
    const answerMatch = !!(question.answer && typeof question.answer === 'string' && question.answer.includes(","));
    return textMatch || answerMatch;
  };

  const isMulti = isMultiSelect(question.question);
  
  // Show results if we are in practice mode and have answered, OR if the exam is submitted
  const showResult = (mode === 'practice' && selectedAnswers.length > 0) || isSubmitted;
  
  // Determine if the user is correct (only if we are showing results)
  const isCorrect = showResult ? checkAnswer(question, selectedAnswers) : false;

  // Use 'in' operator check or type assertion to safely access options
  const options = 'options' in question ? (question as any).options as string[] : [];

  const renderQuestionText = (text: string) => {
    // Check if the question contains code-like structures
    const isCodeQuestion = text.includes('\n') || /class|public|static|void|import/.test(text);

    if (isCodeQuestion) {
      // Split by newline to check structure
      const lines = text.split('\n');
      
      return (
        <div className={`text-base md:text-lg rounded-xl overflow-hidden border ${
          isDark ? 'border-gray-700 bg-gray-950' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
            isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-200 border-gray-300 text-gray-600'
          }`}>
             Code Snippet / Scenario
          </div>
          <pre className={`p-4 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-800'
          }`}>
            {text}
          </pre>
        </div>
      );
    }

    return (
      <h2 className={`text-xl md:text-2xl font-bold leading-relaxed ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        {text}
      </h2>
    );
  };

  return (
    <div className={`p-6 md:p-8 rounded-3xl shadow-lg border transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900 border-gray-800 shadow-gray-950/50' 
        : 'bg-white border-gray-100 shadow-gray-200/50'
    }`}>
      
      <div className="mb-8">
        {renderQuestionText(question.question)}
      </div>

      <div className="space-y-4">
        {options.map((option: string, idx: number) => {
          const isSelected = selectedAnswers.includes(option);
          
          let optionBaseClass = `w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group cursor-pointer relative overflow-hidden`;
          let optionThemeClass = "";
          
          if (isSelected) {
            optionThemeClass = isDark
              ? 'border-red-500 bg-red-950/30 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'border-red-500 bg-red-50 text-red-900 shadow-md';
          } else {
            optionThemeClass = isDark 
              ? 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/50 hover:border-gray-700 text-gray-300' 
              : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:border-red-200 text-gray-700';
          }

          return (
            <button
              key={idx}
              onClick={() => onAnswer(option, isMulti)}
              disabled={isSubmitted}
              className={`${optionBaseClass} ${optionThemeClass} ${isSubmitted ? 'cursor-default' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                 isSelected 
                   ? (isDark ? 'bg-red-500 border-red-500 text-white' : 'bg-red-500 border-red-500 text-white')
                   : (isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-500 group-hover:border-red-300 group-hover:text-red-500')
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              
              <span className="flex-1 pt-1 text-sm md:text-base font-medium leading-relaxed font-sans">
                  {option.replace(/^[A-H]\.\s*/, '')}
              </span>
              
              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <div className={`p-1 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                      <Check className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                   </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`mt-8 overflow-hidden rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
          isCorrect
            ? isDark
              ? 'bg-emerald-950/30 border-emerald-900/50'
              : 'bg-emerald-50 border-emerald-200'
            : isDark
              ? 'bg-red-950/30 border-red-900/50'
              : 'bg-red-50 border-red-200'
        }`}>
          <div className={`p-4 flex items-center gap-3 border-b ${
            isCorrect
              ? isDark ? 'bg-emerald-900/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-100/50 border-emerald-200 text-emerald-700'
              : isDark ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-100/50 border-red-200 text-red-700'
          }`}>
            {isCorrect
              ? <Check className="h-6 w-6" />
              : <X className="h-6 w-6" />
            }
            <span className="font-bold text-lg">{isCorrect ? 'Correct Answer' : 'Incorrect'}</span>
          </div>

          <div className="p-6">
             <div className="mb-4">
                <span className={`text-sm font-semibold uppercase tracking-wider opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Correct Option:
                </span>
                <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {String(question.answer)}
                </p>
             </div>

            {question.explanation && (
              <div className={`mt-4 pt-4 border-t ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}>
                <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                   Explanation
                </p>
                <p className={`leading-relaxed text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
