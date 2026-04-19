"use client";

import React, { useState } from 'react';
import { Search, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getRoleSuggestions } from '@/lib/career-path/role-suggestions';

interface JobInputProps {
  onAnalyze: (jobRole: string, company: string, jobDescription?: string) => void;
  isLoading: boolean;
  hasFile: boolean;
  buttonText?: string;
}

export const JobInput: React.FC<JobInputProps> = ({ 
  onAnalyze, 
  isLoading, 
  hasFile,
  buttonText = "Analyze Career Path" 
}) => {
  const suggestionListId = React.useId();
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [errorInput, setErrorInput] = useState('');
  const roleSuggestions = React.useMemo(() => getRoleSuggestions(jobRole, 8), [jobRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobRole.trim() && hasFile) {
      const cleanRole = jobRole.trim();
      const lowerRole = cleanRole.toLowerCase();
      const validAcronyms = ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'ciso', 'sre', 'sde', 'qae', 'dba', 'hr', 'pr', 'qa', 'vp', 'pm', 'ux', 'ui'];
      
      if (cleanRole.length <= 2 && !validAcronyms.includes(lowerRole)) {
        setErrorInput("Job role is too short to be a valid profession.");
        return;
      }
      
      if (!/[aeiouy]/i.test(cleanRole) && cleanRole.length >= 3 && !validAcronyms.includes(lowerRole)) {
        setErrorInput("Please enter a real job role (detected invalid input).");
        return;
      }

      if (/^([a-zA-Z])\1+$/.test(cleanRole) || /asdf/i.test(cleanRole) || /qwer/i.test(cleanRole) || /zxcv/i.test(cleanRole)) {
        setErrorInput("Please enter a real job role (keyboard mashing detected).");
        return;
      }

      setErrorInput('');
      onAnalyze(cleanRole, company.trim(), jobDescription.trim());
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
                list={suggestionListId}
                autoComplete="off"
                maxLength={100}
                className={`w-full bg-white dark:bg-black/20 border ${errorInput ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-white/10'} rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all`}
                required
              />
              <datalist id={suggestionListId}>
                {roleSuggestions.map((suggestion) => (
                  <option key={suggestion.value} value={suggestion.value} />
                ))}
              </datalist>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Role suggestions are based on the current India salary dataset.
            </p>
            {errorInput && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errorInput}
              </p>
            )}
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
                maxLength={80}
                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Search size={16} />
            Job Description <span className="text-xs opacity-50">(Optional - helps with ATS keyword match)</span>
          </label>
          <div className="relative">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={4}
              className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="relative group">
          <Button 
            type="submit" 
            variant="primary" 
            className={`w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20 ${!hasFile || !jobRole.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || !hasFile || !jobRole.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing your profile...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search size={20} />
                {buttonText}
              </span>
            )}
          </Button>
          {(!hasFile || !jobRole.trim()) && !isLoading && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {!hasFile ? "Upload a resume first" : "Enter a job role to continue"}
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};
