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
    const isLight = theme === 'light';
    const isNeo = theme === 'neo';

    return (
        <div className={`w-80 border-r flex flex-col transition-colors duration-500 ${
            isLight ? "bg-white border-gray-200 text-gray-900" : 
            isNeo ? "bg-[#050212]/90 border-fuchsia-500/20 text-cyan-50" : 
            "bg-[#050505] border-white/5 text-white"
        }`}>
            <div className={`p-6 border-b flex items-center justify-between ${
                isLight ? 'border-gray-200' : 'border-white/5'
            }`}>
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    <h2 className={`text-sm font-black uppercase tracking-widest ${
                        isLight ? 'text-gray-800' : 'text-white'
                    }`}>Challenges</h2>
                </div>
                {activeChallenge && (
                    <button
                        onClick={() => onSelectChallenge(null)}
                        className={`p-1.5 rounded-lg transition-colors ${
                            isLight ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/5 text-gray-400'
                        }`}
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
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                                        isLight
                                            ? "bg-gray-50 border-gray-200 hover:border-indigo-500 hover:bg-gray-100/50"
                                            : isNeo
                                                ? "bg-fuchsia-500/5 border-fuchsia-500/10 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10"
                                                : "bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                                            c.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500" :
                                            c.difficulty === "Medium" ? "bg-blue-500/10 text-blue-500" :
                                            "bg-red-500/10 text-red-500"
                                        }`}>
                                            {c.difficulty}
                                        </span>
                                        <ChevronRight size={14} className={`transition-colors ${
                                            isLight ? 'text-gray-400 group-hover:text-indigo-600' : 'text-gray-600 group-hover:text-indigo-400'
                                        }`} />
                                    </div>
                                    <h3 className={`text-xs font-bold mb-1 ${
                                        isLight ? 'text-gray-800' : 'text-white'
                                    }`}>{c.title}</h3>
                                    <p className={`text-[10px] line-clamp-2 leading-relaxed ${
                                        isLight ? 'text-gray-500' : 'text-gray-400'
                                    }`}>{c.description}</p>
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
                                <h3 className={`text-lg font-black mb-2 ${
                                    isLight ? 'text-gray-800' : isNeo ? 'text-cyan-400' : 'text-white'
                                }`}>{activeChallenge.title}</h3>
                                <p className={`text-xs leading-relaxed ${
                                    isLight ? 'text-gray-600' : 'text-gray-400'
                                }`}>{activeChallenge.description}</p>
                            </div>

                            {activeChallenge.metrics && (
                                <div className="space-y-4">
                                    <div className={`flex items-center gap-2 ${
                                        isLight ? 'text-indigo-600' : isNeo ? 'text-cyan-400' : 'text-indigo-400'
                                    }`}>
                                        <Zap size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Expected Scale</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Users", val: activeChallenge.metrics.users },
                                            { label: "Writes/Day", val: activeChallenge.metrics.writesPerDay },
                                            { label: "Reads/Day", val: activeChallenge.metrics.readsPerDay },
                                            { label: "Target Latency", val: activeChallenge.metrics.latency },
                                            { label: "Storage", val: activeChallenge.metrics.storage, colSpan: true }
                                        ].map((metric, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                                                    metric.colSpan ? 'col-span-2' : ''
                                                } ${
                                                    isLight ? 'bg-gray-50 border-gray-100' :
                                                    isNeo ? 'bg-fuchsia-500/5 border-fuchsia-500/10' :
                                                    'bg-white/5 border-white/5'
                                                }`}
                                            >
                                                <span className="text-[8px] font-black uppercase tracking-wider text-gray-500">{metric.label}</span>
                                                <span className={`text-[11px] font-black mt-1 ${
                                                    isLight ? 'text-gray-800' : isNeo ? 'text-cyan-300' : 'text-white'
                                                }`}>{metric.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className={`flex items-center gap-2 ${
                                    isLight ? 'text-indigo-600' : isNeo ? 'text-cyan-400' : 'text-indigo-400'
                                }`}>
                                    <Target size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Objectives</span>
                                </div>
                                <div className="space-y-2">
                                    {activeChallenge.objectives.map((obj, i) => (
                                        <div key={i} className={`flex gap-3 text-[11px] p-3 rounded-xl border ${
                                            isLight ? 'text-gray-700 bg-gray-50 border-gray-100' :
                                            isNeo ? 'text-cyan-100 bg-fuchsia-500/5 border-fuchsia-500/10' :
                                            'text-gray-300 bg-white/5 border-white/5'
                                        }`}>
                                            <span className={`font-bold ${
                                                isLight ? 'text-indigo-600' : isNeo ? 'text-cyan-400' : 'text-indigo-400'
                                            }`}>{i + 1}.</span>
                                            {obj}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={`flex items-center gap-2 ${
                                    isLight ? 'text-emerald-600' : isNeo ? 'text-emerald-400' : 'text-emerald-400'
                                }`}>
                                    <Shield size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Constraints</span>
                                </div>
                                <ul className="space-y-2">
                                    {activeChallenge.constraints.map((con, i) => (
                                        <li key={i} className={`flex gap-3 text-[11px] pl-1 ${
                                            isLight ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                            <Zap size={10} className={`mt-1 shrink-0 ${
                                                isLight ? 'text-emerald-600/70' : 'text-emerald-400/50'
                                            }`} />
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
