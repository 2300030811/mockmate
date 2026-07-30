import React from "react";
import { CareerAnalysisResult, SkillGap, RoleSuggestion } from "@/types/career";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  gradient?: string;
  benchmark?: React.ReactNode;
}

export interface ResumeSuggestion {
  category: string;
  suggestion: string;
  impact: string;
}

export interface ResumeSectionProps {
  suggestions: ResumeSuggestion[];
}

export interface InterviewPrepSectionProps {
  interviewPrep: CareerAnalysisResult["interviewPrep"] & {
    topQuestions: any[];
    starStories?: any[];
  };
}

export interface MarketPulseSectionProps {
  marketInsights: NonNullable<CareerAnalysisResult["marketInsights"]>;
}

export interface StrengthsSectionProps {
  strengths: NonNullable<CareerAnalysisResult["strengths"]>;
}

export interface RoleSuggestionsSectionProps {
  suggestedRoles: RoleSuggestion[];
}

export interface CompetitiveEdgeCardProps {
  competitiveEdge?: string;
}

export interface LevelStrategyCardProps {
  levelStrategy?: CareerAnalysisResult["levelStrategy"];
}

export interface SkillGapCardProps {
  gap: SkillGap;
  idx: number;
  getQuizLink: (quizType: SkillGap["recommendedQuiz"]) => string | null;
}

export interface RoadmapTabProps {
  roadmap: CareerAnalysisResult["roadmap"];
  expandedSteps: number[];
  toggleStep: (idx: number) => void;
}
