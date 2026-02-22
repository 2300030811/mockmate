"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { submitFeedback } from "@/app/actions/feedback";
import { getSessionId } from "@/utils/session";
import { useAuth } from "./providers/auth-provider";
import { toast } from "sonner";
import { MessageSquare, Bug, Lightbulb, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export function FeedbackModal({ isOpen, onClose, isDark = true }: FeedbackModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<"bug" | "suggestion" | "other">("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.length < 5) {
      toast.error("Please provide a more detailed message (min 5 characters)");
      return;
    }

    setIsSubmitting(true);
    const result = await submitFeedback({
      type,
      message,
      email: email || undefined,
      sessionId: getSessionId(),
      userId: user?.id || null,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
        onClose();
      }, 2000);
    } else {
      toast.error(result.error || "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Feedback"
      description="Help us improve MockMate by sharing your thoughts, bug reports, or suggestions."
      isDark={isDark}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="flex flex-col items-center justify-center py-12 space-y-5"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <motion.svg
                  className="w-10 h-10 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M5 13l4 4L19 7" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  />
                </motion.svg>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Feedback Received!</h3>
                <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Thank you for helping us improve MockMate.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Type Selection */}
        <div className="space-y-2">
          <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
            Select Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "suggestion", label: "Idea", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
              { id: "bug", label: "Bug", icon: Bug, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
              { id: "other", label: "Other", icon: HelpCircle, color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id as any)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  type === item.id
                    ? isDark ? `${item.bg} border-${item.color.split('-')[1]}-400/50 shadow-lg shadow-${item.color.split('-')[1]}-400/10` : "bg-white border-blue-500 shadow-md"
                    : isDark ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-gray-50 border-gray-100 hover:border-gray-200"
                }`}
              >
                {type === item.id && (
                  <motion.div 
                    layoutId="activeType"
                    className={`absolute inset-0 ${item.bg} opacity-20`}
                  />
                )}
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${type === item.id ? item.color : "opacity-40"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${type === item.id ? (isDark ? 'text-white' : 'text-blue-600') : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
              Your message
            </label>
            <span className={`text-[10px] font-medium ${message.length < 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {message.length} characters
            </span>
          </div>
          <div className="relative group">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind... (min 5 characters)"
              className={`w-full h-32 p-4 rounded-2xl border-2 outline-none transition-all resize-none text-sm leading-relaxed focus-visible:ring-4 focus-visible:ring-emerald-500/20 ${
                isDark 
                  ? "bg-black/40 border-white/5 focus:border-emerald-500 text-white placeholder:text-white/20" 
                  : "bg-gray-50 border-gray-100 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
              }`}
            />
            <div className={`absolute bottom-3 right-3 transition-opacity duration-300 ${message.length >= 5 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Email Input (Optional) */}
        {!user && (
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
              Email for follow-up (optional)
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className={`w-full p-3.5 pl-4 rounded-xl border-2 outline-none transition-all text-sm focus-visible:ring-4 focus-visible:ring-sky-500/20 ${
                  isDark 
                    ? "bg-black/40 border-white/5 focus:border-sky-500 text-white placeholder:text-white/20" 
                    : "bg-gray-50 border-gray-100 focus:border-sky-500 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>
        )}

        {/* Form Footer */}
        <div className="flex gap-3 pt-2">
          <Button 
            type="submit" 
            variant="glass" 
            disabled={isSubmitting || message.length < 5}
            className={`w-full gap-2 h-12 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] ${
              message.length >= 5 
                ? "bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border-emerald-500/20 text-emerald-400 hover:scale-[1.02]" 
                : "opacity-50 grayscale"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Modal>
  );
}
