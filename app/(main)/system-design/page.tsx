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
import { SystemDesignTutorial } from "./components/SystemDesignTutorial";
import { ReviewModal } from "./components/ReviewModal";
import { HelpModal } from "./components/HelpModal";
import { MiniMap } from "./components/MiniMap";
import { StatsHUD } from "./components/StatsHUD";
import { GroupComponent } from "./components/GroupComponent";

// --- Helper ---
const isInputActive = () => {
  if (typeof window === 'undefined') return false;
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
};

// --- Custom Hooks ---
import { useSystemDesignHistory } from "./hooks/useSystemDesignHistory";
import { useCanvasControls } from "./hooks/useCanvasControls";
import { useSelection } from "./hooks/useSelection";

export default function SystemDesignCanvas() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const { 
    history, historyIndex, historyLength, 
    setInitialHistory, addToHistory, 
    undo: undoHistory, redo: redoHistory 
  } = useSystemDesignHistory({ nodes: [], connections: [], groups: [] });

  const {
    pan, setPan, scale, setScale,
    handleMouseDown, handleMouseMove, handleMouseUp, handleWheel
  } = useCanvasControls();

  const { selectedId, selectedType, selectElement, clearSelection } = useSelection();

  // --- History & Persistence State ---
  const [hasLoaded, setHasLoaded] = useState(false);

  // --- UI Tools ---
  const [activeTool, setActiveTool] = useState<"Select" | "Connect" | "Pan" | "Group">("Select");
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // --- UI States ---
  const [showReview, setShowReview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "neo">("dark");

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
        setInitialHistory({ nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] });
      } catch (e) {
        const old = localStorage.getItem('mockmate-design-pro');
        if (old) {
          const p = JSON.parse(old);
          const initial = { nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] };
          setNodes(initial.nodes); setConnections(initial.connections); setGroups(initial.groups);
          setInitialHistory(initial);
        }
      }
    } else {
        setInitialHistory({ nodes: [], connections: [], groups: [] });
    }
    setHasLoaded(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    // Auto-trigger tutorial if not onboarded
    const onboarded = localStorage.getItem('mockmate-sd-onboarded');
    if (!onboarded) {
        setTimeout(() => setShowTutorial(true), 1500);
    }

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setInitialHistory]);

  useEffect(() => {
    if (!hasLoaded) return;
    const data = { nodes, connections, groups, timestamp: Date.now() };
    localStorage.setItem('mockmate-design-pro-v3', JSON.stringify(data));
    localStorage.setItem('mockmate-design-theme', theme);
  }, [nodes, connections, groups, theme, hasLoaded]);

  // --- Wrapper Handlers ---
  const recordHistory = useCallback((n: Node[], c: Connection[], g: Group[]) => {
    addToHistory({ nodes: n, connections: c, groups: g });
  }, [addToHistory]);

  const undo = useCallback(() => {
    const prev = undoHistory();
    if (prev) { setNodes(prev.nodes); setConnections(prev.connections); setGroups(prev.groups); }
  }, [undoHistory]);

  const redo = useCallback(() => {
    const next = redoHistory();
    if (next) { setNodes(next.nodes); setConnections(next.connections); setGroups(next.groups); }
  }, [redoHistory]);

  const handleConnectionClick = useCallback((id: string) => {
    selectElement(id, "connection");
  }, [selectElement]);

  const handleGroupSelect = useCallback((id: string, type: "group") => {
    selectElement(id, type);
  }, [selectElement]);

  const updateNodePos = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => {
       const old = prev.find(n => n.id === id);
       if (old && old.x === x && old.y === y) return prev;
       const next = prev.map(n => n.id === id ? { ...n, x, y } : n);
       recordHistory(next, connections, groups);
       return next;
    });
  }, [connections, groups, recordHistory]);

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
          setConnections(nx); recordHistory(nodes, nx, groups);
          toast.success("Link established");
        }
        setConnectStart(null); setActiveTool("Select");
      }
    } else {
      selectElement(id, "node");
    }
  }, [activeTool, connectStart, connections, nodes, groups, recordHistory, selectElement]);

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
    recordHistory(next, connections, groups);
    selectElement(newNode.id, "node");
    toast.success(`Added ${type}`);
  }, [pan, scale, nodes, connections, groups, recordHistory, selectElement]);

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
    recordHistory(nodes, connections, next);
    selectElement(newGroup.id, "group");
  }, [pan, scale, nodes, connections, groups, recordHistory, selectElement]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    if (selectedType === "node") {
       const nextN = nodes.filter(n => n.id !== selectedId);
       const nextC = connections.filter(c => c.from !== selectedId && c.to !== selectedId);
       setNodes(nextN); setConnections(nextC);
       recordHistory(nextN, nextC, groups);
    } else if (selectedType === "connection") {
       const nextC = connections.filter(c => c.id !== selectedId);
       setConnections(nextC);
       recordHistory(nodes, nextC, groups);
    } else if (selectedType === "group") {
       const nextG = groups.filter(g => g.id !== selectedId);
       setGroups(nextG);
       recordHistory(nodes, connections, nextG);
    }
    clearSelection();
  }, [selectedId, selectedType, nodes, connections, groups, recordHistory, clearSelection]);

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
    recordHistory(nextN, nextC, groups);
  }, [pan, scale, nodes, connections, groups, recordHistory]);

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

  const clearCanvas = useCallback(() => {
    if (nodes.length === 0 && connections.length === 0 && groups.length === 0) return;
    if (window.confirm("Are you sure you want to clear the entire workspace? This cannot be undone.")) {
      setNodes([]);
      setConnections([]);
      setGroups([]);
      recordHistory([], [], []);
      toast.success("Workspace cleared");
    }
  }, [nodes.length, connections.length, groups.length, recordHistory]);

  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<string | null>(null);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isInputActive()) return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); setShowTutorial(true); }
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
        undo={undo} redo={redo} historyIndex={historyIndex} historyLength={historyLength}
        setPan={setPan} setScale={setScale} scale={scale}
        showGrid={showGrid} setShowGrid={setShowGrid}
        exportSVG={exportSVG} copyJSON={copyJSON}
        handleReview={handleReview} isReviewing={isReviewing}
        nodesLength={nodes.length}
        theme={theme} setTheme={setTheme}
        clearCanvas={clearCanvas}
      />

      <div className="flex-1 flex overflow-hidden">
        <Toolbar 
          activeTool={activeTool} setActiveTool={setActiveTool} 
          addGroup={addGroup} addNode={addNode} 
          insertTemplate={insertTemplate} 
          theme={theme}
        />

        <main 
           id="sd-canvas"
           ref={canvasRef}
           onMouseDown={(e) => handleMouseDown(e, activeTool, canvasRef)} 
           onMouseMove={handleMouseMove} 
           onMouseUp={() => handleMouseUp(activeTool, canvasRef)} 
           onWheel={handleWheel}
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
                 <GroupComponent
                    key={g.id}
                    group={g}
                    isSelected={selectedId === g.id}
                    onSelect={handleGroupSelect}
                 />
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
                       onClick={handleConnectionClick}
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
           
           <MiniMap 
             pan={pan} scale={scale} groups={groups} nodes={nodes} windowSize={windowSize} 
           />

           <StatsHUD 
             nodesLength={nodes.length} connectionsLength={connections.length} setShowHelp={setShowHelp} 
           />
        </main>

        <PropertyPanel 
           selectedId={selectedId} selectedType={selectedType}
           nodes={nodes} connections={connections} groups={groups}
           setNodes={setNodes} setConnections={setConnections} setGroups={setGroups}
           setSelectedId={(id: string | null) => selectElement(id, selectedType)} addToHistory={recordHistory}
           deleteSelected={deleteSelected}
           theme={theme}
        />
      </div>

       {/* Modals & Overlays */}
       <ReviewModal 
          reviewResult={reviewResult} 
          onClose={useCallback(() => setReviewResult(null), [])} 
          theme={theme} 
       />

       <HelpModal 
          isOpen={showHelp} 
          onClose={useCallback(() => setShowHelp(false), [])} 
          onOpenTutorial={useCallback(() => setShowTutorial(true), [])} 
       />

       <SystemDesignTutorial 
          isOpen={showTutorial} 
          onClose={useCallback(() => setShowTutorial(false), [])} 
       />

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
