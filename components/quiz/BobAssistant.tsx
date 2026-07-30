"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useChat } from "ai/react";
import { Sparkles, Bot } from "lucide-react";
import type { QuizQuestion } from "@/types";

// Sub-components
import { BobHeader } from "./bob/BobHeader";
import { BobMessages } from "./bob/BobMessages";
import { BobPrompts } from "./bob/BobPrompts";
import { BobInput } from "./bob/BobInput";

interface BobAssistantProps {
  question?: QuizQuestion;
  customContext?: string;
  initialMessage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function BobAssistant({ question, customContext, initialMessage, isOpen: controlledIsOpen, onClose: controlledOnClose }: BobAssistantProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  const handleOpen = () => setInternalIsOpen(true);

  // Memoized context
  const context = useMemo(() => {
    if (customContext) return customContext;
    if (question) {
      return `
Question: ${question.question}
Options: ${'options' in question ? question.options?.join(", ") : "N/A"}
Correct Answer: ${Array.isArray(question.answer) ? question.answer.join(", ") : (typeof question.answer === 'object' ? JSON.stringify(question.answer) : question.answer)}
Explanation (if any): ${question.explanation}
Code (if any): ${question.code}
`;
    }
    return "You are Bob, a helpful AI assistant for MockMate, a quiz platform.";
  }, [customContext, question]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setMessages, setInput } = useChat({
    api: '/api/chat',
    body: {
      data: { context }
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: initialMessage || (question ? "Hi! I'm Bob. I can explain this question simply. What do you need help with?" : "Hi! I'm Bob. How can I help you today?")
      }
    ],
    onError: (err: unknown) => {
      console.error("Chat error:", err);
    }
  });

  // Restore chat history from sessionStorage on mount (if not in a question-specific view)
  useEffect(() => {
    if (!question) {
      try {
        const saved = sessionStorage.getItem("mockmate_bob_chat_history");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to restore Bob chat history:", err);
      }
    }
  }, [question, setMessages]);

  // Persist non-empty chat history to sessionStorage
  useEffect(() => {
    if (!question && messages.length > 1) {
      try {
        sessionStorage.setItem("mockmate_bob_chat_history", JSON.stringify(messages));
      } catch (err) {
        console.error("Failed to persist Bob chat history:", err);
      }
    }
  }, [question, messages]);

  useEffect(() => {
    if (question) {
      setMessages([
        {
          id: `welcome - ${question.id}`,
          role: 'assistant',
          content: "Hi! I'm Bob. I can explain this question simply. What do you need help with?"
        }
      ]);
      setInput("");
    }
  }, [question, setMessages, setInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const clearChat = useCallback(() => {
    try {
      sessionStorage.removeItem("mockmate_bob_chat_history");
    } catch {
      // Ignore sessionStorage errors
    }
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: "Chat cleared. How can I help you now?"
      }
    ]);
  }, [setMessages]);

  const handlePromptClick = useCallback((prompt: string) => {
    setInput(prompt);
  }, [setInput]);

  return (
    <>
      {!isControlled && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white p-3.5 rounded-full shadow-xl shadow-orange-500/25 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center border border-white/20"
          title="Ask Bob"
          aria-label="Ask Bob AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <Sparkles className="w-3 h-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
            Ask Bob AI
          </span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:pointer-events-none"
            />

            <m.div
              drag={!isMobile}
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0, top: -100, bottom: 0 }}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className={`fixed bottom-4 left-4 right-4 md:left-auto md:bottom-24 md:right-8 z-[101] 
                md:w-[450px] 
                h-[60vh] md:h-[600px] 
                rounded-3xl 
                shadow-2xl flex flex-col overflow-hidden border pointer-events-auto 
                bg-white dark:bg-gray-900 border-white dark:border-gray-700
              `}
            >
              <BobHeader
                onClose={handleClose}
                onClear={clearChat}
              />

              <BobMessages
                messages={messages}
                isLoading={isLoading}
                error={error}
                onReload={reload}
                scrollRef={scrollRef}
              />

              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                <BobPrompts
                  onPromptClick={handlePromptClick}
                />
              )}

              <BobInput
                input={input}
                isLoading={isLoading}
                placeholder={question ? "Ask Bob about this question..." : "Ask Bob a question..."}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
