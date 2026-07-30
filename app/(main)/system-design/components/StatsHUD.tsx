"use client";

import { memo, useState } from "react";
import { HelpCircle, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle } from "lucide-react";
import { Node, Connection } from "../types";

interface StatsHUDProps {
  nodes: Node[];
  connections: Connection[];
  theme: "dark" | "light" | "neo";
  activeChallengeId: string | null;
  setShowHelp: (show: boolean) => void;
}

interface ChecklistItem {
  name: string;
  passed: boolean;
  warning: string;
}

export function getChallengeChecklist(challengeId: string, nodes: Node[]): ChecklistItem[] {
  const hasNode = (type: string) => nodes.some(n => n.type === type);
  const countNodes = (type: string) => nodes.filter(n => n.type === type).length;

  switch (challengeId) {
    case "url-shortener":
      return [
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Missing Load Balancer for high availability" },
        { name: "Cache Layer", passed: hasNode("Cache"), warning: "Missing Cache for read-heavy redirection" },
        { name: "Global CDN", passed: hasNode("CDN"), warning: "Missing CDN for low-latency redirection" },
        { name: "Database Redundancy", passed: countNodes("Database") >= 2, warning: "Single Database represents a SPOF" },
      ];
    case "realtime-chat":
      return [
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Need Load Balancer for WebSocket scaling" },
        { name: "Message Queue", passed: hasNode("Message Queue"), warning: "Missing Message Queue/PubSub for server sync" },
        { name: "Cache (Sessions)", passed: hasNode("Cache"), warning: "Missing Cache for fast presence indicators" },
        { name: "Persistence Store", passed: hasNode("Database") || hasNode("Storage"), warning: "Missing Database/Storage for history" },
      ];
    case "video-stream":
      return [
        { name: "Content Delivery Network", passed: hasNode("CDN"), warning: "Missing CDN for global playback" },
        { name: "Blob Storage", passed: hasNode("Storage"), warning: "Missing Object Storage for video assets" },
        { name: "Transcoding Worker", passed: hasNode("Worker"), warning: "Missing Worker node for transcoding" },
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Missing Load Balancer for client ingress" },
      ];
    case "trading-system":
      return [
        { name: "In-Memory Cache", passed: hasNode("Cache"), warning: "Need low-latency cache for order book data" },
        { name: "Audit DB", passed: hasNode("Database"), warning: "Missing persistent Database for audit trail" },
        { name: "Broadcaster (Queue)", passed: hasNode("Message Queue"), warning: "Missing Message Queue/Broadcaster for quotes" },
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Missing Load Balancer for API scale" },
      ];
    default:
      return [];
  }
}

export const StatsHUD = memo(({ nodes, connections, theme, activeChallengeId, setShowHelp }: StatsHUDProps) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const isLight = theme === 'light';
  const isNeo = theme === 'neo';

  const checklist = activeChallengeId ? getChallengeChecklist(activeChallengeId, nodes) : [];
  const totalChecks = checklist.length;
  const passedChecks = checklist.filter(c => c.passed).length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <div className="absolute bottom-8 left-8 z-30 flex flex-col items-start gap-2">
      {/* Expanded Checklist Overlay */}
      {showChecklist && activeChallengeId && checklist.length > 0 && (
        <div className={`w-72 rounded-2xl border p-4 shadow-xl mb-1 transition-all duration-300 ${
          isLight 
            ? 'bg-white border-gray-200 text-gray-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)]' 
            : isNeo 
              ? 'bg-[#050212]/95 border-fuchsia-500/20 text-cyan-50 shadow-[0_4px_30px_rgba(217,70,239,0.15)]' 
              : 'bg-[#0F0F0F] border-white/10 text-white shadow-2xl'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Architecture Checklist</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              score === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>{score}% Pass</span>
          </div>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-tight">
                {item.passed ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className={`font-bold ${item.passed ? (isLight ? 'text-gray-700' : 'text-gray-300') : (isLight ? 'text-gray-900' : 'text-white')}`}>
                    {item.name}
                  </span>
                  {!item.passed && (
                    <span className="text-[9px] text-gray-500 font-medium">{item.warning}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main HUD Bar */}
      <div className={`p-3 rounded-xl border flex items-center gap-5 shadow-lg transition-colors duration-500 ${
        isLight ? "bg-white/95 border-gray-200 text-gray-900 shadow-[0_4px_24px_rgba(0,0,0,0.05)]" :
        isNeo ? "bg-[#050212]/80 border-fuchsia-500/20 text-cyan-50 shadow-[0_4px_30px_rgba(217,70,239,0.15)]" :
        "bg-black/40 border-white/5 text-white"
      }`}>
        <div className="flex flex-col">
           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nodes</span>
           <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>{nodes.length}</span>
        </div>
        <div className={`w-px h-6 ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
        <div className="flex flex-col">
           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Links</span>
           <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>{connections.length}</span>
        </div>

        {activeChallengeId && checklist.length > 0 && (
          <>
            <div className={`w-px h-6 ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
            <button 
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-left"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Checklist</span>
                <span className={`text-xs font-black flex items-center gap-1 ${
                  score === 100 ? 'text-emerald-500' : 'text-amber-500'
                }`}>
                  {passedChecks}/{totalChecks}
                  {showChecklist ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
                </span>
              </div>
            </button>
          </>
        )}

        <div className={`w-px h-6 ${isLight ? 'bg-gray-200' : 'bg-white/5'}`} />
        <button 
          onClick={() => setShowHelp(true)} 
          className={`p-1.5 rounded-lg transition-colors ${
            isLight ? 'hover:bg-gray-100 text-gray-500 hover:text-gray-900' : 'hover:bg-white/5 text-gray-500 hover:text-gray-300'
          }`}
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </div>
  );
});

StatsHUD.displayName = "StatsHUD";
