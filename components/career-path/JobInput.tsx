"use client";

import React, { useState } from 'react';
import { Search, Briefcase, Building2, Sparkles, FileText, ChevronDown } from 'lucide-react';
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
  buttonText = "Synthesize Career Path" 
}) => {
  const suggestionListId = React.useId();
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [errorInput, setErrorInput] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(true);

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
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Job Role Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
            <Briefcase size={13} className="text-[#5e6ad2]" />
            <span>Target Job Role</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Full Stack Engineer, SRE, ML Lead"
              list={suggestionListId}
              autoComplete="off"
              maxLength={100}
              className={`w-full bg-white dark:bg-[#0d0d12] border ${
                errorInput
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-zinc-200 dark:border-[#1e1e2a] focus:border-[#5e6ad2]'
              } rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all`}
              required
            />
            <datalist id={suggestionListId}>
              {roleSuggestions.map((suggestion) => (
                <option key={suggestion.value} value={suggestion.value} />
              ))}
            </datalist>
          </div>
          {errorInput && (
            <p className="text-rose-500 text-xs font-mono mt-1">
              {errorInput}
            </p>
          )}
        </div>

        {/* Target Company Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8b8b9e] flex items-center gap-1.5">
            <Building2 size={13} className="text-[#5e6ad2]" />
            <span>Target Company</span>
            <span className="text-[10px] text-zinc-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Stripe, Microsoft"
              maxLength={80}
              className="w-full bg-white dark:bg-[#0d0d12] border border-zinc-200 dark:border-[#1e1e2a] focus:border-[#5e6ad2] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Job Description Accordion */}
      <details className="group border border-zinc-200 dark:border-[#1e1e2a] rounded-xl p-3 bg-zinc-50/50 dark:bg-[#0d0d12]/50 transition-colors">
        <summary className="text-xs font-semibold text-zinc-600 dark:text-[#8b8b9e] hover:text-zinc-900 dark:hover:text-[#ebebef] cursor-pointer list-none flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText size={13} className="text-[#5e6ad2]" />
            <span>Include Job Description (Optional — Sharpens ATS Matching)</span>
          </span>
          <ChevronDown size={14} className="text-zinc-400 group-open:rotate-180 transition-transform" />
        </summary>
        
        <div className="mt-3 pt-3 border-t border-zinc-200/80 dark:border-[#1e1e2a]">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job requirements or description here for deep ATS keyword alignment..."
            rows={4}
            className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-lg p-3 text-xs text-zinc-900 dark:text-[#ebebef] placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-[#5e6ad2] outline-none transition-all resize-none"
          />
        </div>
      </details>

      {/* DPDP Act (2023) Calibration Consent */}
      <div className="flex items-start gap-2 text-left">
        <input
          id="job-input-consent"
          type="checkbox"
          checked={consentAgreed}
          onChange={(e) => setConsentAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#5e6ad2] focus:ring-[#5e6ad2] cursor-pointer"
        />
        <label
          htmlFor="job-input-consent"
          className="text-[11px] leading-snug text-zinc-500 dark:text-[#8b8b9e] cursor-pointer select-none"
        >
          I consent under <strong className="text-zinc-700 dark:text-zinc-300 font-medium">India DPDP Act (2023)</strong> to calibrate career trajectory via enterprise AI models with zero model retention.
        </label>
      </div>

      {/* Primary Action Button */}
      <button
        type="submit"
        disabled={isLoading || !hasFile || !jobRole.trim() || !consentAgreed}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-subtle ${
          !hasFile || !jobRole.trim() || !consentAgreed
            ? 'bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-[#1e1e2a] cursor-not-allowed'
            : 'bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white cursor-pointer active:scale-[0.99] shadow-md shadow-[#5e6ad2]/20'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing Career Trajectory...</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>{buttonText}</span>
          </span>
        )}
      </button>
    </form>
  );
};
