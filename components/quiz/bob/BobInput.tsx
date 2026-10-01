"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BobInputProps {
  input: string;
  isLoading: boolean;
  placeholder: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function BobInput({ input, isLoading, placeholder, onInputChange, onSubmit }: BobInputProps) {
  return (
    <div className="p-3 border-t bg-zinc-50/80 dark:bg-[#101018] border-zinc-200 dark:border-[#1e1e2a]">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] focus-within:border-[#5e6ad2] dark:focus-within:border-[#5e6ad2] rounded-xl px-3 py-1.5 transition-colors shadow-subtle"
      >
        <input
          value={input}
          onChange={onInputChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none focus:ring-0 active:outline-none focus:outline-none text-xs sm:text-[13px] text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-[#5a5a6e]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-7 h-7 rounded-lg bg-[#5e6ad2] hover:bg-[#4f59b8] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Send Message"
          aria-label="Send Message"
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </form>
    </div>
  );
}

