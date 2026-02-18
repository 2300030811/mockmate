
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  isDark?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  isDark = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto">
          <div className="min-h-screen py-24 flex items-start justify-center w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "relative z-[10000] w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden",
                isDark
                  ? "bg-gray-900/95 border border-white/10 text-white backdrop-blur-xl"
                  : "bg-white/95 text-gray-900 border border-gray-200 backdrop-blur-xl"
              )}
            >
              {/* Header section - Fixed */}
              <div className="flex items-start justify-between mb-4 flex-none">
                {(title || description) && (
                  <div>
                    {title && (
                      <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="mt-1 text-sm opacity-60 leading-relaxed max-w-[90%] font-medium">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-50 hover:opacity-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content section */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <div className="py-1">{children}</div>
              </div>

              {/* Footer section - Fixed (if used) */}
              {footer && (
                <div className="mt-6 flex justify-end gap-3 flex-none border-t border-white/5 pt-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

