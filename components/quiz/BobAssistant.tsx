"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { X, Send, User, Bot, Loader2, Sparkles, Trash2, MessageSquare, Lightbulb, Code2 } from "lucide-react";
import { useTheme } from "@/app/providers";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, Message } from "ai/react";
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { QuizQuestion } from "@/types";

interface BobAssistantProps {
  question?: QuizQuestion;
  customContext?: string;
  initialMessage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function BobAssistant({ question, customContext, initialMessage, isOpen: controlledIsOpen, onClose: controlledOnClose }: BobAssistantProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Derived state to handle both controlled and uncontrolled modes
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  
  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleOpen = () => {
    setInternalIsOpen(true);
  }

  // Prepare context
  let context = "";
  
  if (customContext) {
      context = customContext;
  } else if (question) {
      context = `
Question: ${question.question}
Options: ${ 'options' in question ? question.options?.join(", ") : "N/A"}
Correct Answer: ${Array.isArray(question.answer) ? question.answer.join(", ") : (typeof question.answer === 'object' ? JSON.stringify(question.answer) : question.answer)}
Explanation (if any): ${question.explanation}
Code (if any): ${question.code}
`;
  } else {
      context = "You are Bob, a helpful AI assistant for MockMate, a quiz platform.";
  }

  // Use Vercel AI SDK useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } = useChat({
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

  // Reset chat when question changes
  useEffect(() => {
    if (question) {
        setMessages([
            { 
                id: `welcome-${question.id}`, 
                role: 'assistant', 
                content: "Hi! I'm Bob. I can explain this question simply. What do you need help with?" 
            }
        ]);
        setInput("");
    }
  }, [question, setMessages, setInput]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);



  return (
    <>
        {/* Floating Action Button (Only show if uncontrolled) */}
        {!isControlled && (
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 group"
                title="Ask Bob"
            >
                <div className="text-3xl leading-none">✨</div>
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Ask Bob
                </span>
            </button>
        )}

        <AnimatePresence>
        {isOpen && (
            <>
            {/* Backdrop (Optional, keeps user focused) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:pointer-events-none" 
            />
            {/* Note: Removed intrusive backdrop on desktop so user can see quiz while chatting */}

            {/* Chat Window */}
            <motion.div
                drag={!isMobile}
                dragMomentum={false}
                dragConstraints={{ left: 0, right: 0, top: -100, bottom: 0 }}
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className={`fixed bottom-0 left-0 right-0 md:left-auto md:bottom-24 md:right-8 z-[101] 
                    w-full md:w-[450px] 
                    h-[85vh] md:h-[600px] 
                    max-h-[85vh] md:max-h-[80vh] 
                    rounded-t-3xl rounded-b-none md:rounded-3xl 
                    shadow-2xl flex flex-col overflow-hidden border pointer-events-auto ${
                isDark 
                    ? "bg-gray-900 border-gray-700" 
                    : "bg-white border-white"
                }`}
            >
                {/* Header */}
                <div 
                    className={`p-4 flex items-center justify-between border-b cursor-grab active:cursor-grabbing ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                    }`}
                >
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-full shadow-lg text-white flex items-center justify-center w-10 h-10">
                        <span className="text-lg">✨</span>
                    </div>
                    <div>
                    <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Bob the Assistant</h3>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Here to help you pass!</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setMessages([
                            { 
                                id: 'reset', 
                                role: 'assistant', 
                                content: "Chat cleared. How can I help you now?" 
                            }
                        ])} 
                        className="rounded-full hover:bg-red-100 text-red-500"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleClose} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                isDark ? "bg-gray-900" : "bg-gray-50"
                }`}>
                {messages.map((msg: Message) => (
                    <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                    {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-1 text-white shadow-md">
                            <span className="text-sm">✨</span>
                        </div>
                    )}
                    <div className={`rounded-2xl p-3 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : isDark 
                            ? "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700" 
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}>
                        {/* Render Markdown Content with Syntax Highlighting */}
                    <div className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}>
                         <ReactMarkdown
                            components={{
                                code({ node, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { node?: unknown }) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return match ? (
                                        <SyntaxHighlighter
                                            {...props}
                                            PreTag="div"
                                            language={match[1]}
                                            style={isDark ? atomDark : oneLight}
                                            customStyle={{
                                                fontSize: '0.8rem',
                                                borderRadius: '0.5rem',
                                                marginTop: '0.5rem',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code {...props} className={`${className} bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-xs`}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                    </div>
                    {msg.role === "user" && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                            <User className="w-4 h-4 opacity-70" />
                        </div>
                    )}
                    </div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 justify-start">
                         <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 text-white shadow-md">
                            <span className="text-sm">✨</span>
                        </div>
                        <div className={`rounded-2xl p-4 bg-gray-200 dark:bg-gray-800 rounded-bl-none flex items-center gap-2`}>
                            <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                            <span className="text-xs opacity-50">Bob is thinking...</span>
                        </div>
                    </div>
                )}
                </div>

                {/* Suggested Prompts (Chips) */}
                {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                    <div className={`px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                        <button onClick={() => { setInput("Can you explain why the correct answer is correct?"); }} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors">
                            <Lightbulb className="w-3 h-3" /> Explain Logic
                        </button>
                         <button onClick={() => { setInput("Why are the other options wrong?"); }} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors">
                            <X className="w-3 h-3" /> Why others wrong?
                        </button>
                        <button onClick={() => { setInput("Give me a similar example."); }} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors">
                            <Code2 className="w-3 h-3" /> Give Example
                        </button>
                    </div>
                )}

                {/* Input */}
                <div className={`p-4 border-t ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                <form 
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={question ? "Ask Bob about this question..." : "Ask Bob a question..."}
                    className={`flex-1 bg-transparent border-none focus:ring-0 active:outline-none focus:outline-none text-sm px-2 ${
                        isDark ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"
                    }`}
                    disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                    >
                    <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                </form>
                </div>

            </motion.div>
            </>
        )}
        </AnimatePresence>
    </>
  );
}
