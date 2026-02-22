/**
 * Quiz Component Barrel Exports
 *
 * Clean import path for quiz components:
 *   import { UniversalQuizShell, QuizNavbar, QuizSidebar } from "@/components/quiz";
 */

// Core quiz components
export { UniversalQuizShell } from "./UniversalQuizShell";
export { QuizNavbar } from "./QuizNavbar";
export { QuizSidebar } from "./QuizSidebar";
export { QuizResults } from "./QuizResults";
export { QuestionRenderer } from "./QuestionRenderer";
export { SyntaxBlock } from "./SyntaxBlock";

// Mode selection
export { GenericModeSelect } from "./GenericModeSelect";
export { ModeCard } from "./ModeCard";

// Interaction components
export { default as DragDropInteraction } from "./DragDropInteraction";
export { NicknamePrompt } from "./NicknamePrompt";

// Bob assistant
export { BobAssistant } from "./BobAssistant";
