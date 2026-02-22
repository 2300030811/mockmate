import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Sparkles } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial: () => void;
}

export const HelpModal = memo(({ isOpen, onClose, onOpenTutorial }: HelpModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
         <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-gray-950 border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-5 mb-10">
               <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Info size={32} /></div>
               <div><h2 className="text-3xl font-black text-white">System Guide</h2><p className="text-gray-400">Master the architecture modeling workspace.</p></div>
               <button onClick={onClose} className="ml-auto p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-2 gap-10 mb-10">
               <div className="space-y-4">
                  <p className="text-xs font-black uppercase text-indigo-400">Navigation</p>
                  <ul className="space-y-3 text-sm text-gray-400 font-medium">
                     <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Space</kbd> + Drag to Pan</li>
                     <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Ctrl</kbd> + Scroll to Zoom</li>
                     <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">M-Click</kbd> Recenter</li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <p className="text-xs font-black uppercase text-indigo-400">Quick Actions</p>
                  <ul className="space-y-3 text-sm text-gray-400 font-medium">
                     <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Del</kbd> Remove Selection</li>
                     <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Ctrl+Z</kbd> Undo Changes</li>
                     <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Ctrl+P</kbd> Start Tutorial</li>
                  </ul>
               </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-5 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Dismiss</button>
                <button onClick={() => { onClose(); onOpenTutorial(); }} className="flex-1 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                   <Sparkles size={16} /> Tutorial
                </button>
            </div>
         </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

HelpModal.displayName = "HelpModal";
