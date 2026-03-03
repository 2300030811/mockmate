import { DashboardStats } from "@/types/dashboard";

export interface BadgeDefinition {
  id: string;
  name: string;
  desc: string;
  icon: string; // lucide icon name
  color: string; // tailwind text color
  /** Returns true if the badge is unlocked given the user's stats */
  check: (stats: DashboardStats) => boolean;
}

/**
 * Centralised badge criteria. Evaluated server-side or client-side against DashboardStats.
 * Add new badges here — they automatically appear in the dashboard.
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "early-adopter",
    name: "Early Adopter",
    desc: "Joined the platform early.",
    icon: "Star",
    color: "text-yellow-400",
    check: () => true, // Always unlocked for existing users
  },
  {
    id: "first-quiz",
    name: "First Steps",
    desc: "Completed your first quiz.",
    icon: "Play",
    color: "text-green-400",
    check: (stats) => stats.totalTests >= 1,
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    desc: "Completed 5+ quizzes.",
    icon: "Trophy",
    color: "text-blue-400",
    check: (stats) => stats.totalTests >= 5,
  },
  {
    id: "quiz-veteran",
    name: "Quiz Veteran",
    desc: "Completed 25+ quizzes.",
    icon: "Medal",
    color: "text-purple-400",
    check: (stats) => stats.totalTests >= 25,
  },
  {
    id: "quiz-legend",
    name: "Quiz Legend",
    desc: "Completed 100+ quizzes.",
    icon: "Crown",
    color: "text-amber-400",
    check: (stats) => stats.totalTests >= 100,
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    desc: "Maintained 90%+ accuracy.",
    icon: "Target",
    color: "text-red-400",
    check: (stats) => stats.avgScore >= 90,
  },
  {
    id: "sharpshooter",
    name: "Sharpshooter",
    desc: "Maintained 95%+ accuracy.",
    icon: "Crosshair",
    color: "text-rose-400",
    check: (stats) => stats.avgScore >= 95,
  },
  {
    id: "streak-3",
    name: "Streak Keeper",
    desc: "3+ day streak.",
    icon: "Flame",
    color: "text-orange-400",
    check: (stats) => stats.streak >= 3,
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    desc: "7+ day streak.",
    icon: "Flame",
    color: "text-orange-500",
    check: (stats) => stats.streak >= 7,
  },
  {
    id: "streak-30",
    name: "Monthly Machine",
    desc: "30+ day streak.",
    icon: "Flame",
    color: "text-red-500",
    check: (stats) => stats.streak >= 30,
  },
  {
    id: "arena-warrior",
    name: "Arena Warrior",
    desc: "Won 5+ arena battles.",
    icon: "Swords",
    color: "text-red-400",
    check: (stats) => stats.arenaWins >= 5,
  },
  {
    id: "arena-champion",
    name: "Arena Champion",
    desc: "Won 25+ arena battles.",
    icon: "Swords",
    color: "text-red-500",
    check: (stats) => stats.arenaWins >= 25,
  },
  {
    id: "xp-500",
    name: "Rising Star",
    desc: "Earned 500+ XP.",
    icon: "Zap",
    color: "text-yellow-400",
    check: (stats) => stats.xp >= 500,
  },
  {
    id: "xp-5000",
    name: "Powerhouse",
    desc: "Earned 5,000+ XP.",
    icon: "Zap",
    color: "text-yellow-500",
    check: (stats) => stats.xp >= 5000,
  },
  // ── Streak Multiplier Badges ──
  {
    id: "momentum",
    name: "Momentum",
    desc: "Earned 1.2x XP streak multiplier (3+ days).",
    icon: "TrendingUp",
    color: "text-emerald-400",
    check: (stats) => stats.streak >= 3,
  },
  {
    id: "on-fire",
    name: "On Fire",
    desc: "Earned 1.5x XP streak multiplier (7+ days).",
    icon: "TrendingUp",
    color: "text-emerald-500",
    check: (stats) => stats.streak >= 7,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    desc: "Earned 2x XP streak multiplier (30+ days).",
    icon: "TrendingUp",
    color: "text-emerald-600",
    check: (stats) => stats.streak >= 30,
  },
  // ── Elo Badges ──
  {
    id: "ranked",
    name: "Ranked",
    desc: "Reached 1200+ Elo rating in Arena.",
    icon: "Shield",
    color: "text-indigo-400",
    check: (stats) => (stats.elo ?? 0) >= 1200,
  },
  {
    id: "elite",
    name: "Elite",
    desc: "Reached 1500+ Elo rating in Arena.",
    icon: "Shield",
    color: "text-indigo-600",
    check: (stats) => (stats.elo ?? 0) >= 1500,
  },
];
