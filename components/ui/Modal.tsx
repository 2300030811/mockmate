
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { RemoveScroll } from "react-remove-scroll";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const descriptionString = typeof description === 'string' ? description : undefined;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <RemoveScroll>
          <FocusTrap focusTrapOptions={{ initialFocus: false, fallbackFocus: '.modal-content-area' }}>
            <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby={descriptionString ? "modal-description" : undefined}>
              <div className="min-h-screen py-24 flex items-start justify-center w-full">
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={onClose}
                  aria-hidden="true"
                />
                <m.div
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className={cn(
                    "modal-content-area relative z-[10000] w-full",
                    maxWidth || "max-w-md",
                    "rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden",
                    "bg-white text-zinc-900 border border-zinc-200 backdrop-blur-xl",
                    "dark:bg-[#12121a] dark:border-[#1e1e2a] dark:text-[#ebebef]",
                    className
                  )}
                  tabIndex={-1}
                >
                  {/* Description for aria-describedby */}
                  {descriptionString && <span id="modal-description" className="sr-only">{descriptionString}</span>}

                  {/* Header section - Fixed */}
                  {(title || description || icon) && (
                    <div className="flex items-start justify-between mb-4 flex-none gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
                        <div className="min-w-0 flex-1">
                          {title && (
                            <h3 id="modal-title" className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-zinc-900 dark:text-[#ebebef]">
                              {title}
                            </h3>
                          )}
                          {description && (
                            <div className="mt-1 text-xs text-zinc-500 dark:text-[#8b8b9e] leading-relaxed">
                              {description}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-[#ebebef] hover:bg-zinc-100 dark:hover:bg-[#1c1c28] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Scrollable Content section */}
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                    <div className="py-1">{children}</div>
                  </div>

                  {/* Footer section - Fixed (if used) */}
                  {footer && (
                    <div className="mt-5 flex items-center justify-end gap-2.5 flex-none border-t border-zinc-200/80 dark:border-[#1e1e2a] pt-4">
                      {footer}
                    </div>
                  )}
                </m.div>
              </div>
            </div>
          </FocusTrap>
        </RemoveScroll>
      )}
    </AnimatePresence>,
    document.body
  );
};

