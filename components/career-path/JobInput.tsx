"use client";

import React, { useState } from 'react';
import { Search, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface JobInputProps {
  onAnalyze: (jobRole: string, company: string) => void;
  isLoading: boolean;
  hasFile: boolean;
}

export const JobInput: React.FC<JobInputProps> = ({ onAnalyze, isLoading, hasFile }) => {
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobRole.trim() && hasFile) {
      onAnalyze(jobRole, company);
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 mt-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Target Role Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Briefcase size={16} />
              Job Role <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Building2 size={16} />
              Target Company <span className="text-xs opacity-50">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Amazon"
                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className={`w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20 ${!hasFile || !jobRole ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading || !hasFile || !jobRole}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing your profile...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={20} />
              Analyze Career Path
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
};
