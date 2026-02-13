"use client";

import { useState, useEffect } from "react";
import { User, Edit2, Check, X } from "lucide-react";
import { getStoredNickname, setStoredNickname } from "@/utils/session";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export function UserNicknameToggle() {
    const [nickname, setNickname] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState("");

    useEffect(() => {
        setNickname(getStoredNickname());
    }, []);

    const handleSave = () => {
        if (!tempName.trim()) return;
        setStoredNickname(tempName.trim());
        setNickname(tempName.trim());
        setIsEditing(false);
    };

    const startEditing = () => {
        setTempName(nickname || "");
        setIsEditing(true);
    };

    return (
        <div className="relative flex items-center gap-2">
            <AnimatePresence mode="wait">
                {!isEditing ? (
                    <motion.div
                        key="display"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2"
                    >
                        <Button
                            onClick={startEditing}
                            variant="glass"
                            size="sm"
                            className="rounded-full gap-2 px-4 border-blue-500/20"
                        >
                            <User className="w-4 h-4 text-blue-500" />
                            <span className="max-w-[100px] truncate font-bold text-xs uppercase tracking-wider">
                                {nickname || "Guest Player"}
                            </span>
                            <Edit2 className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-blue-500/30 rounded-full p-1"
                    >
                        <input 
                            autoFocus
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            placeholder="Nickname..."
                            className="bg-transparent border-none outline-none text-xs font-bold px-3 py-1 w-32 dark:text-white"
                            maxLength={15}
                        />
                        <button 
                            onClick={handleSave}
                            className="p-1.5 hover:bg-green-500/10 text-green-500 rounded-full transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
