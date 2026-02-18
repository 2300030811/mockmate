import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface SessionChatProps {
    messages: { role: string; content: string }[];
    isProcessing: boolean;
    mobileTab: 'chat' | 'code';
}

export function SessionChat({ messages, isProcessing, mobileTab }: SessionChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isProcessing]);

    return (
        <div className={`flex-1 flex-col bg-gray-900/30 overflow-hidden relative border-r border-gray-800 ${mobileTab === 'code' ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-32">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <div className="w-24 h-24 bg-gray-800 rounded-full mb-4 animate-pulse"></div>
                <p>Initializing AI Interviewer...</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`
                            max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-xl backdrop-blur-sm
                            ${
                              msg.role === "assistant"
                                ? "bg-gray-800/80 text-gray-100 rounded-tl-sm border border-gray-700/50"
                                : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                            }
                            animate-fadeIn
                        `}
                >
                  <div className={`prose prose-sm max-w-none ${msg.role === "assistant" ? "prose-invert" : "text-white prose-p:text-white"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex w-full justify-start">
                <div className="bg-gray-800/50 p-4 rounded-2xl rounded-tl-sm border border-gray-700/50 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
    );
}
