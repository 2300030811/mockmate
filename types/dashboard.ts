export interface DashboardStats {
  xp: number;
  totalTests: number;
  totalQuestions: number;
  arenaWins: number;
  arenaLosses: number;
  avgScore: number;
  streak: number;
  bestCategory: string;
  /** Persisted Elo rating (arena). Defaults to 1000. */
  elo: number;
  /** Current level derived from XP */
  level: number;
  /** Active streak multiplier (1.0 = no bonus) */
  streakMultiplier: number;
}

export interface ActivityItem {
  id: string;
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
  isArena?: boolean;
  winStatus?: 'win' | 'loss' | 'tie' | null;
  nickname?: string;
}

export interface LeaderboardItem {
  id: string;
  nickname: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface CareerPath {
  id: string;
  job_role: string;
  company: string | null;
  match_score?: number;
  created_at: string;
}

export interface UserProfile {
  nickname?: string;
  avatar_icon?: string;
  role?: string;
  created_at?: string;
}

export interface DashboardData {
  user: {
    id: string;
    email?: string;
    profile: UserProfile;
  };
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  careerPaths: CareerPath[];
}
