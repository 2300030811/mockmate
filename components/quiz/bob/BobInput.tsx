"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BobInputProps {
  input: string;
  isDark: boolean;
  isLoading: boolean;
  placeholder: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function BobInput({ input, isDark, isLoading, placeholder, onInputChange, onSubmit }: BobInputProps) {
  return (
    <div className={`p-4 border-t ${
      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <form 
        onSubmit={onSubmit}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={onInputChange}
          placeholder={placeholder}
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
  );
}
