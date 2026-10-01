import { User, Bot, AlertCircle, RefreshCw } from "lucide-react";
import { Message } from "ai";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import React from "react";

interface BobMessagesProps {
  messages: Message[];
  isLoading: boolean;
  error?: Error | null;
  onReload?: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export function BobMessages({ messages, isLoading, error, onReload, scrollRef }: BobMessagesProps) {
  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Bob Assistant Chat Log"
      className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/40 dark:bg-[#0d0d12]"
    >
      {messages.map((msg: Message) => (
        <div
          key={msg.id}
          className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#5e6ad2] dark:text-[#7f8cf8]">
              <Bot className="w-3.5 h-3.5" />
            </div>
          )}
          <div className={`rounded-xl p-3 max-w-[85%] text-xs sm:text-[13px] leading-relaxed shadow-subtle ${
            msg.role === "user"
              ? "bg-[#5e6ad2] text-white rounded-tr-none font-normal"
              : "bg-white dark:bg-[#14141e] text-zinc-800 dark:text-[#ebebef] rounded-tl-none border border-zinc-200 dark:border-[#1e1e2a]"
          }`}>
            <MemoizedMarkdown content={msg.content} />
          </div>
          {msg.role === "user" && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-zinc-100 dark:bg-[#1e1e2a] border border-zinc-200 dark:border-[#2a2a3a] text-zinc-600 dark:text-zinc-300">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-2.5 justify-start items-center">
          <div className="w-7 h-7 rounded-lg bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 flex items-center justify-center shrink-0 text-[#5e6ad2] dark:text-[#7f8cf8]">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="rounded-xl px-3 py-2 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-tl-none flex items-center gap-1.5 shadow-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* Error Recovery UI */}
      {error && (
        <div className="flex justify-start gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 rounded-2xl text-xs space-y-2 text-rose-600 dark:text-rose-400 max-w-[85%]">
            <p className="font-semibold">Bob encountered a connection error.</p>
            {onReload && (
              <button
                onClick={onReload}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-500 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3 h-3" /> Retry Message
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

