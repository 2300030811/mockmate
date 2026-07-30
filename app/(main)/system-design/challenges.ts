export interface ChallengeMetrics {
    users: string;
    writesPerDay: string;
    readsPerDay: string;
    latency: string;
    storage: string;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    objectives: string[];
    constraints: string[];
    templateId?: string;
    metrics?: ChallengeMetrics;
}

export const CHALLENGES: Challenge[] = [
    {
        id: "url-shortener",
        title: "Global URL Shortener",
        description: "Design a system like Bitly that converts long URLs into short, unique aliases. Needs to handle 100M+ new links per month.",
        difficulty: "Easy",
        objectives: [
            "Generate unique 7-character short links",
            "Redirect users with minimal latency",
            "Expiring links (TTL support)",
            "Basic link analytics"
        ],
        constraints: [
            "High availability (99.99%)",
            "Read-heavy workload (100:1 read/write ratio)",
            "Strict latency for redirection (< 10ms)"
        ],
        metrics: {
            users: "50M active",
            writesPerDay: "5M links",
            readsPerDay: "500M redirects",
            latency: "< 10ms",
            storage: "100TB+"
        }
    },
    {
        id: "realtime-chat",
        title: "Instant Messenger",
        description: "Design a real-time chat platform like WhatsApp or Slack. Support 1:1 and group chats with online status tracking.",
        difficulty: "Medium",
        objectives: [
            "Real-time message delivery",
            "Persistence for offline messages",
            "Presence indicators (User Online/Offline)",
            "Message read receipts"
        ],
        constraints: [
            "No message loss allowed",
            "Support for 500M+ monthly active users",
            "Horizontal scalability for WebSocket servers"
        ],
        metrics: {
            users: "500M MAU",
            writesPerDay: "500M messages",
            readsPerDay: "5B messages",
            latency: "< 50ms",
            storage: "5PB+"
        }
    },
    {
        id: "video-stream",
        title: "Global Video Platform",
        description: "Design a video sharing platform like YouTube or Netflix. Focus on the ingestion and delivery pipelines.",
        difficulty: "Hard",
        objectives: [
            "Video upload and asynchronous transcoding",
            "Adaptive bitrate streaming (HLS/DASH)",
            "Low latency global playback",
            "Content moderation queue"
        ],
        constraints: [
            "Store petabytes of video data",
            "Efficient CDN utilization",
            "Handle sudden spikes (e.g., viral videos)"
        ],
        metrics: {
            users: "2B active",
            writesPerDay: "50M uploads",
            readsPerDay: "2B plays",
            latency: "< 100ms",
            storage: "100PB+"
        }
    },
    {
        id: "trading-system",
        title: "High-Frequency Exchange",
        description: "Design a low-latency stock trading engine. Precision and order matching speed are critical.",
        difficulty: "Hard",
        objectives: [
            "Order book matching engine",
            "Market data broadcasting",
            "Wallet and balance management",
            "Audit trail for all transactions"
        ],
        constraints: [
            "Microsecond latency for matching",
            "Strict ACID compliance for balance updates",
            "Zero downtime during maintenance"
        ],
        metrics: {
            users: "10M active",
            writesPerDay: "100M trades",
            readsPerDay: "1B quotes",
            latency: "< 1ms",
            storage: "10TB+"
        }
    }
];
