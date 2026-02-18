export interface DashboardStats {
  xp: number;
  totalTests: number;
  arenaWins: number;
  avgScore: number;
  streak: number;
  bestCategory: string;
}

export interface ActivityItem {
  id: string;
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
  isArena?: boolean;
  winStatus?: 'win' | 'loss' | 'tie';
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
  created_at: string;
}

export interface DashboardData {
  user: {
    id: string;
    email?: string;
    profile?: {
      nickname?: string;
      avatar_url?: string;
    };
  };
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  careerPaths: CareerPath[];
}
