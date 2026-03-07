import { memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Target, Shield, Zap, X, Trophy, ChevronRight } from "lucide-react";
import { CHALLENGES, Challenge } from "../challenges";

interface ChallengePanelProps {
    activeChallengeId: string | null;
    onSelectChallenge: (id: string | null) => void;
    theme: "dark" | "light" | "neo";
}

export const ChallengePanel = memo(({ activeChallengeId, onSelectChallenge, theme }: ChallengePanelProps) => {
    const activeChallenge = CHALLENGES.find(c => c.id === activeChallengeId);

    return (
        <div className={`w-80 border-r flex flex-col transition-colors duration-500 ${theme === "light" ? "bg-white border-gray-200" : "bg-[#050505] border-white/5"
            }`}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Challenges</h2>
                </div>
                {activeChallenge && (
                    <button
                        onClick={() => onSelectChallenge(null)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <AnimatePresence mode="wait">
                    {!activeChallenge ? (
                        <m.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {CHALLENGES.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => onSelectChallenge(c.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${theme === "light"
                                            ? "bg-gray-50 border-gray-200 hover:border-indigo-500"
                                            : "bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${c.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500" :
                                                c.difficulty === "Medium" ? "bg-blue-500/10 text-blue-500" :
                                                    "bg-red-500/10 text-red-500"
                                            }`}>
                                            {c.difficulty}
                                        </span>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <h3 className="text-xs font-bold text-white mb-1">{c.title}</h3>
                                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{c.description}</p>
                                </button>
                            ))}
                        </m.div>
                    ) : (
                        <m.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-lg font-black text-white mb-2">{activeChallenge.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{activeChallenge.description}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Target size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Objectives</span>
                                </div>
                                <div className="space-y-2">
                                    {activeChallenge.objectives.map((obj, i) => (
                                        <div key={i} className="flex gap-3 text-[11px] text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-indigo-500 font-bold">{i + 1}.</span>
                                            {obj}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Shield size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Constraints</span>
                                </div>
                                <ul className="space-y-2">
                                    {activeChallenge.constraints.map((con, i) => (
                                        <li key={i} className="flex gap-3 text-[11px] text-gray-400 pl-1">
                                            <Zap size={10} className="mt-1 shrink-0 text-emerald-500/50" />
                                            {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

ChallengePanel.displayName = "ChallengePanel";
