"use client";

import { m } from "framer-motion";
import { Map, ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { memo } from "react";
import { CareerPath } from "@/types/dashboard";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CareerPathsProps {
  paths: CareerPath[];
}

export const CareerPaths = memo(function CareerPaths({ paths }: CareerPathsProps) {
  const prefersReduced = useReducedMotion();

  return (
    <m.div 
      initial={prefersReduced ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.2 }}
      className="rounded-xl border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-5 sm:p-6 shadow-subtle transition-colors"
    >
       <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#1e1e2a] pb-2 mb-4">
         <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
           <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-[#8b8b9e]">
             Career Roadmaps
           </h2>
         </div>
         <NextLink href="/career-path" className="text-[11px] font-mono font-medium text-[#5e6ad2] hover:text-[#4f59b8] flex items-center gap-1">
           Create <ArrowRight size={11} />
         </NextLink>
       </div>
       <div className="space-y-2.5">
          {paths?.length > 0 ? (
             paths.map((path) => (
                <NextLink href="/career-path" key={path.id} className="block group">
                   <div className="p-3 bg-zinc-50/60 dark:bg-[#101018] hover:border-zinc-300 dark:hover:border-[#28283c] border border-zinc-200/80 dark:border-[#1a1a26] rounded-lg transition-colors">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-[#ebebef] group-hover:text-[#5e6ad2] transition-colors truncate">{path.job_role}</p>
                      <p className="text-[10px] font-mono text-zinc-400 dark:text-[#5a5a6e] truncate mt-0.5">{path.company || "General Roadmap"}</p>
                   </div>
                </NextLink>
             ))
          ) : (
             <div className="border border-dashed border-zinc-200 dark:border-[#1e1e2a] p-4 rounded-lg text-center text-zinc-400 dark:text-[#5a5a6e]">
               <p className="text-xs font-mono">No roadmaps generated yet.</p>
             </div>
          )}
       </div>
    </m.div>
  );
});
