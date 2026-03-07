"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
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
import { NODE_CONFIG, GRID_SIZE, NodeType, TEMPLATES } from "./constants";
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

// --- Custom Hooks ---
import { useSystemDesignHistory } from "./hooks/useSystemDesignHistory";
import { useCanvasControls } from "./hooks/useCanvasControls";
import { useSelection } from "./hooks/useSelection";
import { useSystemDesignCanvas } from "./hooks/useSystemDesignCanvas";
import { isInputActive } from "./utils";
import { DotGrid } from "./components/DotGrid";

export default function SystemDesignCanvas() {
  const { state, dispatch, nodes, connections, groups } = useSystemDesignCanvas();

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

  // --- Persistence State ---
  const [hasLoaded, setHasLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isChallengePanelOpen, setIsChallengePanelOpen] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Persistence Logic ---
  useEffect(() => {
    const saved = localStorage.getItem('mockmate-design-pro-v3');
    const savedTheme = localStorage.getItem('mockmate-design-theme') as any;
    if (savedTheme) dispatch({ type: "SET_THEME", theme: savedTheme });

    if (saved) {
      try {
        const p = JSON.parse(saved);
        dispatch({
          type: "LOAD_STATE", state: {
            nodes: p.nodes || [],
            connections: p.connections || [],
            groups: p.groups || []
          }
        });
        setInitialHistory({ nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] });
      } catch (e) {
        const old = localStorage.getItem('mockmate-design-pro');
        if (old) {
          const p = JSON.parse(old);
          const initial = { nodes: p.nodes || [], connections: p.connections || [], groups: p.groups || [] };
          dispatch({ type: "LOAD_STATE", state: initial });
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
      setTimeout(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: true }), 1500);
    }

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, setInitialHistory]);

  // Debounced Save
  useEffect(() => {
    if (!hasLoaded) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const data = { nodes, connections, groups, timestamp: Date.now() };
      localStorage.setItem('mockmate-design-pro-v3', JSON.stringify(data));
      localStorage.setItem('mockmate-design-theme', state.theme);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, connections, groups, state.theme, hasLoaded]);

  // --- Wrapper Handlers ---
  const recordHistory = useCallback((n: Node[], c: Connection[], g: Group[]) => {
    addToHistory({ nodes: n, connections: c, groups: g });
  }, [addToHistory]);

  const undo = useCallback(() => {
    const prev = undoHistory();
    if (prev) {
      dispatch({
        type: "LOAD_STATE", state: {
          nodes: prev.nodes,
          connections: prev.connections,
          groups: prev.groups
        }
      });
    }
  }, [undoHistory, dispatch]);

  const redo = useCallback(() => {
    const next = redoHistory();
    if (next) {
      dispatch({
        type: "LOAD_STATE", state: {
          nodes: next.nodes,
          connections: next.connections,
          groups: next.groups
        }
      });
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

  const onSelectChallenge = useCallback((id: string | null) => {
    dispatch({ type: "SET_CHALLENGE", id });
    if (id) {
      toast.success(`Challenge Active: ${CHALLENGES.find(c => c.id === id)?.title}`);
    }
  }, [dispatch]);

  const handleConnectionClick = useCallback((id: string) => {
    selectElement(id, "connection");
  }, [selectElement]);

  const handleGroupSelect = useCallback((id: string, type: "group") => {
    selectElement(id, type);
  }, [selectElement]);

  const updateNodePos = useCallback((id: string, x: number, y: number) => {
    // Check for group containment
    let groupId: string | null = null;
    for (const g of groups) {
      if (x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h) {
        groupId = g.id;
        break;
      }
    }

    dispatch({ type: "MOVE_NODE", id, x, y, groupId });

    const nextNodes = nodes.map(n => n.id === id ? { ...n, x, y, groupId } : n);
    recordHistory(nextNodes, connections, groups);
  }, [connections, groups, recordHistory, dispatch, nodes]);

  const updateGroupPos = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: "UPDATE_GROUP_POS", id, x, y });
    const g = groups.find(x => x.id === id);
    if (!g) return;
    const dx = x - g.x;
    const dy = y - g.y;
    const nextG = groups.map(group => group.id === id ? { ...group, x, y } : group);
    const nextN = nodes.map(n => n.groupId === id ? { ...n, x: n.x + dx, y: n.y + dy } : n);
    recordHistory(nextN, connections, nextG);
  }, [groups, nodes, connections, recordHistory, dispatch]);

  const updateGroupSize = useCallback((id: string, w: number, h: number) => {
    dispatch({ type: "UPDATE_GROUP_SIZE", id, w, h });
    const nextG = groups.map(g => g.id === id ? { ...g, w, h } : g);
    recordHistory(nodes, connections, nextG);
  }, [groups, nodes, connections, recordHistory, dispatch]);

  const handleNodeClick = useCallback((id: string) => {
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

          const nc = { id: `c-${Date.now()}`, from: state.connectStart, to: id, label: defaultLabel };
          const nx = [...connections, nc];
          dispatch({ type: "SET_CONNECTIONS", connections: nx });
          recordHistory(nodes, nx, groups);
          toast.success("Link established");
        }
        dispatch({ type: "SET_CONNECT_START", startId: null });
        dispatch({ type: "SET_TOOL", tool: "Select" });
      }
    } else {
      selectElement(id, "node");
    }
  }, [state.activeTool, state.connectStart, connections, nodes, groups, recordHistory, selectElement, dispatch]);

  const addNode = useCallback((type: NodeType) => {
    const newNode: Node = {
      id: `n-${Date.now()}`,
      type,
      x: Math.round((-pan.x + (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2) / (scale * GRID_SIZE)) * GRID_SIZE,
      y: Math.round((-pan.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) / (scale * GRID_SIZE)) * GRID_SIZE,
      name: type,
      metadata: {}
    };
    dispatch({ type: "ADD_NODE", node: newNode });
    const next = [...nodes, newNode];
    recordHistory(next, connections, groups);
    selectElement(newNode.id, "node");
    toast.success(`Added ${type}`);
  }, [pan, scale, nodes, connections, groups, recordHistory, selectElement, dispatch]);

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
    dispatch({ type: "ADD_GROUP", group: newGroup });
    const next = [...groups, newGroup];
    recordHistory(nodes, connections, next);
    selectElement(newGroup.id, "group");
  }, [pan, scale, nodes, connections, groups, recordHistory, selectElement, dispatch]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    if (selectedType === "node") {
      const nextN = nodes.filter(n => n.id !== selectedId);
      const nextC = connections.filter(c => c.from !== selectedId && c.to !== selectedId);
      dispatch({ type: "SET_NODES", nodes: nextN });
      dispatch({ type: "SET_CONNECTIONS", connections: nextC });
      recordHistory(nextN, nextC, groups);
    } else if (selectedType === "connection") {
      const nextC = connections.filter(c => c.id !== selectedId);
      dispatch({ type: "SET_CONNECTIONS", connections: nextC });
      recordHistory(nodes, nextC, groups);
    } else if (selectedType === "group") {
      const nextG = groups.filter(g => g.id !== selectedId);
      dispatch({ type: "SET_GROUPS", groups: nextG });
      recordHistory(nodes, connections, nextG);
    }
    clearSelection();
  }, [selectedId, selectedType, nodes, connections, groups, recordHistory, clearSelection, dispatch]);

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

  const insertTemplate = useCallback((stack: keyof typeof TEMPLATES) => {
    const base = Date.now();
    const center = { x: -pan.x / scale + 400, y: -pan.y / scale + 300 };
    const template = TEMPLATES[stack];

    const newNodes: Node[] = template.nodes.map((n: any, i: number) => ({
      id: `${base}-${i}`,
      type: n.type,
      x: center.x + n.dx,
      y: center.y + n.dy,
      name: n.name,
      metadata: {}
    }));

    const newConns: Connection[] = template.connections.map((c: any, i: number) => ({
      id: `${base}-c${i}`,
      from: newNodes[c.fromIdx].id,
      to: newNodes[c.toIdx].id,
      label: c.label
    }));

    const nextN = [...nodes, ...newNodes];
    const nextC = [...connections, ...newConns];
    dispatch({ type: "SET_NODES", nodes: nextN });
    dispatch({ type: "SET_CONNECTIONS", connections: nextC });
    recordHistory(nextN, nextC, groups);
  }, [pan, scale, nodes, connections, groups, recordHistory, dispatch]);

  const handleReview = useCallback(async () => {
    if (nodes.length === 0) return;
    dispatch({ type: "SET_REVIEWING", isReviewing: true });
    try {
      const activeChallenge = CHALLENGES.find(c => c.id === state.activeChallengeId);
      const challengeContext = activeChallenge ? {
        title: activeChallenge.title,
        objectives: activeChallenge.objectives,
        constraints: activeChallenge.constraints
      } : undefined;

      const result = await reviewSystemDesignAction(nodes, connections, challengeContext);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      dispatch({ type: "SET_REVIEW_RESULT", result: result.markdown, score: result.score });
      toast.success("Audit Complete");
    } catch (err) {
      toast.error("Audit Failed");
    } finally {
      dispatch({ type: "SET_REVIEWING", isReviewing: false });
    }
  }, [nodes, connections, state.activeChallengeId, dispatch]);

  const clearCanvas = useCallback(() => {
    if (nodes.length === 0 && connections.length === 0 && groups.length === 0) return;
    if (window.confirm("Are you sure you want to clear the entire workspace? This cannot be undone.")) {
      dispatch({ type: "CLEAR_CANVAS" });
      recordHistory([], [], []);
      toast.success("Workspace cleared");
    }
  }, [nodes.length, connections.length, groups.length, recordHistory, dispatch]);

  const onCloseReview = useCallback(() => dispatch({ type: "SET_REVIEW_RESULT", result: null }), [dispatch]);
  const onCloseHelp = useCallback(() => dispatch({ type: "SET_SHOW_HELP", show: false }), [dispatch]);
  const onOpenTutorial = useCallback(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: true }), [dispatch]);
  const onCloseTutorial = useCallback(() => dispatch({ type: "SET_SHOW_TUTORIAL", show: false }), [dispatch]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isInputActive()) return;
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveDesign(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); dispatch({ type: "SET_SHOW_TUTORIAL", show: true }); }
      if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "SET_TOOL", tool: "Pan" });
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " ") {
        dispatch({ type: "SET_TOOL", tool: "Select" });
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
      }
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [deleteSelected, redo, undo, dispatch]);

  const ConnectionsLayer = useMemo(() => (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
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
          fromNode={nodes.find(n => n.id === c.from)}
          toNode={nodes.find(n => n.id === c.to)}
          isSelected={selectedId === c.id}
          onClick={handleConnectionClick}
          theme={state.theme}
        />
      ))}
    </svg>
  ), [connections, nodes, selectedId, handleConnectionClick]);

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
          {/* Visual Guides - Advanced Dot Grid */}
          {state.showGrid && (
            <DotGrid theme={state.theme} pan={pan} scale={scale} />
          )}

          <m.div
            className="w-full h-full relative origin-top-left will-change-transform"
            style={{ x: pan.x, y: pan.y, scale }}
          >
            {/* Groups Layer */}
            {groups.map(g => (
              <GroupComponent
                key={g.id}
                group={g}
                isSelected={selectedId === g.id}
                onSelect={handleGroupSelect}
                updatePos={updateGroupPos}
                updateSize={updateGroupSize}
                theme={state.theme}
              />
            ))}

            {/* Connections Layer (Memoized inside) */}
            {ConnectionsLayer}

            {/* Nodes Layer - Memoized to prevent re-renders on layout updates */}
            <AnimatePresence>
              {nodes.map(n => (
                <NodeComponent
                  key={n.id} node={n} scale={scale}
                  isSelected={selectedId === n.id}
                  isConnecting={state.connectStart === n.id}
                  onDelete={deleteSelected}
                  onNodeClick={handleNodeClick}
                  updatePos={updateNodePos}
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

          {/* --- Overlays & HUD --- */}

          <MiniMap
            pan={pan} scale={scale} groups={groups} nodes={nodes} windowSize={windowSize} theme={state.theme}
          />

          <StatsHUD
            nodesLength={nodes.length} connectionsLength={connections.length} setShowHelp={() => dispatch({ type: "SET_SHOW_HELP", show: true })}
          />
        </main>

        <PropertyPanel
          selectedItem={useMemo(() => {
            if (selectedType === "node") return nodes.find(n => n.id === selectedId) || null;
            if (selectedType === "connection") return connections.find(c => c.id === selectedId) || null;
            if (selectedType === "group") return groups.find(g => g.id === selectedId) || null;
            return null;
          }, [selectedId, selectedType, nodes, connections, groups])}
          selectedType={selectedType}
          nodes={nodes} connections={connections} groups={groups}
          onUpdateNodes={(n: Node[]) => dispatch({ type: "SET_NODES", nodes: n })}
          onUpdateConnections={(c: Connection[]) => dispatch({ type: "SET_CONNECTIONS", connections: c })}
          onUpdateGroups={(g: Group[]) => dispatch({ type: "SET_GROUPS", groups: g })}
          setSelectedId={(id: string | null) => selectElement(id, selectedType)} addToHistory={recordHistory}
          deleteSelected={deleteSelected}
          theme={state.theme}
        />
      </div>

      {/* Modals & Overlays */}
      <ReviewModal
        reviewResult={state.reviewResult}
        score={state.reviewScore}
        onClose={onCloseReview}
        theme={state.theme}
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
