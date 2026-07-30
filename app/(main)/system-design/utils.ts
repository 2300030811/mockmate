import { Node, Connection, Group } from "./types";

export const isInputActive = () => {
    if (typeof window === 'undefined') return false;
    const el = document.activeElement;
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
};

export const getSnappedPos = (x: number, y: number, gridSize: number) => {
    return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
    };
};

export function moveGroupAndChildren(groups: Group[], nodes: Node[], id: string, x: number, y: number, lockChildren: boolean = false) {
    const g = groups.find(group => group.id === id);
    if (!g) return { groups, nodes };
    const dx = x - g.x;
    const dy = y - g.y;
    const nextGroups = groups.map(group => group.id === id ? { ...group, x, y } : group);
    const nextNodes = lockChildren 
      ? nodes // Keep children locked in place
      : nodes.map(n => n.groupId === id ? { ...n, x: n.x + dx, y: n.y + dy } : n);
    return { groups: nextGroups, nodes: nextNodes };
}

export function moveNodeAndCheckContainment(groups: Group[], nodes: Node[], id: string, x: number, y: number) {
    let groupId: string | null = null;
    for (const g of groups) {
      if (x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h) {
        groupId = g.id;
        break;
      }
    }
    const nextNodes = nodes.map(n => n.id === id ? { ...n, x, y, groupId } : n);
    return { nodes: nextNodes, groupId };
}

export function layoutNodesGrid(nodes: Node[]): Node[] {
    if (nodes.length === 0) return nodes;
    
    // Sort nodes by their current Y then X to roughly preserve relative ordering
    const sortedNodes = [...nodes].sort((a, b) => a.y - b.y || a.x - b.x);
    
    // Position them in a grid
    const cols = Math.ceil(Math.sqrt(sortedNodes.length));
    const startX = 100;
    const startY = 100;
    const gapX = 200;
    const gapY = 200;
    
    return sortedNodes.map((node, index) => {
      const r = Math.floor(index / cols);
      const c = index % cols;
      return {
        ...node,
        x: startX + c * gapX,
        y: startY + r * gapY
      };
    });
}

export function layoutNodesLayered(nodes: Node[]): Node[] {
    if (nodes.length === 0) return nodes;

    const getLayer = (type: string): number => {
        switch (type) {
            case "Client":
            case "DNS":
            case "Firewall":
                return 0;
            case "CDN":
            case "API Gateway":
            case "Load Balancer":
            case "3rd Party API":
                return 1;
            case "Web Server":
            case "Microservice":
            case "Worker":
            case "Message Queue":
                return 2;
            case "Cache":
            case "Database":
            case "Storage":
                return 3;
            default:
                return 2;
        }
    };

    // Group by layer
    const layers: Record<number, Node[]> = { 0: [], 1: [], 2: [], 3: [] };
    nodes.forEach(node => {
        const l = getLayer(node.type);
        layers[l].push(node);
    });

    // Filter out empty layers to compact layout
    const activeLayers = [0, 1, 2, 3].filter(l => layers[l].length > 0);

    const startX = 100;
    const startY = 100;
    const gapX = 220;
    const gapY = 160;

    const result: Node[] = [];
    activeLayers.forEach((layerIdx, colIdx) => {
        const layerNodes = layers[layerIdx];
        layerNodes.sort((a, b) => a.y - b.y);
        layerNodes.forEach((node, rowIdx) => {
            result.push({
                ...node,
                x: startX + colIdx * gapX,
                y: startY + rowIdx * gapY
            });
        });
    });

    return result;
}

export function layoutNodesEventFlow(nodes: Node[], connections: Connection[]): Node[] {
    if (nodes.length === 0) return nodes;

    // Build adjacency list & calculate in-degrees
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    nodes.forEach(n => {
        adj.set(n.id, []);
        inDegree.set(n.id, 0);
    });

    connections.forEach(c => {
        if (adj.has(c.from) && adj.has(c.to)) {
            adj.get(c.from)!.push(c.to);
            inDegree.set(c.to, (inDegree.get(c.to) || 0) + 1);
        }
    });

    // Find sources
    const sources = nodes.filter(n => (inDegree.get(n.id) || 0) === 0);
    const queue: string[] = [];
    const depth = new Map<string, number>();

    if (sources.length > 0) {
        sources.forEach(s => {
            queue.push(s.id);
            depth.set(s.id, 0);
        });
    } else {
        const first = nodes[0];
        queue.push(first.id);
        depth.set(first.id, 0);
    }

    // BFS to assign depths
    const visited = new Set<string>();
    while (queue.length > 0) {
        const curr = queue.shift()!;
        if (visited.has(curr)) continue;
        visited.add(curr);

        const currDepth = depth.get(curr) || 0;
        const neighbors = adj.get(curr) || [];
        neighbors.forEach(next => {
            if (!depth.has(next) || depth.get(next)! < currDepth + 1) {
                depth.set(next, currDepth + 1);
            }
            if (!visited.has(next)) {
                queue.push(next);
            }
        });
    }

    // Assign any unvisited/disconnected nodes to depth 0
    nodes.forEach(n => {
        if (!depth.has(n.id)) {
            depth.set(n.id, 0);
        }
    });

    // Group by depth
    const groupsByDepth = new Map<number, Node[]>();
    nodes.forEach(n => {
        const d = depth.get(n.id) || 0;
        if (!groupsByDepth.has(d)) {
            groupsByDepth.set(d, []);
        }
        groupsByDepth.get(d)!.push(n);
    });

    // Sort depth keys
    const sortedDepths = Array.from(groupsByDepth.keys()).sort((a, b) => a - b);

    const startX = 100;
    const startY = 100;
    const gapX = 220;
    const gapY = 160;

    const result: Node[] = [];
    sortedDepths.forEach((d, colIdx) => {
        const depthNodes = groupsByDepth.get(d) || [];
        depthNodes.sort((a, b) => a.y - b.y);
        depthNodes.forEach((node, rowIdx) => {
            result.push({
                ...node,
                x: startX + colIdx * gapX,
                y: startY + rowIdx * gapY
            });
        });
    });

    return result;
}
