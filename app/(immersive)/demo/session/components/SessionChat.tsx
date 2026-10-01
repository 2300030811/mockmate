import { useRef, useEffect, memo } from "react";
import dynamic from "next/dynamic";
import { Mic, Send, X } from "lucide-react";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

// Memoized individual message — prevents re-parsing Markdown for unchanged messages
const ChatMessage = memo(function ChatMessage({ role, content }: { role: string; content: string }) {
    return (
        <div className={`flex w-full ${role === "assistant" ? "justify-start" : "justify-end"}`}>
            <div
                className={`
                    max-w-[88%] md:max-w-[80%] p-4 sm:p-5 rounded-xl shadow-subtle
                    ${role === "assistant"
                        ? "bg-white dark:bg-[#14141e] text-zinc-900 dark:text-[#ebebef] rounded-tl-sm border border-zinc-200 dark:border-[#1e1e2a]"
                        : "bg-[#5e6ad2] text-white rounded-tr-sm"}
                    animate-fadeIn
                `}
            >
                <div className={`prose prose-sm max-w-none ${role === "assistant" ? "dark:prose-invert text-zinc-800 dark:text-[#ebebef]" : "text-white prose-p:text-white"}`}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
});

interface SessionChatProps {
    messages: { role: string; content: string }[];
    isProcessing: boolean;
    mobileTab: 'chat' | 'code';
    transcript: string;
    setTranscript: (val: string) => void;
    finalTranscript: string;
    setFinalTranscript: (val: string) => void;
    isListening: boolean;
    isUserActive: boolean;
    isAISpeaking: boolean;
    startListening: () => void;
    stopListening: () => void;
    handleSubmit: (textOverride?: string) => void;
}

export const SessionChat = memo(function SessionChat({
    messages,
    isProcessing,
    mobileTab,
    transcript,
    setTranscript,
    finalTranscript,
    setFinalTranscript,
    isListening,
    isUserActive,
    isAISpeaking,
    startListening,
    stopListening,
    handleSubmit
}: SessionChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isProcessing]);

    return (
        <div className={`flex-1 flex flex-col bg-zinc-50 dark:bg-[#0d0d12] overflow-hidden relative border-r border-zinc-200 dark:border-[#1e1e2a] min-h-0 ${mobileTab === 'code' ? 'hidden md:flex' : 'flex'}`}>
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar min-h-0">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                <div className="w-12 h-12 bg-zinc-200/50 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-xl mb-3 animate-pulse" />
                <p className="text-xs font-mono">Initializing AI Interviewer...</p>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.content.startsWith("[System Notification")) {
                const isExecution = msg.content.includes("executed") || msg.content.includes("validated");
                return (
                  <div key={i} className="flex justify-center my-2 w-full animate-fadeIn">
                    <span className="text-[10px] text-zinc-500 dark:text-[#8b8b9e] font-mono bg-white dark:bg-[#14141e] px-3 py-1 rounded-full border border-zinc-200 dark:border-[#1e1e2a] flex items-center gap-1.5 shadow-subtle">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isExecution ? "⚡ Code output sent to interviewer" : "⚡ Code changes synced"}
                    </span>
                  </div>
                );
              }
              return <ChatMessage key={i} role={msg.role} content={msg.content} />;
            })}

            {isProcessing && (
              <div className="flex w-full justify-start">
                <div className="bg-white dark:bg-[#14141e] p-3 rounded-xl rounded-tl-sm border border-zinc-200 dark:border-[#1e1e2a] flex items-center gap-2 shadow-subtle">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5e6ad2] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#5e6ad2] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#5e6ad2] rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8b8b9e]">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Firmly Docked Chat Input Bar (Scoped to Chat Pane Only) */}
          <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] shrink-0">
            <div className={`
              border rounded-xl p-1.5 flex items-center gap-2 transition-all duration-200 bg-zinc-50 dark:bg-[#0d0d12]
              ${isUserActive && !isAISpeaking ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-zinc-200 dark:border-[#1e1e2a]"}
            `}>
              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={transcript || finalTranscript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={isListening ? (isUserActive ? "Detecting voice..." : "Listening...") : "Type your answer or speak aloud..."}
                  aria-label="Type your answer"
                  className="w-full bg-transparent text-zinc-900 dark:text-[#ebebef] rounded-lg px-3 py-2 pr-8 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-xs sm:text-sm font-medium"
                  disabled={isProcessing}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {(transcript || finalTranscript) && (
                  <button
                    onClick={() => {
                      setTranscript("");
                      setFinalTranscript("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    aria-label="Clear input"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mic Toggle Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isAISpeaking}
                aria-label={isListening ? "Stop listening" : "Start listening"}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 shrink-0
                  ${
                    isListening
                      ? (isUserActive ? "bg-emerald-600 shadow-sm text-white" : "bg-rose-500 shadow-sm text-white")
                      : "bg-white dark:bg-[#181824] text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-[#1e1e2a]"
                  }
                  ${isProcessing || isAISpeaking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {isListening ? (
                  <div className={`w-3 h-3 rounded-sm transition-all ${isUserActive ? "bg-white scale-110 animate-pulse" : "bg-white"}`} />
                ) : (
                  <Mic size={16} />
                )}
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSubmit()}
                disabled={(!transcript && !finalTranscript) || isProcessing}
                aria-label="Send answer"
                className={`
                  w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 shrink-0
                  ${
                    (transcript || finalTranscript) && !isProcessing
                      ? "bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-subtle active:scale-95"
                      : "bg-zinc-100 dark:bg-[#181824] text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed"
                  }
                `}
              >
                <Send size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-zinc-400 dark:text-zinc-500 font-mono mt-2 px-1">
              <span>Press Enter to submit</span>
              <span>{isListening ? "● Listening active" : "Microphone ready"}</span>
            </div>
          </div>
        </div>
    );
});

