import { memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ReviewModalProps {
  reviewResult: string | null;
  onClose: () => void;
  theme: "dark" | "light" | "neo";
}

export const ReviewModal = memo(({ reviewResult, onClose, theme }: ReviewModalProps) => {
  return (
    <AnimatePresence>
      {reviewResult && (
         <m.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className={`fixed right-0 top-0 h-full w-full md:w-[600px] border-l z-50 pt-14 md:pt-0 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-colors duration-500 ${theme === "light" ? "bg-white border-gray-200" : "bg-[#0A0A0A] border-white/10"}`}>
             <div className={`h-16 px-8 border-b flex items-center justify-between shrink-0 backdrop-blur-md ${theme === "light" ? "bg-gray-50/80 border-gray-200" : "bg-gray-950/80 border-white/10"}`}>
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_#6366f1]" />
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === "light" ? "text-indigo-600" : "text-indigo-400"}`}>Architectural Intelligence</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Minimize2 size={18} /></button>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-20">
                <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-black ${theme === "light" ? "prose-slate" : "prose-invert"}`}>
                   <ReactMarkdown>{reviewResult}</ReactMarkdown>
                </div>
             </div>
             <div className={`p-8 border-t flex flex-col gap-4 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-950/50 border-white/10"}`}>
                <div className="flex gap-4">
                   <div className="flex-1 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10"><p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Score</p><p className={`text-2xl font-black ${theme === "light" ? "text-gray-900" : "text-white"}`}>84<span className="text-sm opacity-30">/100</span></p></div>
                   <div className="flex-1 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"><p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Status</p><p className={`text-2xl font-black ${theme === "light" ? "text-gray-900" : "text-white"}`}>SECURE</p></div>
                </div>
                <button onClick={onClose} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">Dismiss Analysis</button>
             </div>
         </m.aside>
      )}
    </AnimatePresence>
  );
});

ReviewModal.displayName = "ReviewModal";
