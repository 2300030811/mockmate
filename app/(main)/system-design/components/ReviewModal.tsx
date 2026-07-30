import { memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ReviewModalProps {
   reviewResult: string | null;
   score?: { 
      overall: number; 
      reliability: number; 
      scalability: number; 
      security: number; 
      seniority: string;
      grade?: string;
      issues?: string[];
      checklist?: { name: string; status: "pass" | "fail" }[];
   } | null;
   onClose: () => void;
   theme: "dark" | "light" | "neo";
   onHighlightIssue?: (issue: string) => void;
}

const getGradeColor = (grade: string) => {
   const g = grade.toUpperCase();
   if (g.startsWith('A')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
   if (g.startsWith('B')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
   if (g.startsWith('C')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
   if (g.startsWith('D')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
   return 'bg-red-500/10 text-red-400 border-red-500/20';
};

export const ReviewModal = memo(({ reviewResult, score, onClose, theme, onHighlightIssue }: ReviewModalProps) => {
   const isLight = theme === 'light';
   const isNeo = theme === 'neo';

   const seniorityStyles: Record<string, string> = {
      Junior: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Mid: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Senior: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Staff: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
   };

   const currentSeniorityStyle = score?.seniority ? seniorityStyles[score.seniority as keyof typeof seniorityStyles] || seniorityStyles["Mid"] : seniorityStyles["Mid"];

   return (
      <AnimatePresence>
         {reviewResult && (
            <m.aside 
               initial={{ x: "100%" }} 
               animate={{ x: 0 }} 
               exit={{ x: "100%" }} 
               className={`fixed right-0 top-0 h-full w-full md:w-[600px] border-l z-50 pt-14 md:pt-0 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-colors duration-500 ${
                  isLight ? "bg-white border-gray-200 text-gray-900" : 
                  isNeo ? "bg-[#050212]/95 border-fuchsia-500/20 text-cyan-50" :
                  "bg-[#0A0A0A] border-white/10 text-white"
               }`}
            >
               <div className={`h-16 px-8 border-b flex items-center justify-between shrink-0 backdrop-blur-md ${
                  isLight ? "bg-gray-50/80 border-gray-200" : 
                  isNeo ? "bg-[#050212]/80 border-fuchsia-500/20" :
                  "bg-gray-950/80 border-white/10"
               }`}>
                  <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_#6366f1]" />
                     <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? "text-indigo-600" : "text-indigo-400"}`}>Architectural Intelligence</span>
                  </div>
                  <button onClick={onClose} className={`p-2 rounded-full transition-colors ${
                     isLight ? 'hover:bg-gray-200 text-gray-600' : 'hover:bg-white/5 text-gray-400'
                  }`}><Minimize2 size={18} /></button>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-10 space-y-8">
                  {score?.issues && score.issues.length > 0 && (
                     <div className="space-y-3">
                        <div className="flex items-center justify-between pl-1">
                           <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Structural Alerts</p>
                           <span className="text-[8px] text-gray-500 uppercase font-black tracking-wider">Click to locate node</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {score.issues.map((issue, i) => (
                              <button 
                                 key={i} 
                                 onClick={() => onHighlightIssue?.(issue)}
                                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black shadow-sm text-left transition-all hover:scale-105 active:scale-95 ${
                                    isLight 
                                       ? 'border-red-200 bg-red-50/50 text-red-700 hover:bg-red-100/50' 
                                       : 'border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10'
                                 }`}
                              >
                                 <span className="shrink-0">⚠️</span>
                                 <span className="truncate">{issue}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {score?.checklist && score.checklist.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Simulator Checklist</p>
                        <div className="grid grid-cols-2 gap-2">
                           {score.checklist.map((item, i) => {
                              const isPass = item.status === "pass";
                              return (
                                 <div 
                                    key={i} 
                                    className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold ${
                                       isPass 
                                          ? (isLight ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400')
                                          : (isLight ? 'border-red-200 bg-red-50/50 text-red-700' : 'border-red-500/10 bg-red-500/5 text-red-400')
                                    }`}
                                 >
                                    <span>{item.name}</span>
                                    <span className="text-xs font-black">{isPass ? "✓" : "✗"}</span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}

                  <hr className={isLight ? 'border-gray-200' : 'border-white/5'} />

                  <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-black ${isLight ? "prose-slate" : "prose-invert"}`}>
                     <ReactMarkdown>{reviewResult}</ReactMarkdown>
                  </div>
               </div>

               <div className={`p-8 border-t flex flex-col gap-6 ${isLight ? "bg-gray-50 border-gray-200" : "bg-gray-950/50 border-white/10"}`}>
                  {score && (
                     <div className="grid grid-cols-3 gap-2">
                        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                           isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-indigo-500/5 border-indigo-500/10'
                        }`}>
                           <p className="text-[9px] font-black text-indigo-500 uppercase">Score</p>
                           <p className={`text-xl font-black mt-1 ${isLight ? "text-gray-900" : "text-white"}`}>
                              {score.overall}<span className="text-xs opacity-30">/100</span>
                           </p>
                        </div>
                        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${currentSeniorityStyle}`}>
                           <p className="text-[9px] font-black uppercase opacity-70">Level</p>
                           <p className="text-xl font-black mt-1">{score.seniority?.toUpperCase() || "MID"}</p>
                        </div>
                        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${getGradeColor(score.grade || "B")}`}>
                           <p className="text-[9px] font-black uppercase opacity-75">Grade</p>
                           <p className="text-xl font-black mt-1">{score.grade || "B"}</p>
                        </div>
                     </div>
                  )}

                  {score && (
                     <div className="space-y-3">
                        {[
                           { label: "Reliability", val: score.reliability, color: "bg-blue-500" },
                           { label: "Scalability", val: score.scalability, color: "bg-orange-500" },
                           { label: "Security", val: score.security, color: "bg-emerald-500" },
                        ].map((s) => (
                           <div key={s.label} className="space-y-1">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-50">
                                 <span>{s.label}</span>
                                 <span>{s.val}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                 <m.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${s.val}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full ${s.color}`}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {!score && (
                     <div className="flex gap-4">
                        <div className={`flex-1 p-4 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-indigo-500/5 border-indigo-500/10'}`}><p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Score</p><p className={`text-2xl font-black ${isLight ? "text-gray-900" : "text-white"}`}>--<span className="text-sm opacity-30">/100</span></p></div>
                        <div className={`flex-1 p-4 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-emerald-500/5 border-emerald-500/10'}`}><p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Status</p><p className={`text-2xl font-black ${isLight ? "text-gray-900" : "text-white"}`}>NEUTRAL</p></div>
                     </div>
                  )}

                  <button 
                     onClick={onClose} 
                     className={`w-full py-4 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all ${
                        isLight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 
                        isNeo ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-cyan-50 shadow-fuchsia-500/20' : 
                        'bg-indigo-600 hover:bg-indigo-500 text-white'
                     }`}
                  >
                     Dismiss Analysis
                  </button>
               </div>
            </m.aside>
         )}
      </AnimatePresence>
   );
});

ReviewModal.displayName = "ReviewModal";
