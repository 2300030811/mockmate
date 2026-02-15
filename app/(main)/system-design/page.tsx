"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Send, 
  Database, 
  Server, 
  Layers, 
  Globe, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  ZoomIn,
  ZoomOut,
  Grid,
  MousePointer2,
  Move,
  HelpCircle,
  Info
} from "lucide-react";
import { reviewSystemDesignAction } from "@/app/actions/system-design";
import ReactMarkdown from "react-markdown";
import { NavigationPill } from "@/components/ui/NavigationPill";

// --- Types ---
type NodeType = "Load Balancer" | "Web Server" | "Database" | "Cache" | "CDN" | "Message Queue" | "Client";

interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  name: string;
}

interface Connection {
  from: string;
  to: string;
}

// --- Config ---
const NODE_CONFIG: Record<NodeType, { icon: any, color: string, bg: string }> = {
  "Client": { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/50" },
  "Load Balancer": { icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/50" },
  "Web Server": { icon: Server, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/50" },
  "Database": { icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/50" },
  "Cache": { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/50" },
  "CDN": { icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/50" },
  "Message Queue": { icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/50" },
};

const SNAP_SIZE = 20;

// --- Components ---

// Memoized Node Component to prevent staggering re-renders
const DesignNode = ({ 
  node, 
  isSelected, 
  isConnecting,
  onNodeClick, 
  onDelete,
  updatePos 
}: { 
  node: Node, 
  isSelected: boolean,
  isConnecting: boolean,
  onNodeClick: (id: string) => void,
  onDelete: (id: string) => void,
  updatePos: (id: string, x: number, y: number) => void
}) => {
  const Config = NODE_CONFIG[node.type];

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {}} 
      onDragTransitionEnd={() => {}}
      
      // Standard Controlled Drag
      animate={{ x: node.x, y: node.y, scale: isSelected ? 1.05 : 1 }}
      // We disable layout animation during drag to prevent jitter
      layout={false}

      // Sync React State
      onPan={(_, info) => {
          updatePos(node.id, node.x + info.delta.x, node.y + info.delta.y);
      }}

      className={`
        absolute w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing z-20
        backdrop-blur-md border border-b-4 hover:-translate-y-1 transition-all duration-200
        ${Config.bg}
        ${isSelected ? 'ring-2 ring-white shadow-2xl shadow-white/10' : 'shadow-lg'}
        ${isConnecting ? 'animate-pulse ring-2 ring-indigo-400' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node.id);
      }}
    >
      <div className={`p-3 rounded-xl bg-gray-900/50 ${Config.color}`}>
         <Config.icon size={28} strokeWidth={1.5} />
      </div>
      <span className="text-[10px] font-bold uppercase text-gray-300 px-2 text-center leading-tight">
        {node.name}
      </span>

      {/* Quick Actions (only visible on hover/select) */}
      <div className={`absolute -top-3 -right-3 flex gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
         <button 
           onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
           className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
         >
           <Trash2 size={12} />
         </button>
      </div>
    </motion.div>
  );
};


export default function SystemDesignCanvas() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [scale, setScale] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Tools
  const [activeTool, setActiveTool] = useState<NodeType | "Connect" | "Select">("Select");
  const [connectStart, setConnectStart] = useState<string | null>(null);
  
  // UI States
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // --- Actions ---

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 2));
  };

  const addNode = (type: NodeType) => {
    // Better positioning: offset new nodes based on current count to prevent overlapping
    const count = nodes.length;
    const row = Math.floor(count / 3);
    const col = count % 3;
    
    const viewportX = 300 + (col * 140); 
    const viewportY = 200 + (row * 140); 
    
    const offX = Math.random() * 20 - 10;
    const offY = Math.random() * 20 - 10;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      x: viewportX + offX,
      y: viewportY + offY,
      name: `${type}`,
    };
    setNodes(prev => [...prev, newNode]);
    setActiveTool("Select");
  };

  const updateNodePos = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const handleNodeClick = (id: string) => {
    if (activeTool === "Connect") {
      if (!connectStart) {
        setConnectStart(id);
      } else {
        if (connectStart !== id) {
          setConnections(prev => {
            const exists = prev.find(c => (c.from === connectStart && c.to === id) || (c.from === id && c.to === connectStart));
            if (exists) return prev.filter(c => c !== exists);
            return [...prev, { from: connectStart, to: id }];
          });
        }
        setConnectStart(null);
      }
    } else {
      setSelectedNodeId(id);
    }
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleReview = async () => {
    if (nodes.length === 0) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const result = await reviewSystemDesignAction(nodes, connections);
      setReviewResult(result.markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) deleteNode(selectedNodeId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId]);

  return (
    <div className="h-screen bg-[#080808] text-white flex flex-col overflow-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* --- Top Bar --- */}
      <header className="h-16 px-6 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
             <NavigationPill className="relative z-50 scale-90 origin-left" />
          </div>
          <div className="md:hidden">
             <NavigationPill showBack={true} showHome={false} className="relative z-50 scale-75 origin-left" />
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Layers className="text-indigo-400" size={18} />
             </div>
             <div>
                <h1 className="text-sm font-bold text-white tracking-wide">System Architect</h1>
                <p className="text-[10px] text-gray-500 font-medium">BETA v2.0</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-gray-900 border border-white/10 rounded-lg p-1 mr-4">
             <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><ZoomOut size={14} /></button>
             <span className="text-[10px] font-mono text-gray-500 w-8 text-center">{Math.round(scale * 100)}%</span>
             <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><ZoomIn size={14} /></button>
          </div>

          <button 
             onClick={() => setShowHelp(true)}
             className="p-2 text-gray-500 hover:text-indigo-400 transition-colors hover:bg-indigo-950/30 rounded-lg"
             title="How to Use"
          >
             <HelpCircle size={18} />
          </button>

          <button 
             onClick={() => { setNodes([]); setConnections([]); }}
             className="p-2 text-gray-500 hover:text-red-400 transition-colors hover:bg-red-950/30 rounded-lg"
             title="Clear Canvas"
          >
             <RotateCcw size={16} />
          </button>

          <button 
            onClick={handleReview}
            disabled={nodes.length === 0 || isReviewing}
            className={`
              flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all border
              ${nodes.length === 0 
                 ? 'bg-gray-900 text-gray-600 border-white/5 cursor-not-allowed' 
                 : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-[0_0_20px_rgba(79,70,229,0.3)]'}
            `}
          >
            {isReviewing ? <Sparkles className="animate-spin" size={14} /> : <Zap size={14} fill="currentColor" />}
            <span>{isReviewing ? 'Analyzing...' : 'AI Audit'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* --- Toolbar --- */}
        <aside className="w-16 md:w-64 border-r border-white/5 bg-[#0A0A0A] flex flex-col z-20 shrink-0">
           <div className="p-4 border-b border-white/5">
              <h3 className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 <button 
                   onClick={() => setActiveTool("Select")}
                   className={`flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg border transition-all ${activeTool === "Select" ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                 >
                    <MousePointer2 size={16} />
                    <span className="hidden md:inline text-xs font-bold">Select</span>
                 </button>
                 <button 
                   onClick={() => setActiveTool("Connect")}
                   className={`flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg border transition-all ${activeTool === "Connect" ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                 >
                    <ArrowRight size={16} />
                    <span className="hidden md:inline text-xs font-bold">Connect</span>
                 </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4">
              <h3 className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Components</h3>
              <div className="grid grid-cols-1 gap-2">
                 {(Object.keys(NODE_CONFIG) as NodeType[]).map(type => {
                    const Config = NODE_CONFIG[type];
                    return (
                       <button
                         key={type}
                         onClick={() => addNode(type)}
                         className="group flex flex-col md:flex-row items-center gap-3 p-2 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/5"
                       >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${Config.bg} ${Config.color}`}>
                             <Config.icon size={16} />
                          </div>
                          <div className="hidden md:block text-left">
                             <p className="text-xs font-bold text-gray-300 group-hover:text-white">{type}</p>
                          </div>
                       </button>
                    )
                 })}
              </div>
           </div>
        </aside>

        {/* --- Canvas --- */}
        <main 
          className="flex-1 relative bg-[#050505] overflow-hidden cursor-crosshair"
          onClick={() => setSelectedNodeId(null)}
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ 
               backgroundImage: `radial-gradient(circle, #333 1px, transparent 1px)`, 
               backgroundSize: `${20 * scale}px ${20 * scale}px`,
               transformOrigin: 'top left'
            }}
          ></div>

          <motion.div 
            className="w-full h-full relative"
            animate={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ transformOrigin: 'center center' }}
          >
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
               {connections.map((conn, idx) => {
                 const from = nodes.find(n => n.id === conn.from);
                 const to = nodes.find(n => n.id === conn.to);
                 if (!from || !to) return null;
                 
                 const x1 = from.x + 48;
                 const y1 = from.y + 48;
                 const x2 = to.x + 48;
                 const y2 = to.y + 48;

                 return (
                   <g key={idx}>
                      <line 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke="#6366f1" 
                        strokeWidth="2"
                        strokeDasharray="5,5" 
                        className="animate-pulse opacity-50"
                      />
                      <circle cx={x1} cy={y1} r="3" fill="#6366f1" />
                      <circle cx={x2} cy={y2} r="3" fill="#6366f1" />
                   </g>
                 );
               })}
             </svg>

             <AnimatePresence>
                {nodes.map(node => (
                   <DesignNode 
                     key={node.id} 
                     node={node} 
                     isSelected={selectedNodeId === node.id}
                     isConnecting={connectStart === node.id}
                     onNodeClick={handleNodeClick}
                     onDelete={deleteNode}
                     updatePos={updateNodePos}
                   />
                ))}
             </AnimatePresence>

             {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                   <Grid size={100} strokeWidth={0.5} />
                   <p className="mt-4 font-mono text-sm">Canvas Empty</p>
                </div>
             )}
          </motion.div>
        </main>

        {/* --- Review Panel --- */}
        <AnimatePresence>
           {reviewResult && (
              <motion.aside 
                 initial={{ x: 500, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 exit={{ x: 500, opacity: 0 }}
                 className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-[#0A0A0A] border-l border-white/10 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 pt-16 md:pt-0"
              >
                  <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-gray-950/80 backdrop-blur-md">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Architectural Audit</span>
                     </div>
                     <button 
                       onClick={() => setReviewResult(null)} 
                       className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                     >
                        <Minimize2 size={18} />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                     {/* Summary Header Cards */}
                     <div className="p-6 pb-0 grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Status</span>
                           <span className="text-xs font-bold text-emerald-400">Analysis Complete</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Model</span>
                           <span className="text-xs font-bold text-blue-400">Groq Llama-3</span>
                        </div>
                     </div>

                     <div className="p-6 pt-4">
                        <div className="prose prose-invert prose-sm max-w-none 
                          prose-p:text-gray-400 prose-p:leading-relaxed 
                          prose-headings:text-white prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-6
                          prose-strong:text-indigo-300 prose-li:text-gray-400 prose-ul:my-4
                          prose-hr:border-white/5
                          [&>h1]:text-lg [&>h2]:text-md [&>h3]:text-sm
                        ">
                           <ReactMarkdown>{reviewResult}</ReactMarkdown>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 border-t border-white/5 bg-gray-950/50">
                     <button 
                       onClick={() => setReviewResult(null)}
                       className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all text-xs"
                     >
                        Dismiss Report
                     </button>
                  </div>
              </motion.aside>
           )}
        </AnimatePresence>

        {/* --- Help Overlay --- */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowHelp(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                    <Info size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">System Architect Guide</h2>
                    <p className="text-sm text-gray-400">Master the art of distributed systems</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-gray-400 font-mono text-xs">1</div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">Add Components</p>
                        <p className="text-xs text-gray-400">Click components in the sidebar to add Servers, Databases, or Load Balancers to your canvas.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-gray-400 font-mono text-xs">2</div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">Link Systems</p>
                        <p className="text-xs text-gray-400">Switch to the "Connect" tool. Click your first component, then click the second one to create a data flow.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-gray-400 font-mono text-xs">3</div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">Design & Drag</p>
                        <p className="text-xs text-gray-400">Grab any node to move it. Use "Select" tool to delete or zoom in/out to handle complex architectures.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-400 font-mono text-xs">AI</div>
                      <div>
                        <p className="text-sm font-bold text-indigo-300 mb-1">Architecture Audit</p>
                        <p className="text-xs text-gray-400">Click "AI Audit" to receive a senior-level critique of scalability, security, and potential points of failure.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
                >
                  Start Building
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}
