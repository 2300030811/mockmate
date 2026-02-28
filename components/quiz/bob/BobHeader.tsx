"use client";

import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BobHeaderProps {
  onClose: () => void;
  onClear: () => void;
}

export function BobHeader({ onClose, onClear }: BobHeaderProps) {
  return (
    <div
      className="p-4 flex items-center justify-between border-b cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-blue-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-3">
        <div className="bg-orange-500 p-2 rounded-full shadow-lg text-white flex items-center justify-center w-10 h-10">
          <span className="text-lg">🦁</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bob the Assistant</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Here to help you pass!</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onClear}
          className="rounded-full hover:bg-red-100 text-red-500"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

