"use client";

interface BoxItem {
  label: string;
  options: string[];
  answer: string;
}

interface HotspotBoxMappingProps {
  question: {
    id: number;
    type: string;
    question: string;
    boxes: BoxItem[];
    explanation?: string;
  };
  userAnswer?: Record<number, string>; // Map box index to selected option
  onAnswer: (answer: Record<number, string>) => void;
  isReviewMode?: boolean;
  isDark?: boolean;
}

export function HotspotBoxMapping({
  question,
  userAnswer = {},
  onAnswer,
  isReviewMode = false,
  isDark = true,
}: HotspotBoxMappingProps) {
  
  const handleSelect = (boxIndex: number, option: string) => {
    onAnswer({
      ...userAnswer,
      [boxIndex]: option
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

        <div className="space-y-6">
          {question.boxes.map((box, boxIndex) => {
            const selectedOption = userAnswer[boxIndex];
            const correctOption = box.answer;
            const isCorrect = selectedOption === correctOption;

            return (
              <div 
                key={boxIndex}
                className={`p-5 rounded-xl border transition-colors
                  ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}
                `}
              >
                {/* Label */}
                <div className={`font-medium mb-4 ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                  {box.label}
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-3">
                  {box.options.map((option, optIndex) => {
                    const isSelected = selectedOption === option;
                    const isTheCorrectOption = correctOption === option;

                    let buttonClass = '';
                    let borderColor = '';
                    let bgColor = '';
                    let textColor = '';

                    if (isReviewMode) {
                      if (isTheCorrectOption) {
                        borderColor = 'border-green-500';
                        bgColor = 'bg-green-500/10';
                        textColor = 'text-green-500';
                      } else if (isSelected && !isTheCorrectOption) {
                        borderColor = 'border-red-500';
                        bgColor = 'bg-red-500/10';
                        textColor = 'text-red-500';
                      } else {
                        borderColor = isDark ? 'border-white/20' : 'border-gray-300';
                        bgColor = 'bg-transparent';
                        textColor = isDark ? 'text-white/50' : 'text-gray-500';
                      }
                    } else if (isSelected) {
                      borderColor = 'border-blue-500';
                      bgColor = 'bg-blue-500/10';
                      textColor = 'text-blue-500';
                    } else {
                      borderColor = isDark ? 'border-white/20' : 'border-gray-300';
                      bgColor = isDark ? 'bg-white/5' : 'bg-white';
                      textColor = isDark ? 'text-white/70' : 'text-gray-700';
                    }

                    buttonClass = `px-4 py-2 rounded-lg border-2 font-medium transition-all ${borderColor} ${bgColor} ${textColor} hover:scale-105 active:scale-95`;

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelect(boxIndex, option)}
                        className={buttonClass}
                      >
                        {option}
                        {isReviewMode && isTheCorrectOption && (
                          <span className="ml-2">✓</span>
                        )}
                        {isReviewMode && isSelected && !isTheCorrectOption && (
                          <span className="ml-2">✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Show correct answer if wrong */}
                {isReviewMode && !isCorrect && selectedOption && (
                  <div className="mt-3 text-sm text-green-500">
                    Correct answer: <span className="font-semibold">{correctOption}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {isReviewMode && question.explanation && (
          <div 
            className={`mt-6 p-4 border rounded-xl animate-in fade-in duration-300 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
          >
            <h4 className="text-blue-500 font-medium mb-2">Explanation</h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
