"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Minimize2, 
  Sparkles,
  HelpCircle,
  Info,
  Grid as GridIcon,
  Layout,
  X,
  ArrowRight
} from "lucide-react";
import { reviewSystemDesignAction } from "@/app/actions/system-design";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

// --- Extracted Parts ---
import { Node, Connection, Group } from "./types";
import { NODE_CONFIG, GRID_SIZE, NodeType } from "./constants";
import { NodeComponent } from "./components/NodeComponent";
import { ConnectionLine } from "./components/ConnectionLine";
import { Toolbar } from "./components/Toolbar";
import { PropertyPanel } from "./components/PropertyPanel";
import { CanvasHeader } from "./components/CanvasHeader";

// --- Helper ---
const isInputActive = () => {
  if (typeof window === 'undefined') return false;
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
};

export default function SystemDesignCanvas() {
  // --- Canvas State ---
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  // --- History & Persistence ---
  const [history, setHistory] = useState<{nodes: Node[], connections: Connection[], groups: Group[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasLoaded, setHasLoaded] = useState(false);

  // --- UI Tools ---
  const [activeTool, setActiveTool] = useState<"Select" | "Connect" | "Pan" | "Group">("Select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"node" | "connection" | "group" | null>(null);
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // --- UI States ---
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "neo">("dark");

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // --- Persistence Logic ---
  useEffect(() => {
    const saved = localStorage.getItem('mockmate-design-pro-v3');
    const savedTheme = localStorage.getItem('mockmate-design-theme') as any;
    if (savedTheme) setTheme(savedTheme);

    if (saved) {
      try {
        const p = JSON.parse(saved);
        setNodes(p.nodes || []);
        setConnections(p.connections || []);
        setGroups(p.groups || []);
        setHistory([{ nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] }]);
        setHistoryIndex(0);
      } catch (e) {
        // Fallback for old version
        const old = localStorage.getItem('mockmate-design-pro');
        if (old) {
          const p = JSON.parse(old);
          setNodes(p.nodes || []); setConnections(p.connections || []); setGroups(p.groups || []);
        }
      }
    } else {
        setHistory([{ nodes: [], connections: [], groups: [] }]);
        setHistoryIndex(0);
    }
    setHasLoaded(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    const data = { nodes, connections, groups, timestamp: Date.now() };
    localStorage.setItem('mockmate-design-pro-v3', JSON.stringify(data));
    localStorage.setItem('mockmate-design-theme', theme);
  }, [nodes, connections, groups, theme, hasLoaded]);

  // --- History Managers ---
  const addToHistory = useCallback((n: Node[], c: Connection[], g: Group[]) => {
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, { nodes: n, connections: c, groups: g }].slice(-50);
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const p = history[historyIndex - 1];
      setNodes(p.nodes); setConnections(p.connections); setGroups(p.groups);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const p = history[historyIndex + 1];
      setNodes(p.nodes); setConnections(p.connections); setGroups(p.groups);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history]);

  // --- Handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === "Pan" || e.button === 1 || (e.button === 0 && e.altKey)) {
       isPanningRef.current = true;
       lastMouseRef.current = { x: e.clientX, y: e.clientY };
       if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    }
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = activeTool === "Pan" ? 'grab' : 'crosshair';
  }, [activeTool]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.min(Math.max(0.2, s + delta), 3));
    } else {
       setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const updateNodePos = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => {
       const old = prev.find(n => n.id === id);
       if (old && old.x === x && old.y === y) return prev;
       const next = prev.map(n => n.id === id ? { ...n, x, y } : n);
       addToHistory(next, connections, groups);
       return next;
    });
  }, [connections, groups, addToHistory]);

  const handleNodeClick = useCallback((id: string) => {
    if (activeTool === "Connect") {
      if (!connectStart) {
        setConnectStart(id);
        toast("Select target node...", { icon: <ArrowRight size={14} /> });
      } else if (connectStart !== id) {
        const exists = connections.some(c => (c.from === connectStart && c.to === id) || (c.from === id && c.to === connectStart));
        if (!exists) {
          const nc = { id: `c-${Date.now()}`, from: connectStart, to: id, label: "Interface" };
          const nx = [...connections, nc];
          setConnections(nx); addToHistory(nodes, nx, groups);
          toast.success("Link established");
        }
        setConnectStart(null); setActiveTool("Select");
      }
    } else {
      setSelectedId(id);
      setSelectedType("node");
    }
  }, [activeTool, connectStart, connections, nodes, groups, addToHistory]);

  const addNode = useCallback((type: NodeType) => {
    const newNode: Node = {
      id: `n-${Date.now()}`,
      type,
      x: Math.round((-pan.x + (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2) / (scale * GRID_SIZE)) * GRID_SIZE,
      y: Math.round((-pan.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) / (scale * GRID_SIZE)) * GRID_SIZE,
      name: type,
      metadata: {}
    };
    const next = [...nodes, newNode];
    setNodes(next);
    addToHistory(next, connections, groups);
    setSelectedId(newNode.id);
    setSelectedType("node");
    toast.success(`Added ${type}`);
  }, [pan, scale, nodes, connections, groups, addToHistory]);

  const addGroup = useCallback(() => {
    const newGroup: Group = {
       id: `g-${Date.now()}`,
       name: "Container",
       x: Math.round((-pan.x + (typeof window !== 'undefined' ? window.innerWidth : 1200) / 4) / scale / GRID_SIZE) * GRID_SIZE,
       y: Math.round((-pan.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 4) / scale / GRID_SIZE) * GRID_SIZE,
       w: 400,
       h: 300,
       color: "rgba(99, 102, 241, 0.1)"
    };
    const next = [...groups, newGroup];
    setGroups(next);
    addToHistory(nodes, connections, next);
    setSelectedId(newGroup.id);
    setSelectedType("group");
  }, [pan, scale, nodes, connections, groups, addToHistory]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    if (selectedType === "node") {
       const nextN = nodes.filter(n => n.id !== selectedId);
       const nextC = connections.filter(c => c.from !== selectedId && c.to !== selectedId);
       setNodes(nextN); setConnections(nextC);
       addToHistory(nextN, nextC, groups);
    } else if (selectedType === "connection") {
       const nextC = connections.filter(c => c.id !== selectedId);
       setConnections(nextC);
       addToHistory(nodes, nextC, groups);
    } else if (selectedType === "group") {
       const nextG = groups.filter(g => g.id !== selectedId);
       setGroups(nextG);
       addToHistory(nodes, connections, nextG);
    }
    setSelectedId(null);
    setSelectedType(null);
  }, [selectedId, selectedType, nodes, connections, groups, addToHistory]);

  const exportSVG = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mockmate-design-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("SVG Exported!");
  }, []);

  const copyJSON = useCallback(() => {
    const data = JSON.stringify({ nodes, connections, groups });
    navigator.clipboard.writeText(data);
    toast.success("JSON Architecture Copied");
  }, [nodes, connections, groups]);

  const insertTemplate = useCallback((stack: "Serverless" | "Web") => {
    const base = Date.now();
    const center = { x: -pan.x / scale + 400, y: -pan.y / scale + 300 };
    let newNodes: Node[] = [];
    let newConns: Connection[] = [];

    if (stack === "Serverless") {
       newNodes = [
          { id: `${base}-1`, type: "Client", x: center.x, y: center.y, name: "End User" },
          { id: `${base}-2`, type: "Load Balancer", x: center.x + 150, y: center.y, name: "API Gate" },
          { id: `${base}-3`, type: "Microservice", x: center.x + 300, y: center.y, name: "Lambda" },
          { id: `${base}-4`, type: "Database", x: center.x + 450, y: center.y, name: "Dynamo" },
       ];
       newConns = [
          { id: `${base}-c1`, from: `${base}-1`, to: `${base}-2`, label: "JSON" },
          { id: `${base}-c2`, from: `${base}-2`, to: `${base}-3`, label: "Trigger" },
          { id: `${base}-c3`, from: `${base}-3`, to: `${base}-4`, label: "Query" },
       ];
    } else if (stack === "Web") {
       newNodes = [
          { id: `${base}-w1`, type: "CDN", x: center.x, y: center.y, name: "CloudFront" },
          { id: `${base}-w2`, type: "Load Balancer", x: center.x + 150, y: center.y, name: "ALB" },
          { id: `${base}-w3`, type: "Web Server", x: center.x + 300, y: center.y, name: "ASG" },
          { id: `${base}-w4`, type: "Database", x: center.x + 450, y: center.y, name: "RDS" },
       ];
       newConns = [
          { id: `${base}-wc1`, from: `${base}-w1`, to: `${base}-w2`, label: "Edge" },
          { id: `${base}-wc2`, from: `${base}-w2`, to: `${base}-w3`, label: "Forward" },
          { id: `${base}-wc3`, from: `${base}-w3`, to: `${base}-w4`, label: "SQL" },
       ];
    }
    const nextN = [...nodes, ...newNodes];
    const nextC = [...connections, ...newConns];
    setNodes(nextN); setConnections(nextC);
    addToHistory(nextN, nextC, groups);
  }, [pan, scale, nodes, connections, groups, addToHistory]);

  const handleReview = useCallback(async () => {
    if (nodes.length === 0) return;
    setIsReviewing(true);
    try {
      const result = await reviewSystemDesignAction(nodes, connections);
      setReviewResult(result.markdown);
      toast.success("Audit Complete");
    } catch (err) {
      toast.error("Audit Failed");
    } finally {
      setIsReviewing(false);
    }
  }, [nodes, connections]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isInputActive()) return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if (e.key === " ") { e.preventDefault(); setActiveTool("Pan"); if(canvasRef.current) canvasRef.current.style.cursor = 'grab'; }
    };
    const up = (e: KeyboardEvent) => { if (e.key === " ") { setActiveTool("Select"); if(canvasRef.current) canvasRef.current.style.cursor = 'crosshair'; } };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [deleteSelected, redo, undo]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden selection:bg-indigo-500/30 font-sans antialiased transition-colors duration-500 ${
      theme === "light" ? "bg-gray-50 text-gray-900" : 
      theme === "neo" ? "bg-[#0a0a12] text-white" : "bg-[#050505] text-white"
    }`}>
      
      <CanvasHeader 
        undo={undo} redo={redo} historyIndex={historyIndex} historyLength={history.length}
        setPan={setPan} setScale={setScale} scale={scale}
        showGrid={showGrid} setShowGrid={setShowGrid}
        exportSVG={exportSVG} copyJSON={copyJSON}
        handleReview={handleReview} isReviewing={isReviewing}
        nodesLength={nodes.length}
        theme={theme} setTheme={setTheme}
      />

      <div className="flex-1 flex overflow-hidden">
        <Toolbar 
          activeTool={activeTool} setActiveTool={setActiveTool} 
          addGroup={addGroup} addNode={addNode} 
          insertTemplate={insertTemplate} 
          theme={theme}
        />

        <main 
           ref={canvasRef}
           onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel}
           className={`flex-1 relative overflow-hidden select-none outline-none transition-colors duration-500 ${
             theme === "light" ? "bg-white" : 
             theme === "neo" ? "bg-[#050508]" : "bg-[#030303]"
           }`}
           style={{ cursor: activeTool === "Pan" ? 'grab' : 'crosshair' }}
        >
           {/* AI Scanning Overlay */}
           <AnimatePresence>
              {isReviewing && (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-[2px] pointer-events-none flex flex-col items-center justify-center"
                 >
                    <div className="relative">
                       <motion.div 
                          animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="w-32 h-32 border-2 border-dashed border-indigo-500/30 rounded-full"
                       />
                       <motion.div 
                          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 flex items-center justify-center"
                       >
                          <Sparkles size={32} className="text-indigo-500" />
                       </motion.div>
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan" />
                    </div>
                    <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Deep Scanning Architecture...</p>
                 </motion.div>
              )}
           </AnimatePresence>
           {/* Visual Guides - Advanced Dot Grid */}
           {showGrid && (
             <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
               theme === "light" ? "opacity-[0.2]" : "opacity-[0.15] mix-blend-screen"
             }`}
               style={{ 
                  backgroundImage: theme === "light" 
                    ? `radial-gradient(circle, #000 1px, transparent 1px)`
                    : `radial-gradient(circle, #444 1px, transparent 1px)`,
                  backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
                  backgroundPosition: `${pan.x}px ${pan.y}px`
               }}
             />
           )}

           <motion.div 
              className="w-full h-full relative origin-top-left"
              style={{ x: pan.x, y: pan.y, scale }}
           >
              {/* Groups Layer */}
              {groups.map(g => (
                 <motion.div
                    key={g.id}
                    className={`absolute rounded-3xl border-2 transition-all duration-200 ${selectedId === g.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                    style={{ x: g.x, y: g.y, width: g.w, height: g.h }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(g.id); setSelectedType("group"); }}
                 >
                    <div className="p-4 flex items-center gap-2">
                       <Layout size={12} className="text-gray-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{g.name}</span>
                    </div>
                 </motion.div>
              ))}

              {/* Connections Layer (Memoized inside) */}
              <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
                 <defs>
                   <filter id="glow">
                     <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                     <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                   </filter>
                   <marker id="arrow" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                   </marker>
                 </defs>
                 {connections.map(c => (
                    <ConnectionLine 
                       key={c.id} connection={c} 
                       fromNode={nodes.find(n => n.id === c.from)} 
                       toNode={nodes.find(n => n.id === c.to)} 
                       isSelected={selectedId === c.id}
                       onClick={(id) => { setSelectedId(id); setSelectedType("connection"); }}
                    />
                 ))}
              </svg>

              {/* Nodes Layer */}
              <AnimatePresence>
                 {nodes.map(n => (
                    <NodeComponent 
                       key={n.id} node={n} scale={scale} 
                       isSelected={selectedId === n.id} 
                       isConnecting={connectStart === n.id} 
                       onDelete={deleteSelected} 
                       onNodeClick={handleNodeClick} 
                       updatePos={updateNodePos} 
                    />
                 ))}
              </AnimatePresence>
           </motion.div>

           {/* --- Overlays & HUD --- */}
           
           {/* Mini-map */}
           <div className="absolute bottom-8 right-8 w-56 h-36 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden pointer-events-none z-30 shadow-2xl transition-opacity hover:opacity-100 opacity-60">
              <div className="absolute top-2 left-3 text-[8px] font-black text-gray-500 uppercase tracking-widest">Navigator</div>
              <svg viewBox={`${-pan.x/scale - 200} ${-pan.y/scale - 150} ${2500} ${1500}`} className="w-full h-full opacity-40 py-4">
                 {groups.map(g => <rect key={g.id} x={g.x} y={g.y} width={g.w} height={g.h} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />)}
                 {nodes.map(n => <rect key={n.id} x={n.x} y={n.y} width={96} height={96} rx="20" fill="#6366f1" />)}
                 <rect x={-pan.x/scale} y={-pan.y/scale} width={(windowSize.width || 1200) / scale} height={(windowSize.height || 800) / scale} stroke="#6366f1" strokeWidth="15" fill="none" />
              </svg>
           </div>

           {/* Quick Stats Overlay (HUD) */}
           <div className="absolute bottom-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 z-30 flex items-center gap-5">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-gray-600 uppercase">Nodes</span>
                 <span className="text-xs font-bold text-gray-300">{nodes.length}</span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-gray-600 uppercase">Links</span>
                 <span className="text-xs font-bold text-gray-300">{connections.length}</span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <button onClick={() => setShowHelp(true)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 transition-colors"><HelpCircle size={14} /></button>
           </div>
        </main>

        <PropertyPanel 
           selectedId={selectedId} selectedType={selectedType}
           nodes={nodes} connections={connections} groups={groups}
           setNodes={setNodes} setConnections={setConnections} setGroups={setGroups}
           setSelectedId={setSelectedId} addToHistory={addToHistory}
           deleteSelected={deleteSelected}
           theme={theme}
        />
      </div>

       {/* Modals & Overlays */}
       <AnimatePresence>
           {reviewResult && (
              <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className={`fixed right-0 top-0 h-full w-full md:w-[600px] border-l z-50 pt-14 md:pt-0 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-colors duration-500 ${theme === "light" ? "bg-white border-gray-200" : "bg-[#0A0A0A] border-white/10"}`}>
                  <div className={`h-16 px-8 border-b flex items-center justify-between shrink-0 backdrop-blur-md ${theme === "light" ? "bg-gray-50/80 border-gray-200" : "bg-gray-950/80 border-white/10"}`}>
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_#6366f1]" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === "light" ? "text-indigo-600" : "text-indigo-400"}`}>Architectural Intelligence</span>
                     </div>
                     <button onClick={() => setReviewResult(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Minimize2 size={18} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-20">
                     <div className={`prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-black ${theme === "light" ? "prose-slate" : "prose-invert"}`}>
                        <ReactMarkdown>{reviewResult}</ReactMarkdown>
                     </div>
                  </div>
                  <div className={`p-8 border-t flex flex-col gap-4 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-950/50 border-white/10"}`}>
                     <div className="flex gap-4">
                        <div className="flex-1 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10"><p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Score</p><p className={`text-2xl font-black ${theme === "light" ? "text-gray-900" : "text-white"}`}>84<span className="text-sm opacity-30">/100</span></p></div>
                        <div className="flex-1 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"><p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Status</p><p className={`text-2xl font-black ${theme === "light" ? "text-gray-900" : "text-white"}`}>SECURE</p></div>
                     </div>
                     <button onClick={() => setReviewResult(null)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all">Dismiss Analysis</button>
                  </div>
              </motion.aside>
           )}

           {showHelp && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
                 <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-gray-950 border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"><Info size={32} /></div>
                       <div><h2 className="text-3xl font-black text-white">System Guide</h2><p className="text-gray-400">Master the architecture modeling workspace.</p></div>
                       <button onClick={() => setShowHelp(false)} className="ml-auto p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-10 mb-10">
                       <div className="space-y-4">
                          <p className="text-xs font-black uppercase text-indigo-400">Navigation</p>
                          <ul className="space-y-3 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Space</kbd> + Drag to Pan</li>
                             <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Ctrl</kbd> + Scroll to Zoom</li>
                             <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">M-Click</kbd> Recenter</li>
                          </ul>
                       </div>
                       <div className="space-y-4">
                          <p className="text-xs font-black uppercase text-indigo-400">Quick Actions</p>
                          <ul className="space-y-3 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Del</kbd> Remove Selection</li>
                             <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Ctrl+Z</kbd> Undo Changes</li>
                             <li className="flex gap-3"><kbd className="bg-white/10 px-2 rounded font-mono">Ctrl+Y</kbd> Redo Changes</li>
                          </ul>
                       </div>
                    </div>
                    <button onClick={() => setShowHelp(false)} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">Acknowledge</button>
                 </motion.div>
              </motion.div>
           )}
       </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        ::selection { background: rgba(99, 102, 241, 0.2); }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
