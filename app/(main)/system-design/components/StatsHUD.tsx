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
  const hasNode = (type: string) => nodes.some((n) => n.type === type);
  const countNodes = (type: string) => nodes.filter((n) => n.type === type).length;

  switch (challengeId) {
    case "url-shortener":
      return [
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Missing Load Balancer for high availability" },
        { name: "Cache Layer", passed: hasNode("Cache"), warning: "Missing Cache for read-heavy redirection" },
        { name: "Global CDN", passed: hasNode("CDN"), warning: "Missing CDN for low-latency redirection" },
        { name: "Database Redundancy", passed: countNodes("Database") >= 2, warning: "Single Database represents a SPOF" }
      ];
    case "realtime-chat":
      return [
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Need Load Balancer for WebSocket scaling" },
        { name: "Message Queue", passed: hasNode("Message Queue"), warning: "Missing Message Queue/PubSub for server sync" },
        { name: "Cache (Sessions)", passed: hasNode("Cache"), warning: "Missing Cache for fast presence indicators" },
        { name: "Persistence Store", passed: hasNode("Database") || hasNode("Storage"), warning: "Missing Database/Storage for history" }
      ];
    case "video-stream":
      return [
        { name: "Content Delivery Network", passed: hasNode("CDN"), warning: "Missing CDN for global playback" },
        { name: "Blob Storage", passed: hasNode("Storage"), warning: "Missing Object Storage for video assets" },
        { name: "Transcoding Worker", passed: hasNode("Worker"), warning: "Missing Worker node for transcoding" },
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Missing Load Balancer for client ingress" }
      ];
    case "trading-system":
      return [
        { name: "In-Memory Cache", passed: hasNode("Cache"), warning: "Need low-latency cache for order book data" },
        { name: "Audit DB", passed: hasNode("Database"), warning: "Missing persistent Database for audit trail" },
        { name: "Broadcaster (Queue)", passed: hasNode("Message Queue"), warning: "Missing Message Queue/Broadcaster for quotes" },
        { name: "Load Balancer", passed: hasNode("Load Balancer"), warning: "Missing Load Balancer for API scale" }
      ];
    default:
      return [];
  }
}

export const StatsHUD = memo(({
  nodes,
  connections,
  theme,
  activeChallengeId,
  setShowHelp
}: StatsHUDProps) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const checklist = activeChallengeId ? getChallengeChecklist(activeChallengeId, nodes) : [];
  const totalChecks = checklist.length;
  const passedChecks = checklist.filter((c) => c.passed).length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start gap-1.5 select-none">
      {/* Expanded Checklist Overlay */}
      {showChecklist && activeChallengeId && checklist.length > 0 && (
        <div className="w-72 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white dark:bg-[#14141e] p-3 shadow-xl mb-1 text-zinc-900 dark:text-[#ebebef]">
          <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-zinc-100 dark:border-[#1e1e2a]">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-500 dark:text-[#8b8b9e]">
              Architecture Validation
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                score === 100
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}
            >
              {score}% Passed
            </span>
          </div>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs leading-tight">
                {item.passed ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-zinc-800 dark:text-[#ebebef]">
                    {item.name}
                  </span>
                  {!item.passed && (
                    <span className="text-[10px] text-zinc-500 dark:text-[#8b8b9e]">
                      {item.warning}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main HUD Bar */}
      <div className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-white/95 dark:bg-[#14141e]/95 backdrop-blur-md shadow-md flex items-center gap-3.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
            NODES
          </span>
          <span className="font-mono font-bold text-zinc-800 dark:text-[#ebebef]">
            {nodes.length}
          </span>
        </div>

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-[#1e1e2a]" />

        <div className="flex items-center gap-1.5">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
            LINKS
          </span>
          <span className="font-mono font-bold text-zinc-800 dark:text-[#ebebef]">
            {connections.length}
          </span>
        </div>

        {activeChallengeId && checklist.length > 0 && (
          <>
            <div className="w-px h-3.5 bg-zinc-200 dark:bg-[#1e1e2a]" />
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-400 dark:text-[#5a5a6e]">
                RULES
              </span>
              <span
                className={`font-mono font-bold flex items-center gap-0.5 ${
                  score === 100 ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {passedChecks}/{totalChecks}
                {showChecklist ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
              </span>
            </button>
          </>
        )}

        <div className="w-px h-3.5 bg-zinc-200 dark:bg-[#1e1e2a]" />

        <button
          onClick={() => setShowHelp(true)}
          className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1e1e2a] transition-colors"
          title="Controls & Shortcuts Guide"
        >
          <HelpCircle size={13} />
        </button>
      </div>
    </div>
  );
});

StatsHUD.displayName = "StatsHUD";
