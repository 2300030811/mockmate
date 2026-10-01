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

export type NodeCategory = "All" | "Compute" | "Data" | "Network" | "Async";

export interface NodeConfigItem {
  icon: any;
  color: string;
  bg: string;
  border: string;
  category: "Compute" | "Data" | "Network" | "Async";
  role: string;
  desc: string;
}

export const NODE_CONFIG: Record<NodeType, NodeConfigItem> = {
  "Client": {
    icon: Smartphone,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    category: "Compute",
    role: "Edge Client",
    desc: "Mobile / Web browser client ingress"
  },
  "Load Balancer": {
    icon: Layers,
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    category: "Network",
    role: "Traffic Ingress",
    desc: "L4/L7 High-availability reverse proxy"
  },
  "Web Server": {
    icon: Server,
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    category: "Compute",
    role: "App Tier",
    desc: "Stateless compute / API instances"
  },
  "Database": {
    icon: Database,
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    category: "Data",
    role: "ACID Store",
    desc: "Relational / Document persistent storage"
  },
  "Cache": {
    icon: Zap,
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    category: "Data",
    role: "In-Memory K/V",
    desc: "Ultra-low latency Redis / Memcached"
  },
  "CDN": {
    icon: Globe,
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    category: "Network",
    role: "Edge Cache",
    desc: "Global static asset point-of-presence"
  },
  "Message Queue": {
    icon: MessageSquare,
    color: "text-pink-500 dark:text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    category: "Async",
    role: "Pub/Sub Stream",
    desc: "Kafka / RabbitMQ asynchronous buffer"
  },
  "Microservice": {
    icon: Cpu,
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    category: "Compute",
    role: "Service Mesh",
    desc: "Decoupled domain business service"
  },
  "Worker": {
    icon: Settings,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    category: "Compute",
    role: "Async Worker",
    desc: "Background batch & cron processor"
  },
  "Storage": {
    icon: HardDrive,
    color: "text-teal-500 dark:text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    category: "Data",
    role: "Object Store",
    desc: "S3-compatible immutable blob storage"
  },
  "API Gateway": {
    icon: Network,
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    category: "Network",
    role: "API Routing",
    desc: "Authentication, rate limiting & router"
  },
  "Firewall": {
    icon: Shield,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    category: "Network",
    role: "WAF / Shield",
    desc: "DDoS mitigation & TLS packet inspection"
  },
  "DNS": {
    icon: ServerCog,
    color: "text-yellow-500 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    category: "Network",
    role: "Global DNS",
    desc: "Route 53 Geo-routing & health check"
  },
  "3rd Party API": {
    icon: Blocks,
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    category: "Async",
    role: "External SaaS",
    desc: "Stripe, Twilio, OAuth provider integrations"
  },
};

export const GRID_SIZE = 20;

export const TEMPLATES = {
  Serverless: {
    title: "Serverless Event Stack",
    desc: "API Gateway → Lambda → DynamoDB",
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "End User" },
      { type: "API Gateway" as NodeType, dx: 160, dy: 0, name: "API Gateway" },
      { type: "Microservice" as NodeType, dx: 320, dy: 0, name: "Lambda Function" },
      { type: "Database" as NodeType, dx: 480, dy: 0, name: "DynamoDB" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "HTTPS" },
      { fromIdx: 1, toIdx: 2, label: "Invoke" },
      { fromIdx: 2, toIdx: 3, label: "NoSQL" },
    ]
  },
  Web: {
    title: "3-Tier Web App",
    desc: "CloudFront → ALB → Web ASG → RDS",
    nodes: [
      { type: "CDN" as NodeType, dx: 0, dy: 0, name: "CloudFront" },
      { type: "Load Balancer" as NodeType, dx: 160, dy: 0, name: "ALB Ingress" },
      { type: "Web Server" as NodeType, dx: 320, dy: 0, name: "Web ASG" },
      { type: "Database" as NodeType, dx: 480, dy: 0, name: "RDS Postgres" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "Edge" },
      { fromIdx: 1, toIdx: 2, label: "Forward" },
      { fromIdx: 2, toIdx: 3, label: "SQL Pool" },
    ]
  },
  Microservices: {
    title: "CQRS Microservices",
    desc: "API Gateway → Auth/Order Svcs → Redis/Postgres",
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "Client App" },
      { type: "API Gateway" as NodeType, dx: 150, dy: 0, name: "Gateway" },
      { type: "Microservice" as NodeType, dx: 300, dy: -90, name: "Auth Svc" },
      { type: "Microservice" as NodeType, dx: 300, dy: 90, name: "Order Svc" },
      { type: "Cache" as NodeType, dx: 460, dy: -90, name: "Redis Sessions" },
      { type: "Database" as NodeType, dx: 460, dy: 90, name: "Primary DB" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "HTTPS" },
      { fromIdx: 1, toIdx: 2, label: "gRPC" },
      { fromIdx: 1, toIdx: 3, label: "gRPC" },
      { fromIdx: 2, toIdx: 4, label: "Fast Cache" },
      { fromIdx: 3, toIdx: 5, label: "SQL Transaction" },
    ]
  },
  "Event-Driven": {
    title: "Async Event Pipeline",
    desc: "Client → Ingress → Kafka → Consumer → S3",
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "Mobile Client" },
      { type: "API Gateway" as NodeType, dx: 140, dy: 0, name: "Event Ingress" },
      { type: "Message Queue" as NodeType, dx: 290, dy: 0, name: "Kafka Stream" },
      { type: "Worker" as NodeType, dx: 440, dy: 0, name: "Worker Fleet" },
      { type: "Storage" as NodeType, dx: 590, dy: 0, name: "Data Lake" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "Telemetry" },
      { fromIdx: 1, toIdx: 2, label: "Produce" },
      { fromIdx: 2, toIdx: 3, label: "Consume Batch" },
      { fromIdx: 3, toIdx: 4, label: "Parquet S3" },
    ]
  },
  "Cache-Aside": {
    title: "Read-Heavy Cache-Aside",
    desc: "Client → CDN → Web App → Redis ⇄ PostgreSQL",
    nodes: [
      { type: "Client" as NodeType, dx: 0, dy: 0, name: "User" },
      { type: "CDN" as NodeType, dx: 140, dy: 0, name: "Cloudflare" },
      { type: "Web Server" as NodeType, dx: 290, dy: 0, name: "App Service" },
      { type: "Cache" as NodeType, dx: 440, dy: -80, name: "Redis Cluster" },
      { type: "Database" as NodeType, dx: 440, dy: 80, name: "PostgreSQL" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "HTTPS" },
      { fromIdx: 1, toIdx: 2, label: "Origin" },
      { fromIdx: 2, toIdx: 3, label: "Look Aside" },
      { fromIdx: 2, toIdx: 4, label: "DB Fallback" },
    ]
  },
  "Zero-Trust": {
    title: "Zero-Trust Perimeter",
    desc: "DNS → WAF Firewall → Gateway → Worker",
    nodes: [
      { type: "DNS" as NodeType, dx: 0, dy: 0, name: "Route 53" },
      { type: "Firewall" as NodeType, dx: 150, dy: 0, name: "AWS WAF" },
      { type: "API Gateway" as NodeType, dx: 300, dy: 0, name: "Mutual TLS Gate" },
      { type: "Worker" as NodeType, dx: 460, dy: 0, name: "Isolated Worker" },
    ],
    connections: [
      { fromIdx: 0, toIdx: 1, label: "Resolve" },
      { fromIdx: 1, toIdx: 2, label: "Filtered" },
      { fromIdx: 2, toIdx: 3, label: "mTLS" },
    ]
  }
};
