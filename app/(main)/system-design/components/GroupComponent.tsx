"use client";

import { memo } from "react";
import { m } from "framer-motion";
import { Layout } from "lucide-react";
import { Group } from "../types";

interface GroupComponentProps {
  group: Group;
  isSelected: boolean;
  onSelect: (id: string, type: "group") => void;
}

export const GroupComponent = memo(({ group, isSelected, onSelect }: GroupComponentProps) => {
  return (
     <m.div
        className={`absolute rounded-3xl border-2 transition-all duration-200 ${isSelected ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}
        style={{ x: group.x, y: group.y, width: group.w, height: group.h }}
        onClick={(e) => { e.stopPropagation(); onSelect(group.id, "group"); }}
     >
        <div className="p-4 flex items-center gap-2">
           <Layout size={12} className="text-gray-600" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{group.name}</span>
        </div>
     </m.div>
  );
});

GroupComponent.displayName = "GroupComponent";
