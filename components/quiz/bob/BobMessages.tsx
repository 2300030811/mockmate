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
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50"
    >
      {messages.map((msg: Message) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 mt-1 text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
          )}
          <div className={`rounded-2xl p-3.5 max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === "user"
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700"
            }`}>
            <MemoizedMarkdown content={msg.content} />
          </div>
          {msg.role === "user" && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <User className="w-4 h-4 opacity-80" />
            </div>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-3 justify-start items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div className="rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "300ms" }} />
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

