"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  onRemove?: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dpdpConsent, setDpdpConsent] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    if (!dpdpConsent) {
      setFileError("Affirmative consent under the India DPDP Act (2023) is required to process resume data.");
      return;
    }
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 10MB.");
      return;
    }
    if (!['application/pdf'].includes(uploadedFile.type)) {
      setFileError("Please upload a PDF resume file.");
      return;
    }
    setFileError(null);
    setFile(uploadedFile);
    onUpload(uploadedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div
              className={`relative group border-2 border-dashed rounded-xl p-8 sm:p-10 transition-all text-center cursor-pointer ${
                dragActive
                  ? 'border-[#5e6ad2] bg-[#5e6ad2]/5 dark:bg-[#5e6ad2]/10 shadow-[0_0_25px_rgba(94,106,210,0.15)]'
                  : 'border-zinc-300 dark:border-[#262638] hover:border-[#5e6ad2] dark:hover:border-[#5e6ad2] bg-white dark:bg-[#101017] hover:bg-zinc-50 dark:hover:bg-[#14141e] shadow-sm'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleChange}
                aria-label="Upload resume PDF"
              />

              <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] mb-3 group-hover:scale-110 transition-transform duration-200">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-[#ebebef]">
                  Drop your resume here <span className="font-normal text-zinc-500 dark:text-[#8b8b9e]">or click to browse</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-[#6e6e84] mt-1 font-mono">
                  Supports PDF format (up to 10MB)
                </p>
              </div>
            </div>
          </m.div>
        ) : (
          <m.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold text-sm text-zinc-900 dark:text-[#ebebef] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 size={12} />
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Remove resume"
                aria-label="Remove resume"
              >
                <X size={16} />
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* India DPDP Act (2023) Consent Notice */}
      <div className="mt-3.5 pt-3 border-t border-zinc-200/70 dark:border-[#1e1e2a] flex items-start gap-2.5 text-left">
        <input
          id="dpdp-resume-consent"
          type="checkbox"
          checked={dpdpConsent}
          onChange={(e) => setDpdpConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#5e6ad2] focus:ring-[#5e6ad2] cursor-pointer"
        />
        <label
          htmlFor="dpdp-resume-consent"
          className="text-[11px] leading-relaxed text-zinc-500 dark:text-[#8b8b9e] cursor-pointer select-none"
        >
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">DPDP Act (2023) Consent:</span> I grant affirmative consent for MockMate to ephemerally parse my resume via Azure AI Document Intelligence and enterprise LLMs. Data is subject to a 24-hour auto-purge lifecycle and is never utilized for AI model training. See{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5e6ad2] underline hover:text-[#4d59be]"
          >
            Privacy Policy
          </a>.
        </label>
      </div>

      {fileError && (
        <p className="text-rose-500 text-xs font-mono mt-2 text-center">{fileError}</p>
      )}
    </div>
  );
};
