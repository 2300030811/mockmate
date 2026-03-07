import { NodeType } from "./constants";

export interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  name: string;
  metadata?: Record<string, string>;
  groupId?: string | null;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface Group {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}
