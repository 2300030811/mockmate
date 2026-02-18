"use client";

import { User, Loader2 } from "lucide-react";
import { Message } from "ai";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import React from 'react';

interface BobMessagesProps {
  messages: Message[];
  isDark: boolean;
  isLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export function BobMessages({ messages, isDark, isLoading, scrollRef }: BobMessagesProps) {
  return (
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
              <span className="text-sm">🦁</span>
            </div>
          )}
          <div className={`rounded-2xl p-3 max-w-[85%] text-sm leading-relaxed shadow-sm ${
            msg.role === "user"
              ? "bg-blue-600 text-white rounded-br-none"
              : isDark 
                ? "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700" 
                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
          }`}>
            <MemoizedMarkdown content={msg.content} isDark={isDark} />
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
            <span className="text-sm">🦁</span>
          </div>
          <div className={`rounded-2xl p-4 bg-gray-200 dark:bg-gray-800 rounded-bl-none flex items-center gap-2`}>
            <Loader2 className="w-4 h-4 animate-spin opacity-50" />
            <span className="text-xs opacity-50">Bob is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
