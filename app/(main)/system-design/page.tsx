"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// --- Extracted Parts ---
import { Node, Connection, Group } from "./types";
import { GRID_SIZE, NodeType, TEMPLATES } from "./constants";
import { CHALLENGES } from "./challenges";
import { saveSystemDesignAction } from "../../actions/system-design";

import { ChallengePanel } from "./components/ChallengePanel";
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
import { DotGrid } from "./components/DotGrid";

// --- Custom Hooks ---
import { useSystemDesignCanvas } from "./hooks/useSystemDesignCanvas";
import { useSystemDesignHistory } from "./hooks/useSystemDesignHistory";
import { useCanvasControls } from "./hooks/useCanvasControls";
import { useSelection } from "./hooks/useSelection";
import { useSystemDesignPersistence } from "./hooks/useSystemDesignPersistence";

// --- Decomposed Refactored Hooks ---
import { useSystemDesignOperations } from "./hooks/useSystemDesignOperations";
import { useSystemDesignReview } from "./hooks/useSystemDesignReview";
import { useSystemDesignExport } from "./hooks/useSystemDesignExport";
import { useSystemDesignKeyboardShortcuts } from "./hooks/useSystemDesignKeyboardShortcuts";

export default function SystemDesignCanvas() {
  const { state, dispatch, nodes, connections, groups } = useSystemDesignCanvas();

  const {
    historyIndex, historyLength,
    setInitialHistory, addToHistory,
    undo: undoHistory, redo: redoHistory
  } = useSystemDesignHistory({ nodes: [], connections: [], groups: [] });

  const {
    pan, setPan, scale, setScale,
    handleMouseDown, handleMouseMove, handleMouseUp, handleWheel
  } = useCanvasControls();

  const { selectedId, selectedType, selectElement, clearSelection } = useSelection();

  // --- UI & Environment State ---
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isChallengePanelOpen, setIsChallengePanelOpen] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pendingHistorySnapshot, setPendingHistorySnapshot] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useSystemDesignPersistence({
    nodes, connections, groups, theme: state.theme, dispatch, setInitialHistory
  });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Action Wrappers ---
  const recordHistory = useCallback((n: Node[], c: Connection[], g: Group[]) => {
    addToHistory({ nodes: n, connections: c, groups: g });
  }, [addToHistory]);

  useEffect(() => {
    if (pendingHistorySnapshot) {
      recordHistory(nodes, connections, groups);
      setPendingHistorySnapshot(false);
    }
  }, [pendingHistorySnapshot, nodes, connections, groups, recordHistory]);

  const undo = useCallback(() => {
    const prev = undoHistory();
    if (prev) {
      dispatch({ type: "LOAD_STATE", state: { nodes: prev.nodes, connections: prev.connections, groups: prev.groups } });
    }
  }, [undoHistory, dispatch]);

  const redo = useCallback(() => {
    const next = redoHistory();
    if (next) {
      dispatch({ type: "LOAD_STATE", state: { nodes: next.nodes, connections: next.connections, groups: next.groups } });
    }
  }, [redoHistory, dispatch]);

  const saveDesign = useCallback(async () => {
    const payload = {
      id: currentDesignId || undefined,
      title: state.activeChallengeId ? CHALLENGES.find(c => c.id === state.activeChallengeId)?.title : "Untitled Design",
      nodes,
      connections,
      groups,
      ai_score: state.reviewScore,
      ai_review: state.reviewResult || undefined,
      challenge_id: state.activeChallengeId || undefined
    };

    const result = await saveSystemDesignAction(payload);
    if (result.error) {
      toast.error(result.error);
    } else {
      if (!currentDesignId && result.data?.id) {
        setCurrentDesignId(result.data.id);
      }
      toast.success("Design saved to cloud");
    }
  }, [currentDesignId, nodes, connections, groups, state.reviewScore, state.reviewResult, state.activeChallengeId]);

  // --- Decomposed Hook Instances ---
  const { addNode, addGroup, deleteSelected, insertTemplate, clearCanvas, autoAlignNodes } = useSystemDesignOperations({
    nodes, connections, groups, dispatch, pan, scale, recordHistory, selectElement, clearSelection, selectedId, selectedType
  });

  const { handleReview, onCloseReview } = useSystemDesignReview({
    nodes, connections, activeChallengeId: state.activeChallengeId, dispatch
  });

  const { exportSVG, copyJSON } = useSystemDesignExport({
    nodes, connections, groups, svgRef
  });

  useSystemDesignKeyboardShortcuts({
    dispatch, deleteSelected, undo, redo, saveDesign, canvasRef
  });

  // --- Local Handlers ---
  const onSelectChallenge = useCallback((id: string | null) => {
    dispatch({ type: "SET_CHALLENGE", id });
    if (id) {
      toast.success(`Challenge Active: ${CHALLENGES.find(c => c.id === id)?.title}`);
    }
  }, [dispatch]);

  const handleConnectionClick = useCallback((id: string) => {
    selectElement(id, "connection");
  }, [selectElement]);
  
  const handleConnectionDoubleClick = useCallback((id: string) => {
    selectElement(id, "connection");
    dispatch({ type: "FOCUS_CONNECTION_LABEL", id });
  }, [selectElement, dispatch]);

  const handleGroupSelect = useCallback((id: string, type: "group") => {
    selectElement(id, type);
  }, [selectElement]);

  const updateNodePos = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: "MOVE_NODE", id, x, y });
  }, [dispatch]);

  const handleNodeClick = useCallback((id: string) => {
    console.log("NODE CLICK:", id);
    console.log("activeTool =", state.activeTool);
    console.log("connectStart =", state.connectStart);

    if (state.activeTool === "Connect") {
      if (!state.connectStart) {
        dispatch({ type: "SET_CONNECT_START", startId: id });
        toast("Select target node...", { icon: <ArrowRight size={14} /> });
      } else if (state.connectStart !== id) {
        const exists = connections.some(c => (c.from === state.connectStart && c.to === id) || (c.from === id && c.to === state.connectStart));
        if (!exists) {
          const fromNode = nodes.find(n => n.id === state.connectStart);
          const toNode = nodes.find(n => n.id === id);

          let defaultLabel = "Interface";
          if (fromNode && toNode) {
            if (fromNode.type === "Client" && toNode.type === "Load Balancer") defaultLabel = "HTTPS / TCP";
            else if (toNode.type === "Database") defaultLabel = "Query / SQL";
            else if (toNode.type === "Cache") defaultLabel = "Cache Hit/Miss";
            else if (fromNode.type === "Message Queue") defaultLabel = "Consume / Poll";
            else if (toNode.type === "Message Queue") defaultLabel = "Publish Event";
            else if (fromNode.type === "CDN" || toNode.type === "CDN") defaultLabel = "Static Assets";
            else if (fromNode.type === "Microservice" && toNode.type === "Microservice") defaultLabel = "gRPC / REST";
            else defaultLabel = "Data Flow";
          }

          const nc: Connection = { id: crypto.randomUUID(), from: state.connectStart, to: id, label: defaultLabel };
          dispatch({ type: "ADD_CONNECTION", connection: nc });
          recordHistory(nodes, [...connections, nc], groups);
          toast.success("Link established");
        }
        dispatch({ type: "SET_CONNECT_START", startId: null });
        dispatch({ type: "SET_TOOL", tool: "Select" });
      }
    } else {
      selectElement(id, "node");
    }
  }, [state.activeTool, state.connectStart, connections, nodes, groups, recordHistory, selectElement, dispatch]);

  const handleMouseMoveWrapper = useCallback((e: React.MouseEvent) => {
    handleMouseMove(e);
    if (state.activeTool === "Connect" && state.connectStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({
          x: (e.clientX - rect.left - pan.x) / scale,
          y: (e.clientY - rect.top - pan.y) / scale
        });
      }
    }
  }, [handleMouseMove, state.activeTool, state.connectStart, pan, scale]);

  const onCloseHelp = useCallback(() => dispatch({ type: "SET_SHOW_HELP", show: false }), [dispatch]);
  const onOpenTutorial = useCallback(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: true }), [dispatch]);
  const onCloseTutorial = useCallback(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: false }), [dispatch]);

  const handleHighlightIssue = useCallback((issueText: string) => {
    const text = issueText.toLowerCase();
    let targetType: NodeType | null = null;
    
    if (text.includes("db") || text.includes("database") || text.includes("spof")) {
      targetType = "Database";
    } else if (text.includes("cache") || text.includes("redis")) {
      targetType = "Cache";
    } else if (text.includes("cdn") || text.includes("cloudfront")) {
      targetType = "CDN";
    } else if (text.includes("load balancer") || text.includes("lb")) {
      targetType = "Load Balancer";
    } else if (text.includes("queue") || text.includes("kafka") || text.includes("mq") || text.includes("pubsub")) {
      targetType = "Message Queue";
    }
    
    if (targetType) {
      const targetNode = nodes.find(n => n.type === targetType);
      if (targetNode) {
        selectElement(targetNode.id, "node");
        toast.success(`Highlighted active ${targetType} component on canvas`, { icon: "🔍" });
      } else {
        toast.error(`No active ${targetType} component found in your design`);
      }
    }
  }, [nodes, selectElement]);

  // Triple-click Auto-Align listener
  const lastClickTime = useRef(0);
  const clickCount = useRef(0);
  
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (state.activeTool === "Connect") return;
    if (e.target !== canvasRef.current && e.target !== svgRef.current) return;
    
    const now = Date.now();
    if (now - lastClickTime.current < 400) {
      clickCount.current += 1;
      if (clickCount.current === 3) {
        autoAlignNodes();
        clickCount.current = 0;
      }
    } else {
      clickCount.current = 1;
    }
    lastClickTime.current = now;
  }, [autoAlignNodes, state.activeTool]);

  const selectedItem = useMemo(() => {
    if (selectedType === "node") return nodes.find(n => n.id === selectedId) || null;
    if (selectedType === "connection") return connections.find(c => c.id === selectedId) || null;
    if (selectedType === "group") return groups.find(g => g.id === selectedId) || null;
    return null;
  }, [selectedId, selectedType, nodes, connections, groups]);

  // Map Optimization: O(1) lookups during render
  const ConnectionsLayer = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    return (
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10" onClick={handleCanvasClick}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>
        {connections.map(c => (
          <ConnectionLine
            key={c.id} connection={c}
            fromNode={nodeMap.get(c.from)}
            toNode={nodeMap.get(c.to)}
            isSelected={selectedId === c.id}
            onClick={handleConnectionClick}
            onDoubleClick={handleConnectionDoubleClick}
            theme={state.theme}
          />
        ))}
      </svg>
    );
  }, [connections, nodes, selectedId, handleConnectionClick, handleConnectionDoubleClick, state.theme, handleCanvasClick]);

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans antialiased transition-colors duration-500 ${state.theme === "light" ? "bg-gray-50 text-gray-900 selection:bg-indigo-500/30" :
      state.theme === "neo" ? "bg-[#02000a] text-cyan-50 selection:bg-fuchsia-500/30" : "bg-[#050505] text-white selection:bg-indigo-500/30"
      }`}>

      <CanvasHeader
        undo={undo} redo={redo} historyIndex={historyIndex} historyLength={historyLength}
        setPan={setPan} setScale={setScale} scale={scale}
        showGrid={state.showGrid} setShowGrid={() => dispatch({ type: "TOGGLE_GRID" })}
        exportSVG={exportSVG} copyJSON={copyJSON}
        handleReview={handleReview} isReviewing={state.isReviewing}
        nodesLength={nodes.length}
        theme={state.theme} setTheme={(t) => dispatch({ type: "SET_THEME", theme: t })}
        clearCanvas={clearCanvas}
        saveDesign={saveDesign}
        toggleChallengePanel={() => setIsChallengePanelOpen(!isChallengePanelOpen)}
        autoAlignNodes={autoAlignNodes}
      />

      <div className="flex-1 flex overflow-hidden">
        {isChallengePanelOpen && (
          <ChallengePanel
            activeChallengeId={state.activeChallengeId}
            onSelectChallenge={onSelectChallenge}
            theme={state.theme}
          />
        )}

        <Toolbar
          activeTool={state.activeTool} setActiveTool={(t) => dispatch({ type: "SET_TOOL", tool: t })}
          addGroup={addGroup} addNode={addNode}
          insertTemplate={insertTemplate}
          theme={state.theme}
        />

        <main
          id="sd-canvas"
          ref={canvasRef}
          onMouseDown={(e) => handleMouseDown(e, state.activeTool, canvasRef)}
          onMouseMove={handleMouseMoveWrapper}
          onMouseUp={() => handleMouseUp(state.activeTool, canvasRef)}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          className={`flex-1 relative overflow-hidden select-none outline-none transition-colors duration-500 ${state.theme === "light" ? "bg-white" :
            state.theme === "neo" ? "bg-[#050212]" : "bg-[#030303]"
            }`}
          style={{ cursor: state.activeTool === "Pan" ? 'grab' : 'crosshair' }}
        >
          {/* AI Scanning Overlay */}
          <AnimatePresence>
            {state.isReviewing && (
              <m.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-[2px] pointer-events-none flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <m.div
                    animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-2 border-dashed border-indigo-500/30 rounded-full"
                  />
                  <m.div
                    animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles size={32} className="text-indigo-500" />
                  </m.div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Deep Scanning Architecture...</p>
              </m.div>
            )}
          </AnimatePresence>
          {/* Visual Guides */}
          {state.showGrid && (
            <DotGrid theme={state.theme} pan={pan} scale={scale} />
          )}

          <m.div
            className="w-full h-full relative origin-top-left will-change-transform pointer-events-none"
            style={{ x: pan.x, y: pan.y, scale }}
          >
            {/* Groups Layer */}
            {groups.map(g => (
              <GroupComponent
                key={g.id}
                group={g}
                isSelected={selectedId === g.id}
                onSelect={handleGroupSelect}
                updatePos={(id, x, y, lockChildren) => dispatch({ type: "UPDATE_GROUP_POS", id, x, y, lockChildren })}
                updateSize={(id, w, h) => dispatch({ type: "UPDATE_GROUP", id, updates: { w, h } })}
                onDragStateEnd={() => setPendingHistorySnapshot(true)}
                theme={state.theme}
                nodes={nodes}
                groups={groups}
              />
            ))}

            {/* Connections Layer (Memoized inside) */}
            {ConnectionsLayer}

            {/* Nodes Layer */}
            <AnimatePresence>
              {nodes.map(n => (
                <NodeComponent
                  key={n.id} node={n} scale={scale}
                  isSelected={selectedId === n.id}
                  isConnecting={state.connectStart === n.id}
                  onDelete={deleteSelected}
                  onNodeClick={handleNodeClick}
                  updatePos={updateNodePos}
                  onDragStateEnd={() => setPendingHistorySnapshot(true)}
                  theme={state.theme}
                />
              ))}
            </AnimatePresence>

            {/* Ghost Connection Line */}
            {state.activeTool === "Connect" && state.connectStart && (() => {
              const startNode = nodes.find(n => n.id === state.connectStart);
              if (!startNode) return null;
              const x1 = startNode.x + 48;
              const y1 = startNode.y + 48;
              return (
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[15]">
                  <line
                    x1={x1} y1={y1} x2={mousePos.x} y2={mousePos.y}
                    stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"
                  />
                  <circle cx={mousePos.x} cy={mousePos.y} r="4" fill="#6366f1" opacity="0.5" />
                </svg>
              );
            })()}
          </m.div>

          <MiniMap
            pan={pan} scale={scale} groups={groups} nodes={nodes} windowSize={windowSize} theme={state.theme}
          />

          <StatsHUD
            nodes={nodes}
            connections={connections}
            theme={state.theme}
            activeChallengeId={state.activeChallengeId}
            setShowHelp={() => dispatch({ type: "SET_SHOW_HELP", show: true })}
          />
        </main>

        <PropertyPanel
          selectedItem={selectedItem}
          selectedType={selectedType}
          nodes={nodes} connections={connections} groups={groups}
          onUpdateNodes={(updates: Partial<Node>) => { if(selectedId) dispatch({ type: "UPDATE_NODE", id: selectedId, updates }); }}
          onUpdateConnections={(updates: Partial<Connection>) => { if(selectedId) dispatch({ type: "UPDATE_CONNECTION", id: selectedId, updates }); }}
          onUpdateGroups={(updates: Partial<Group>) => { if(selectedId) dispatch({ type: "UPDATE_GROUP", id: selectedId, updates }); }}
          setSelectedId={(id: string | null) => selectElement(id, selectedType)} 
          addToHistory={recordHistory}
          deleteSelected={deleteSelected}
          theme={state.theme}
          focusConnectionId={state.focusConnectionId}
          clearConnectionFocus={() => dispatch({ type: "FOCUS_CONNECTION_LABEL", id: null })}
        />
      </div>

      <ReviewModal
        reviewResult={state.reviewResult}
        score={state.reviewScore}
        onClose={onCloseReview}
        theme={state.theme}
        onHighlightIssue={handleHighlightIssue}
      />

      <HelpModal
        isOpen={state.showHelp}
        onClose={onCloseHelp}
        onOpenTutorial={onOpenTutorial}
      />

      <SystemDesignTutorial
        isOpen={state.showTutorial}
        onClose={onCloseTutorial}
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
      `}</style>
    </div>
  );
}
