import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { CheckCircle, Compass, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RoleSuggestionsSectionProps } from "../types";

export const RoleSuggestionsSection = React.memo(({ suggestedRoles }: RoleSuggestionsSectionProps) => {
  const [expandedRole, setExpandedRole] = React.useState<number | null>(0);

  const getMatchColor = (pct: number) => {
    if (pct >= 80) return { ring: "text-green-500", bg: "bg-green-500", label: "text-green-600 dark:text-green-400", bgLight: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" };
    if (pct >= 60) return { ring: "text-yellow-500", bg: "bg-yellow-500", label: "text-yellow-600 dark:text-yellow-400", bgLight: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20" };
    return { ring: "text-red-500", bg: "bg-red-500", label: "text-red-600 dark:text-red-400", bgLight: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Compass className="text-indigo-600 dark:text-indigo-400" size={20} />
        <span className="hidden sm:inline">Role Suggestions</span>
        <span className="sm:hidden">Roles</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10 ml-auto">
          {suggestedRoles.length} Roles
        </span>
      </h2>

      <div className="space-y-3">
        {suggestedRoles.map((role, idx) => {
          const colors = getMatchColor(role.matchPercentage);
          const isExpanded = expandedRole === idx;
          return (
            <m.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card
                className={`p-4 sm:p-5 bg-white dark:bg-white/5 border transition-all cursor-pointer hover:shadow-md ${
                  isExpanded ? "border-indigo-300 dark:border-indigo-500/30 shadow-md" : "border-gray-200 dark:border-white/10"
                }`}
                onClick={() => setExpandedRole(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-4">
                  {/* Match Percentage Circle */}
                  <div className="relative flex-shrink-0 w-14 h-14">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-200 dark:text-white/10" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4"
                        className={colors.ring}
                        strokeDasharray={`${(role.matchPercentage / 100) * 150.8} 150.8`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${colors.label}`}>
                      {role.matchPercentage}%
                    </span>
                  </div>

                  {/* Role Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{role.role}</h3>
                    {role.reasoning && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{role.reasoning}</p>
                    )}
                  </div>

                  {/* Expand Toggle */}
                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                        {/* Matching Skills */}
                        {role.keyMatchingSkills.length > 0 && (
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 flex items-center gap-1 mb-2">
                              <CheckCircle size={10} /> Matching Skills
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {role.keyMatchingSkills.map((skill, sIdx) => (
                                <span key={sIdx} className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-1">
                                  <CheckCircle size={10} /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing Skills */}
                        {role.missingSkills.length > 0 && (
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-2">
                              <XCircle size={10} /> Skills to Learn
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {role.missingSkills.map((skill, sIdx) => (
                                <span key={sIdx} className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-semibold flex items-center gap-1">
                                  <XCircle size={10} /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary bar */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 pt-1">
                          <span className="text-green-600 dark:text-green-400">{role.keyMatchingSkills.length} matched</span>
                          <span>&bull;</span>
                          <span className="text-orange-600 dark:text-orange-400">{role.missingSkills.length} to learn</span>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </Card>
            </m.div>
          );
        })}
      </div>
    </div>
  );
});

RoleSuggestionsSection.displayName = "RoleSuggestionsSection";
