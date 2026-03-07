export interface Challenge {
    id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    objectives: string[];
    constraints: string[];
    templateId?: string;
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
        ]
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
        ]
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
        ]
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
        ]
    }
];
