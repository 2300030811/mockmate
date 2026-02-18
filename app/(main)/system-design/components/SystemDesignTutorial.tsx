"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  MousePointer2, 
  Zap, 
  Layout, 
  Info,
  Layers,
  Hand
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Step {
  title: string;
  description: string;
  icon: any;
  highlightId?: string;
  targetId?: string; // Specific ID for the pointer
}

const STEPS: Step[] = [
  {
    title: "Welcome to Architect Pro",
    description: "Your advanced workspace for high-level system modeling. Master the art of cloud design with precision tools and AI-driven insights. Key Shortcut: Press '?' anytime for a quick command reference.",
    icon: Sparkles,
  },
  {
    title: "Construction Toolkit",
    description: "Access industry-standard components here. Drag nodes to build your cluster. Pro Tip: Hold 'Shift' while dragging a group to keep its children locked in place.",
    icon: Layout,
    highlightId: "sd-toolbar",
    targetId: "sd-toolbar",
  },
  {
    title: "Fluid Workspace",
    description: "Navigate massive architectures without friction. Use 'Space + Drag' to glide through your canvas. Pro Tip: Triple-click the background to instantly auto-align all floating nodes.",
    icon: Hand,
    highlightId: "sd-canvas",
    targetId: "sd-canvas",
  },
  {
    title: "Smart Connections",
    description: "Logic flows start here. Tap 'C' to enter Connect Mode. Click any two nodes to establish a link. Key Shortcut: Double-click a connection to edit its traffic protocol (HTTPS, TCP, etc).",
    icon: MousePointer2,
    highlightId: "sd-toolbar",
    targetId: "sd-toolbar-connect",
  },
  {
    title: "AI Architectural Audit",
    description: "Deploy with confidence. The Audit engine scans for single-point failures and security leaks. Pro Tip: Run an audit after every major structural change for real-time compliance checks.",
    icon: Zap,
    highlightId: "sd-header",
    targetId: "sd-header-audit",
  },
  {
    title: "Global Export",
    description: "Your architecture, ready for documentation. Export pixel-perfect SVGs for RFCs. Pro Tip: Use the 'Copy JSON' feature to share live designs with teammates instantly.",
    icon: Layers,
    highlightId: "sd-header",
    targetId: "sd-header-export",
  }
];

interface SystemDesignTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemDesignTutorial({ isOpen, onClose }: SystemDesignTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [pointerPos, setPointerPos] = useState({ top: 0, left: 0, opacity: 0, anchor: 'right' as 'right' | 'left' | 'top' | 'bottom' });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const updatePointer = useCallback(() => {
    if (!isOpen) return;
    const targetId = STEPS[currentStep].targetId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        let top = rect.top + rect.height / 2;
        let left = rect.left + rect.width / 2;
        let anchor: 'right' | 'left' | 'top' | 'bottom' = 'right';

        if (targetId.includes('toolbar')) {
          left = rect.right + 12;
          anchor = 'left';
        } else if (targetId.includes('header')) {
          top = rect.bottom + 12;
          anchor = 'top';
        } else if (targetId.includes('canvas')) {
          top = window.innerHeight / 2 - 100;
          left = window.innerWidth / 2;
          anchor = 'bottom';
        }

        setPointerPos({ top, left, opacity: 1, anchor });
      }
    } else {
      setPointerPos(prev => ({ ...prev, opacity: 0 }));
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    updatePointer();
    window.addEventListener('resize', updatePointer);
    return () => window.removeEventListener('resize', updatePointer);
  }, [updatePointer]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handleBack();
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finish = () => {
    localStorage.setItem("mockmate-sd-onboarded", "true");
    onClose();
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {/* Layer 1: Backdrop (Below Highlight) */}
      <div className="fixed inset-0 z-[1000] pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-[2px] pointer-events-auto"
          onClick={finish}
        />
      </div>

      {/* Layer 2: Pointer and Card (Above Highlight) */}
      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 pointer-events-none">
        
        {/* Dynamic Visual Beam / Pulse */}
        <motion.div
           animate={{ 
             top: pointerPos.top, 
             left: pointerPos.left, 
             opacity: pointerPos.opacity,
           }}
           className="fixed z-[1210] pointer-events-none"
           style={{ transform: 'translate(-50%, -50%)' }}
        >
           {/* The Core Dot */}
           <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-40" />
              <div className="absolute inset-1.5 bg-indigo-400 rounded-full shadow-[0_0_20px_#6366f1,0_0_40px_#6366f1]" />
              
              {/* Directional Beams */}
              <motion.div 
                 animate={{ opacity: [0.2, 0.5, 0.2] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className={`absolute bg-gradient-to-t from-indigo-500/0 to-indigo-500/50 blur-sm
                   ${pointerPos.anchor === 'top' ? 'w-0.5 h-12 bottom-full left-1/2 -translate-x-1/2' : ''}
                   ${pointerPos.anchor === 'bottom' ? 'w-0.5 h-12 top-full left-1/2 -translate-x-1/2' : ''}
                   ${pointerPos.anchor === 'left' ? 'h-0.5 w-12 right-full top-1/2 -translate-y-1/2' : ''}
                   ${pointerPos.anchor === 'right' ? 'h-0.5 w-12 left-full top-1/2 -translate-y-1/2' : ''}
                 `}
              />
           </div>
        </motion.div>

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-lg bg-gray-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto"
        >
          {/* Top Info Bar */}
          <div className="h-1.5 w-full flex gap-1 px-1 pt-1 opacity-60">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 h-full rounded-full transition-all duration-700 ${i <= currentStep ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} 
              />
            ))}
          </div>

          <div className="p-8 pt-10">
            <div className="flex justify-between items-start mb-6">
              <motion.div 
                key={currentStep}
                initial={{ rotate: -20, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                className="p-3.5 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl border border-indigo-400/30 shadow-inner"
              >
                <Icon className="w-8 h-8 text-indigo-300" />
              </motion.div>
              <button 
                onClick={finish}
                className="group flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-full text-xs font-bold text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/5"
              >
                <span>Skip System Guide</span>
                <X size={16} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="space-y-4 mb-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                      Module {currentStep + 1}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{step.highlightId ? 'Targeted Field' : 'Orientation'}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white leading-tight tracking-tighter mb-4 selection:bg-indigo-500/40">
                    {step.title}
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed font-medium">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] transition-all ${currentStep === 0 ? 'opacity-0' : 'text-gray-500 hover:text-white'}`}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              
              <button
                onClick={handleNext}
                className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:shadow-indigo-500/50 transition-all flex items-center gap-3 active:scale-95"
              >
                {currentStep === STEPS.length - 1 ? "Start Designing" : "Continue"}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white/[0.02] px-8 py-5 border-t border-white/5 flex gap-4 items-center">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 border border-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em]">
                Quick Nav: Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 mx-1 border border-white/5 shadow-sm">←</kbd> and <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 mx-1 border border-white/5 shadow-sm">→</kbd> to cycle
             </p>
          </div>
        </motion.div>
      </div>

      {/* Global CSS for high-fidelity interactive feedback */}
      <style jsx global>{`
        ${step.highlightId ? `
          #${step.highlightId} {
            position: relative;
            z-index: 1100 !important;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.4) !important;
            border: 2px solid #6366f1 !important;
            pointer-events: none;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            filter: brightness(1.4) saturate(1.2) contrast(1.1);
          }
        ` : ''}
      `}</style>
    </AnimatePresence>
  );
}
