import { describe, it, expect } from "vitest";
import { Node, Connection } from "./types";
import { layoutNodesGrid, layoutNodesLayered, layoutNodesEventFlow } from "./utils";
import { getChallengeChecklist } from "./components/StatsHUD";

describe("System Design Layout Utilities", () => {
  const mockNodes: Node[] = [
    { id: "n1", type: "Client", x: 0, y: 0, name: "Client" },
    { id: "n2", type: "Load Balancer", x: 0, y: 0, name: "LB" },
    { id: "n3", type: "Database", x: 0, y: 0, name: "DB" },
  ];

  it("should position nodes in a grid layout", () => {
    const result = layoutNodesGrid(mockNodes);
    expect(result).toHaveLength(3);
    expect(result[0].x).toBe(100);
    expect(result[0].y).toBe(100);
    expect(result[1].x).toBe(300);
    expect(result[1].y).toBe(100);
  });

  it("should position nodes in logical tier columns in layered layout", () => {
    const result = layoutNodesLayered(mockNodes);
    expect(result).toHaveLength(3);
    // Client should be in layer 0 (x = 100)
    // LB should be in layer 1 (x = 320)
    // DB should be in layer 3 (x = 540 since layer 2 is empty and compressed)
    const clientNode = result.find(n => n.type === "Client")!;
    const lbNode = result.find(n => n.type === "Load Balancer")!;
    const dbNode = result.find(n => n.type === "Database")!;

    expect(clientNode.x).toBe(100);
    expect(lbNode.x).toBe(320);
    expect(dbNode.x).toBe(540);
  });

  it("should position nodes in BFS depth columns in event flow layout", () => {
    const connections: Connection[] = [
      { id: "c1", from: "n1", to: "n2" },
      { id: "c2", from: "n2", to: "n3" },
    ];
    const result = layoutNodesEventFlow(mockNodes, connections);
    expect(result).toHaveLength(3);
    // n1 (Client, source) -> depth 0 (x = 100)
    // n2 (LB) -> depth 1 (x = 320)
    // n3 (DB) -> depth 2 (x = 540)
    const n1 = result.find(n => n.id === "n1")!;
    const n2 = result.find(n => n.id === "n2")!;
    const n3 = result.find(n => n.id === "n3")!;

    expect(n1.x).toBe(100);
    expect(n2.x).toBe(320);
    expect(n3.x).toBe(540);
  });
});

describe("System Design Challenge Checklist Heuristics", () => {
  it("should return correct status checks for Global URL Shortener challenge", () => {
    const nodes: Node[] = [
      { id: "1", type: "Client", x: 0, y: 0, name: "User" },
      { id: "2", type: "Load Balancer", x: 0, y: 0, name: "LB" },
    ];

    const checklist = getChallengeChecklist("url-shortener", nodes);
    expect(checklist).toHaveLength(4);
    
    const lbCheck = checklist.find(c => c.name === "Load Balancer")!;
    const cacheCheck = checklist.find(c => c.name === "Cache Layer")!;
    const dbCheck = checklist.find(c => c.name === "Database Redundancy")!;

    expect(lbCheck.passed).toBe(true);
    expect(cacheCheck.passed).toBe(false);
    expect(dbCheck.passed).toBe(false); // No DB is also not >= 2 DBs
  });
});
