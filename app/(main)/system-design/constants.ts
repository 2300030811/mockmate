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
  Smartphone,
  Shield,
  Network,
  ServerCog,
  Blocks
} from "lucide-react";

export type NodeType =
  | "Load Balancer"
  | "Web Server"
  | "Database"
  | "Cache"
  | "CDN"
  | "Message Queue"
  | "Client"
  | "Microservice"
  | "Worker"
  | "Storage"
  | "API Gateway"
  | "Firewall"
  | "DNS"
  | "3rd Party API";

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
  "API Gateway": { icon: Network, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/50" },
  "Firewall": { icon: Shield, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/50" },
  "DNS": { icon: ServerCog, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/50" },
  "3rd Party API": { icon: Blocks, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/50" },
};

export const GRID_SIZE = 20;

export const TEMPLATES = {
  Serverless: {
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "End User" },
      { type: "Load Balancer" as NodeType, dx: 150, dy: 0, name: "API Gate" },
      { type: "Microservice" as NodeType, dx: 300, dy: 0, name: "Lambda" },
      { type: "Database" as NodeType, dx: 450, dy: 0, name: "Dynamo" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "JSON" },
      { fromIdx: 1, toIdx: 2, label: "Trigger" },
      { fromIdx: 2, toIdx: 3, label: "Query" },
    ]
  },
  Web: {
    nodes: [
      { type: "CDN" as NodeType, dx: 0, dy: 0, name: "CloudFront" },
      { type: "Load Balancer" as NodeType, dx: 150, dy: 0, name: "ALB" },
      { type: "Web Server" as NodeType, dx: 300, dy: 0, name: "ASG" },
      { type: "Database" as NodeType, dx: 450, dy: 0, name: "RDS" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "Edge" },
      { fromIdx: 1, toIdx: 2, label: "Forward" },
      { fromIdx: 2, toIdx: 3, label: "SQL" },
    ]
  },
  Microservices: {
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "Browser" },
      { type: "API Gateway" as NodeType, dx: 150, dy: 0, name: "Kong/APIGateway" },
      { type: "Microservice" as NodeType, dx: 300, dy: -100, name: "Auth Svc" },
      { type: "Microservice" as NodeType, dx: 300, dy: 100, name: "Order Svc" },
      { type: "Database" as NodeType, dx: 450, dy: -100, name: "Redis" },
      { type: "Database" as NodeType, dx: 450, dy: 100, name: "PostgreSQL" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "HTTPS" },
      { fromIdx: 1, toIdx: 2, label: "GRPC" },
      { fromIdx: 1, toIdx: 3, label: "GRPC" },
      { fromIdx: 2, toIdx: 4, label: "Cache" },
      { fromIdx: 3, toIdx: 5, label: "SQL" },
    ]
  },
  "Event-Driven": {
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "Mobile Client" },
      { type: "API Gateway" as NodeType, dx: 150, dy: 0, name: "Ingress" },
      { type: "Message Queue" as NodeType, dx: 300, dy: 0, name: "Kafka/SQS" },
      { type: "Worker" as NodeType, dx: 450, dy: 0, name: "Consumer" },
      { type: "Database" as NodeType, dx: 600, dy: 0, name: "S3/DB" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "Publish" },
      { fromIdx: 1, toIdx: 2, label: "Enqueue" },
      { fromIdx: 2, toIdx: 3, label: "Consume" },
      { fromIdx: 3, toIdx: 4, label: "Store" },
    ]
  }
};
