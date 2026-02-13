"use client";

import { useEffect, useState, useRef } from "react";
import { useAzureQuiz, QuizMode } from '@/hooks/useAzureQuiz';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { DragDropBoard } from './DragDropBoard';
import { HotspotYesNoTable } from './HotspotYesNoTable';
import { HotspotYesNoTableNew } from './HotspotYesNoTableNew';
import { HotspotSentenceCompletion } from './HotspotSentenceCompletion';
import { HotspotBoxMapping } from './HotspotBoxMapping';
import { CaseStudyEvaluator } from './CaseStudyEvaluator';
import { useTheme } from '@/app/providers';

import { useRouter } from "next/navigation";

// --- Icons ---
import { AzureQuizNavbar } from "./AzureQuizNavbar";
import { AzureQuizSidebar } from "./AzureQuizSidebar";
import { BobAssistant } from "../quiz/BobAssistant";
import { NicknamePrompt } from "../quiz/NicknamePrompt";

interface QuizContainerProps {
  mode: QuizMode;
  questionCount?: number;
}

export function QuizContainer({ mode: initialMode }: QuizContainerProps) {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    
    const {
        questions,
        loading,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        userAnswers,
        handleAnswer,
        nextQuestion,
        prevQuestion,
        timeRemaining,
        handleSubmitExam,
        isSubmitted,
        score,
        mode,
        setMode
    } = useAzureQuiz({ initialMode });

    const [viewingResults, setViewingResults] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    // Local state to control "Check Answer" visibility for complex types
    const [showPracticeResult, setShowPracticeResult] = useState(false);

    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTop = 0;
        }
    }, [currentQuestionIndex]);

    useEffect(() => {
        if (isSubmitted) {
            setViewingResults(true);
        }
    }, [isSubmitted]);

    // Reset local check state when question changes or answer is updated
    useEffect(() => {
        setShowPracticeResult(false);
    }, [currentQuestionIndex, userAnswers]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg">Loading Exam Content...</span>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Questions</h2>
                <p className={`mb-6 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Could not fetch questions from the server.</p>
                <button 
                  onClick={() => router.push('/azure-quiz/mode')}
                  className={`px-6 py-2 rounded-lg transition ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                    Return to Home
                </button>
            </div>
        );
    }

    // --- RESULT SUMMARY VIEW ---
    if (viewingResults) {
        const percentage = Math.round((score / questions.length) * 100);
        const isPassed = percentage >= 70;

        return (
            <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <div 
                    className={`max-w-2xl w-full backdrop-blur-xl border rounded-3xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-300
                        ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'}
                    `}
                >
                    <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Exam Completed</h2>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
                         <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className={isDark ? "text-white/10" : "text-gray-200"} />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                                    className={isPassed ? "text-green-500" : "text-red-500"}
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * percentage) / 100}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className={`absolute text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
                         </div>
                         <div className="text-left space-y-2">
                             <div className={`text-lg ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Score: <strong className={isDark ? 'text-white' : 'text-gray-900'}>{score} / {questions.length}</strong></div>
                             <div className={`text-lg ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Result: <strong className={isPassed ? "text-green-500" : "text-red-500"}>{isPassed ? "PASS" : "FAIL"}</strong></div>
                             <div className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Passing Score: 70%</div>
                         </div>
                    </div>

                    {/* Leaderboard Nickname Prompt */}
                    {mode === 'exam' && (
                        <NicknamePrompt 
                            score={score}
                            totalQuestions={questions.length}
                            category="azure"
                        />
                    )}

                    <div className="flex gap-4 justify-center mt-8">
                         <button 
                            onClick={() => router.push('/azure-quiz/mode')}
                            className={`px-8 py-3 rounded-xl font-semibold transition border
                                ${isDark 
                                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'}
                            `}
                        >
                            Back to Menu
                        </button>
                        <button 
                            onClick={() => {
                                setViewingResults(false);
                                setCurrentQuestionIndex(0);
                            }}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/30"
                        >
                            Review Answers
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- QUESTION VIEW ---
    const currentQuestion = questions[currentQuestionIndex];


    const isMcq = currentQuestion.type === 'mcq';
    // For MCQ, we show explanation immediately if answered.
    // For others, we wait for "Check Answer" (showPracticeResult) OR if it's review mode.
    const isPracticeAndAnswered = mode === 'practice' && !!userAnswers[currentQuestion.id];
    
    // Logic:
    // If Review Mode: Always show.
    // If Practice Mode:
    //    - MCQ: Show if answered.
    //    - Drag/Hotspot: Show ONLY if user clicked "Check Answer".
    const showExplanation = mode === 'review' || 
                            (mode === 'practice' && (isMcq ? isPracticeAndAnswered : showPracticeResult));

    const isDarkGlobal = isDark; // alias for clarity if needed

    return (
        <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            
            {/* NAVBAR */}
            {/* NAVBAR */}
            <AzureQuizNavbar 
                mode={mode}
                isDark={isDark}
                toggleTheme={toggleTheme}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                timeRemaining={timeRemaining}
                isSubmitted={isSubmitted}
            />

            <div className="flex-1 flex overflow-hidden relative">
                
                {/* SIDEBAR NAVIGATION */}
                {/* SIDEBAR NAVIGATION */}
                <AzureQuizSidebar 
                    isOpen={sidebarOpen}
                    setIsOpen={setSidebarOpen}
                    questions={questions}
                    currentQuestionIndex={currentQuestionIndex}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    userAnswers={userAnswers}
                    isDark={isDark}
                    isSubmitted={isSubmitted}
                    onOpenSubmitModal={() => setShowConfirm(true)}
                    mode={mode}
                />

                {/* MAIN CONTENT */}
                <main ref={mainRef} className="flex-1 overflow-y-auto h-full p-4 md:p-8 scroll-smooth relative">
                    <div className="max-w-4xl mx-auto pb-24">
                        
                        {/* Question Header */}
                        <div className="mb-8">
                             <div className="flex justify-between items-end mb-2">
                                <span className={`font-mono text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border
                                    ${isDark ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-blue-700 border-blue-300 bg-blue-50'}
                                `}>
                                    {currentQuestion.type.replace('_', ' ')}
                                </span>
                             </div>
                             <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                 <div 
                                    className="h-full bg-blue-500 transition-all duration-300" 
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                 />
                             </div>
                        </div>

                        {/* Question Components - Animations removed for stability */}
                        <div key={currentQuestion.id} className="transition-opacity duration-300 animate-in fade-in">
                                {currentQuestion.type === 'mcq' && (
                                    <MultipleChoiceCard 
                                        question={currentQuestion as import("@/types").MCQQuestion}
                                        selectedAnswer={userAnswers[currentQuestion.id] as string | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                    />
                                )}
                                {currentQuestion.type === 'drag_drop' && (
                                     <DragDropBoard 
                                        question={currentQuestion as import("@/types").DragDropQuestion}
                                        userAnswer={userAnswers[currentQuestion.id] as Record<string, string> | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                     />
                                )}
                                {currentQuestion.type === 'hotspot' && (
                                    <HotspotYesNoTable 
                                        question={currentQuestion as import("@/types").HotspotQuestion}
                                        userAnswer={userAnswers[currentQuestion.id] as Record<string, "Yes" | "No"> | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                    />
                                )}
                                {currentQuestion.type === 'hotspot_yesno_table' && (
                                    <HotspotYesNoTableNew 
                                        question={currentQuestion as import("@/types").HotspotYesNoTableQuestion}
                                        userAnswer={userAnswers[currentQuestion.id] as Record<number, "Yes" | "No"> | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                    />
                                )}
                                {currentQuestion.type === 'hotspot_sentence' && (
                                    <HotspotSentenceCompletion 
                                        question={currentQuestion as import("@/types").HotspotSentenceQuestion}
                                        userAnswer={userAnswers[currentQuestion.id] as string | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                    />
                                )}
                                {currentQuestion.type === 'hotspot_box_mapping' && (
                                    <HotspotBoxMapping 
                                        question={currentQuestion as import("@/types").HotspotBoxMappingQuestion}
                                        userAnswer={userAnswers[currentQuestion.id] as Record<number, string> | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                    />
                                )}
                                {currentQuestion.type === 'case_table' && (
                                    <CaseStudyEvaluator 
                                        question={currentQuestion as import("@/types").CaseStudyQuestion}
                                        userAnswer={userAnswers[currentQuestion.id] as Record<number, "Yes" | "No"> | undefined}
                                        onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                                        isReviewMode={showExplanation}
                                        isDark={isDark}
                                    />
                                )}
                        </div>
                        
                        {/* Check Answer Button for Interactive Logic (Practice Mode Only) */}
                        {mode === 'practice' && !isMcq && !showPracticeResult && userAnswers[currentQuestion.id] && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => setShowPracticeResult(true)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
                                >
                                    Check Answer
                                </button>
                            </div>
                        )}

                        {/* Navigation Buttons (Bottom) */}
                        <div className={`flex justify-between items-center mt-12 pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                             <button
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={`px-6 py-2 rounded-lg font-medium transition ${
                                    currentQuestionIndex === 0 
                                        ? 'opacity-50 cursor-not-allowed bg-transparent' // simplified disabled state
                                        : (isDark ? 'text-white bg-white/5 hover:bg-white/10' : 'text-gray-800 bg-gray-100 hover:bg-gray-200')
                                }`}
                             >
                                 Previous
                             </button>

                             <button
                                onClick={nextQuestion}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className={`px-8 py-2 rounded-lg font-bold transition ${
                                    currentQuestionIndex === questions.length - 1 
                                        ? 'hidden' 
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                }`}
                             >
                                 Next Question
                             </button>
                             
                             {/* Show explicit finish if last question */}
                             {currentQuestionIndex === questions.length - 1 && !isSubmitted && (
                                 <button
                                    onClick={() => setShowConfirm(true)}
                                    className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-500/20"
                                 >
                                     Finish
                                 </button>
                             )}
                        </div>
                    </div>
                </main>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                     <div
                        className={`border p-8 rounded-2xl max-w-md w-full shadow-2xl transition-colors animate-in fade-in zoom-in duration-200
                            ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}
                        `}
                     >
                        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ready to Submit?</h3>
                         <p className={`mb-8 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                           You have answered <span className="text-blue-500 font-bold">{Object.keys(userAnswers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
                        </p>
                        <div className="flex gap-4 justify-end">
                             <button 
                                onClick={() => setShowConfirm(false)}
                                className={`px-5 py-2 rounded-lg transition ${isDark ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                             >
                                 Cancel
                             </button>
                             <button 
                                onClick={() => { setShowConfirm(false); handleSubmitExam(); }}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold shadow-lg"
                             >
                                 Submit
                             </button>
                        </div>
                     </div>
                </div>
            )}

            {/* Bob Assistant Integration */}
            {mode !== 'exam' && (
                <BobAssistant 
                    key={currentQuestion.id}
                    question={currentQuestion} 
                />
            )}
        </div>
    );
}
