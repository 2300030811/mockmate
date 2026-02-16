import { 
  Database, 
  Server, 
  Layers, 
  Globe, 
  MessageSquare,
  Zap,
  Settings,
  Cpu,
  HardDrive,
  Smartphone
} from "lucide-react";

export type NodeType = "Load Balancer" | "Web Server" | "Database" | "Cache" | "CDN" | "Message Queue" | "Client" | "Microservice" | "Worker" | "Storage";

export const NODE_CONFIG: Record<NodeType, { icon: any, color: string, bg: string, border: string }> = {
  "Client": { icon: Smartphone, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/50" },
  "Load Balancer": { icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/50" },
  "Web Server": { icon: Server, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/50" },
  "Database": { icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/50" },
  "Cache": { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/50" },
  "CDN": { icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/50" },
  "Message Queue": { icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/50" },
  "Microservice": { icon: Cpu, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/50" },
  "Worker": { icon: Settings, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/50" },
  "Storage": { icon: HardDrive, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/50" },
};

export const GRID_SIZE = 20;
