import { useCallback } from "react";
import { toast } from "sonner";
import { Node, Connection, Group } from "../types";
import { NodeType, TEMPLATES, GRID_SIZE } from "../constants";
import { layoutNodesGrid, layoutNodesLayered, layoutNodesEventFlow } from "../utils";

interface UseSystemDesignOperationsProps {
  nodes: Node[];
  connections: Connection[];
  groups: Group[];
  dispatch: any;
  pan: { x: number; y: number };
  scale: number;
  recordHistory: (nodes: Node[], connections: Connection[], groups: Group[]) => void;
  selectElement: (id: string, type: "node" | "connection" | "group") => void;
  clearSelection: () => void;
  selectedId: string | null;
  selectedType: "node" | "connection" | "group" | null;
}

export function useSystemDesignOperations({
  nodes,
  connections,
  groups,
  dispatch,
  pan,
  scale,
  recordHistory,
  selectElement,
  clearSelection,
  selectedId,
  selectedType,
}: UseSystemDesignOperationsProps) {
  
  const addNode = useCallback((type: NodeType) => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      type,
      x: Math.round((-pan.x + (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2) / (scale * GRID_SIZE)) * GRID_SIZE,
      y: Math.round((-pan.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) / (scale * GRID_SIZE)) * GRID_SIZE,
      name: type,
      metadata: {}
    };
    dispatch({ type: "ADD_NODE", node: newNode });
    recordHistory([...nodes, newNode], connections, groups);
    selectElement(newNode.id, "node");
    toast.success(`Added ${type}`);
  }, [pan, scale, nodes, connections, groups, recordHistory, selectElement, dispatch]);

  const addGroup = useCallback(() => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: "Container",
      x: Math.round((-pan.x + (typeof window !== 'undefined' ? window.innerWidth : 1200) / 4) / scale / GRID_SIZE) * GRID_SIZE,
      y: Math.round((-pan.y + (typeof window !== 'undefined' ? window.innerHeight : 800) / 4) / scale / GRID_SIZE) * GRID_SIZE,
      w: 400,
      h: 300,
      color: "rgba(99, 102, 241, 0.1)"
    };
    dispatch({ type: "ADD_GROUP", group: newGroup });
    recordHistory(nodes, connections, [...groups, newGroup]);
    selectElement(newGroup.id, "group");
  }, [pan, scale, nodes, connections, groups, recordHistory, selectElement, dispatch]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    if (selectedType === "node") {
      dispatch({ type: "DELETE_NODE", id: selectedId });
      recordHistory(
        nodes.filter(n => n.id !== selectedId),
        connections.filter(c => c.from !== selectedId && c.to !== selectedId),
        groups
      );
    } else if (selectedType === "connection") {
      dispatch({ type: "DELETE_CONNECTION", id: selectedId });
      recordHistory(nodes, connections.filter(c => c.id !== selectedId), groups);
    } else if (selectedType === "group") {
      dispatch({ type: "DELETE_GROUP", id: selectedId });
      recordHistory(nodes, connections, groups.filter(g => g.id !== selectedId));
    }
    clearSelection();
  }, [selectedId, selectedType, nodes, connections, groups, recordHistory, clearSelection, dispatch]);

  const insertTemplate = useCallback((stack: keyof typeof TEMPLATES) => {
    const base = Date.now(); // Template nodes index can still use Date.now() as a seed or use UUIDs
    const center = { x: -pan.x / scale + 400, y: -pan.y / scale + 300 };
    const template = TEMPLATES[stack];

    const newNodes: Node[] = template.nodes.map((n: any, i: number) => ({
      id: crypto.randomUUID(),
      type: n.type,
      x: center.x + n.dx,
      y: center.y + n.dy,
      name: n.name,
      metadata: {}
    }));

    const newConns: Connection[] = template.connections.map((c: any, i: number) => ({
      id: crypto.randomUUID(),
      from: newNodes[c.fromIdx].id,
      to: newNodes[c.toIdx].id,
      label: c.label
    }));

    dispatch({ type: "INSERT_TEMPLATE", nodes: newNodes, connections: newConns });
    recordHistory([...nodes, ...newNodes], [...connections, ...newConns], groups);
  }, [pan, scale, nodes, connections, groups, recordHistory, dispatch]);

  const clearCanvas = useCallback(() => {
    if (nodes.length === 0 && connections.length === 0 && groups.length === 0) return;
    if (window.confirm("Are you sure you want to clear the entire workspace? This cannot be undone.")) {
      dispatch({ type: "CLEAR_CANVAS" });
      recordHistory([], [], []);
      toast.success("Workspace cleared");
    }
  }, [nodes.length, connections.length, groups.length, recordHistory, dispatch]);

  const autoAlignNodes = useCallback((type: 'grid' | 'layered' | 'flow' = 'grid') => {
    console.log("AUTO LAYOUT RUN:", type);
    if (nodes.length === 0) return;
    let nextNodes: Node[] = [];
    if (type === 'layered') {
      nextNodes = layoutNodesLayered(nodes);
    } else if (type === 'flow') {
      nextNodes = layoutNodesEventFlow(nodes, connections);
    } else {
      nextNodes = layoutNodesGrid(nodes);
    }
    dispatch({ type: "LOAD_STATE", state: { nodes: nextNodes } });
    recordHistory(nextNodes, connections, groups);
    toast.success(`Nodes aligned to ${type} layout`);
  }, [nodes, connections, groups, recordHistory, dispatch]);

  return { addNode, addGroup, deleteSelected, insertTemplate, clearCanvas, autoAlignNodes };
}
