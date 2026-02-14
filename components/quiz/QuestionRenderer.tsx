
import dynamic from 'next/dynamic';
import { QuizQuestion, MCQQuestion, DragDropQuestion, HotspotQuestion, HotspotYesNoTableQuestion, HotspotSentenceQuestion, HotspotBoxMappingQuestion, CaseStudyQuestion } from "@/types";

// Lazy load question components to reduce bundle size
const MultipleChoiceCard = dynamic(() => import("./cards/MultipleChoiceCard").then(mod => mod.MultipleChoiceCard), { ssr: false });
const DragDropBoard = dynamic(() => import("./cards/DragDropBoard").then(mod => mod.DragDropBoard), { ssr: false });
const HotspotYesNoTable = dynamic(() => import("./cards/HotspotYesNoTable").then(mod => mod.HotspotYesNoTable), { ssr: false });
const HotspotYesNoTableNew = dynamic(() => import("./cards/HotspotYesNoTableNew").then(mod => mod.HotspotYesNoTableNew), { ssr: false });
const HotspotSentenceCompletion = dynamic(() => import("./cards/HotspotSentenceCompletion").then(mod => mod.HotspotSentenceCompletion), { ssr: false });
const HotspotBoxMapping = dynamic(() => import("./cards/HotspotBoxMapping").then(mod => mod.HotspotBoxMapping), { ssr: false });
const CaseStudyEvaluator = dynamic(() => import("./cards/CaseStudyEvaluator").then(mod => mod.CaseStudyEvaluator), { ssr: false });

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
      // Fallback for generic Questions, defaulting to MCQ card if it looks like one
      if ((question as any).options) {
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
      }
      return <div>Unsupported question type: {(question as any).type || 'unknown'}</div>;
  }
}
