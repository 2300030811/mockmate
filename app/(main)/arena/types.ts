import { LucideIcon } from "lucide-react";

export type GameState = 'lobby' | 'searching' | 'battle' | 'results';

export interface Opponent {
  name: string;
  level: number;
  avatar: string;
  winRate: string;
  region: string;
  badge: string;
}

export interface ArenaQuestion {
  id?: string;
  q: string;
  options: string[];
  a: string;
  tip?: string;
  category?: string;
  code?: string;
  multipleCorrect?: boolean;
}

export interface BattleResult {
  q: string;
  userAns: string;
  correctAns: string;
  correct: boolean;
  tip?: string;
}

export interface StatItem {
  icon: LucideIcon;
  label: string;
  val: string;
  color: string;
  bg: string;
  hideOnMobile?: boolean;
}

export interface RecentMatch {
  category: string;
  score: number;
  total_questions: number;
  completed_at: string;
}
