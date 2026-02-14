"use client";

import { QuizQuestion, MCQQuestion, DragDropQuestion, HotspotQuestion, HotspotYesNoTableQuestion, HotspotSentenceQuestion, HotspotBoxMappingQuestion, CaseStudyQuestion } from "@/types";
import { MultipleChoiceCard } from "./cards/MultipleChoiceCard";
import { DragDropBoard } from "./cards/DragDropBoard";
import { HotspotYesNoTable } from "./cards/HotspotYesNoTable";
import { HotspotYesNoTableNew } from "./cards/HotspotYesNoTableNew";
import { HotspotSentenceCompletion } from "./cards/HotspotSentenceCompletion";
import { HotspotBoxMapping } from "./cards/HotspotBoxMapping";
import { CaseStudyEvaluator } from "./cards/CaseStudyEvaluator";
import { AWSQuestionCard } from "./cards/AWSQuestionCard";

interface QuestionRendererProps {
  question: QuizQuestion;
  userAnswer: any;
  onAnswer: (answer: any) => void;
  isReviewMode: boolean;
  isDark: boolean;
  category: string;
}

export function QuestionRenderer({
  question,
  userAnswer,
  onAnswer,
  isReviewMode,
  isDark,
  category
}: QuestionRendererProps) {
  // Special handling for AWS if it's the old style, but ideally all follow types
  if (category === 'aws') {
      return (
          <AWSQuestionCard 
            question={question as any}
            selectedAnswers={userAnswer || []}
            onAnswer={(option, isMulti) => {
                const current = Array.isArray(userAnswer) ? userAnswer : [];
                if (isMulti) {
                    if (current.includes(option)) {
                        onAnswer(current.filter(a => a !== option));
                    } else {
                        onAnswer([...current, option]);
                    }
                } else {
                    onAnswer([option]);
                }
            }}
            isSubmitted={isReviewMode}
            mode={isReviewMode ? 'exam' : 'practice'}
            checkAnswer={() => false} // This prop in AWSQuestionCard is a bit redundant if we centralize scoring
          />
      );
  }

  switch (question.type) {
    case 'mcq':
    case 'MSQ':
      return (
        <MultipleChoiceCard 
          question={question as MCQQuestion}
          selectedAnswers={Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : []}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
          category={category}
        />
      );
    case 'drag_drop':
      return (
        <DragDropBoard 
          question={question as DragDropQuestion}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
        />
      );
    case 'hotspot':
      return (
        <HotspotYesNoTable 
          question={question as HotspotQuestion}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
        />
      );
    case 'hotspot_yesno_table':
      return (
        <HotspotYesNoTableNew 
          question={question as HotspotYesNoTableQuestion}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
        />
      );
    case 'hotspot_sentence':
      return (
        <HotspotSentenceCompletion 
          question={question as HotspotSentenceQuestion}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
        />
      );
    case 'hotspot_box_mapping':
      return (
        <HotspotBoxMapping 
          question={question as HotspotBoxMappingQuestion}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
        />
      );
    case 'case_table':
      return (
        <CaseStudyEvaluator 
          question={question as CaseStudyQuestion}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReviewMode={isReviewMode}
          isDark={isDark}
        />
      );
    default:
      // Exhaustive check to satisfy TypeScript
      return <div>Unsupported question type: {(question as any).type || 'unknown'}</div>;
  }
}
