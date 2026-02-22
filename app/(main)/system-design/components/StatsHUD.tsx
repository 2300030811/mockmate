import { memo } from "react";
import { HelpCircle } from "lucide-react";

interface StatsHUDProps {
  nodesLength: number;
  connectionsLength: number;
  setShowHelp: (show: boolean) => void;
}

export const StatsHUD = memo(({ nodesLength, connectionsLength, setShowHelp }: StatsHUDProps) => {
  return (
    <div className="absolute bottom-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 z-30 flex items-center gap-5">
       <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-600 uppercase">Nodes</span>
          <span className="text-xs font-bold text-gray-300">{nodesLength}</span>
       </div>
       <div className="w-px h-6 bg-white/5" />
       <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-600 uppercase">Links</span>
          <span className="text-xs font-bold text-gray-300">{connectionsLength}</span>
       </div>
       <div className="w-px h-6 bg-white/5" />
       <button onClick={() => setShowHelp(true)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
          <HelpCircle size={14} />
       </button>
    </div>
  );
});

StatsHUD.displayName = "StatsHUD";
