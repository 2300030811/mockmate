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
      initial={prefersReduced ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReduced ? { duration: 0 } : { delay: 0.3 }}
      className="bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 backdrop-blur-md h-full shadow-lg dark:shadow-none transition-colors duration-300"
    >
       <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
          <Map size={16} /> Latest Roadmaps
       </h2>
       <div className="space-y-3">
          {paths?.length > 0 ? (
             paths.map((path) => (
                <NextLink href="/career-path" key={path.id} className="block group">
                   <div className="p-3 bg-gray-100/80 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all">
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">{path.job_role}</p>
                      <p className="text-[10px] text-gray-500 truncate">{path.company || "General Path"}</p>
                   </div>
                </NextLink>
             ))
          ) : (
             <p className="text-xs text-gray-500 text-center py-4">No roadmaps generated yet.</p>
          )}
          <NextLink href="/career-path" className="block text-center mt-4">
             <span className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                Create New <ArrowRight size={12} />
             </span>
          </NextLink>
       </div>
    </m.div>
  );
});
