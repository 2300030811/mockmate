"use client";

import { motion } from "framer-motion";
import { Map, ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { CareerPath } from "@/types/dashboard";

interface CareerPathsProps {
  paths: CareerPath[];
}

export function CareerPaths({ paths }: CareerPathsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-md h-full"
    >
       <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <Map size={16} /> Latest Roadmaps
       </h2>
       <div className="space-y-3">
          {paths?.length > 0 ? (
             paths.map((path, i) => (
                <NextLink href="/career-path" key={i} className="block group">
                   <div className="p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{path.job_role}</p>
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
    </motion.div>
  );
}
