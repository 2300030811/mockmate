"use client";

import { motion } from "framer-motion";
import { projects, ProjectChallenge } from "@/lib/projects/data";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Code2, ChevronRight, Zap, Target, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

import { NavigationPill } from "@/components/ui/NavigationPill";
import React from "react";
import { logger } from "@/lib/logger";

// Sort projects by difficulty: Easy (1) -> Medium (2) -> Hard (3)
const DIFFICULTY_WEIGHT: Record<string, number> = { "Easy": 1, "Medium": 2, "Hard": 3 };

export default function ProjectModeList() {
    const [completedProjects, setCompletedProjects] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeDifficulty, setActiveDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

    useEffect(() => {
        const saved = localStorage.getItem('completedProjects');
        if (saved) {
            try {
                setCompletedProjects(JSON.parse(saved));
            } catch (e) {
                logger.error("Failed to parse completed projects", e);
            }
        }
    }, []);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesDifficulty = activeDifficulty === "All" || project.difficulty === activeDifficulty;
            return matchesSearch && matchesDifficulty;
        }).sort((a, b) => {
            return (DIFFICULTY_WEIGHT[a.difficulty] || 99) - (DIFFICULTY_WEIGHT[b.difficulty] || 99);
        });
    }, [searchQuery, activeDifficulty]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 relative">
            <NavigationPill showBack={false} showHome className="absolute top-6 left-6" />

            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <Code2 size={14} />
                        Live Engineering Challenges
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-6"
                    >
                        Project Mode
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        Solve real-world engineering bugs and build features in a live, multi-file environment.
                    </motion.p>
                </header>

                {/* Filters and Search */}
                <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto">
                        {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
                            <button
                                key={difficulty}
                                onClick={() => setActiveDifficulty(difficulty as any)}
                                className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeDifficulty === difficulty
                                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {difficulty}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72 group">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project, index) => {
                            const isCompleted = completedProjects.includes(project.id);

                            return (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                    isCompleted={isCompleted}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        onClear={() => { setSearchQuery(""); setActiveDifficulty("All"); }}
                    />
                )}
            </div>
        </div>
    );
}

interface ProjectCardProps {
    project: ProjectChallenge;
    index: number;
    isCompleted: boolean;
}

const ProjectCard = React.memo(({ project, index, isCompleted }: ProjectCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/project-mode/${project.id}`}>
                <Card className={`h-full transition-all cursor-pointer group relative overflow-hidden ${isCompleted ? 'border-green-500/50 shadow-green-500/10' : 'hover:border-blue-500/50 hover:shadow-blue-500/20 shadow-sm border-gray-100 dark:border-gray-800'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Code2 size={120} />
                    </div>

                    <div className="p-6 relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-2">
                                <Badge
                                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                                    variant={
                                        project.difficulty === 'Easy' ? 'success' :
                                            project.difficulty === 'Medium' ? 'warning' : 'destructive'
                                    }
                                >
                                    {project.difficulty}
                                </Badge>
                                {isCompleted && (
                                    <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1 text-[10px] px-2 py-0.5">
                                        <CheckCircle size={10} /> Solved
                                    </Badge>
                                )}
                            </div>
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                                <Target size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {project.title}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                            {project.description}
                        </p>

                        <div className="flex items-center gap-4 mb-6 text-xs text-gray-500 dark:text-gray-400">
                            {project.estimatedTime && (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-blue-500" />
                                    <span>{project.estimatedTime}</span>
                                </div>
                            )}
                            {project.completionRate && (
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={14} className="text-green-500" />
                                    <span>{project.completionRate}% Success</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {project.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] font-medium bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
                                        {tag}
                                    </span>
                                ))}
                                {project.tags.length > 2 && (
                                    <span className="text-[10px] text-gray-400 flex items-center font-medium">+{project.tags.length - 2} more</span>
                                )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
});
ProjectCard.displayName = "ProjectCard";

function EmptyState({ onClear }: { onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800"
        >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Target size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching challenges</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
            <button
                onClick={onClear}
                className="mt-6 text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
                Clear all filters
            </button>
        </motion.div>
    );
}
