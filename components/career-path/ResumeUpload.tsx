"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onUpload: (file: File) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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
    const validTypes = ['application/pdf'];
    if (validTypes.includes(uploadedFile.type)) {
      setFile(uploadedFile);
      onUpload(uploadedFile);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
          {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className={`p-8 border-2 border-dashed transition-colors duration-300 ${
              dragActive 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' 
                : 'border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20 bg-white dark:bg-white/5'
            }`}>
              <div 
                className="flex flex-col items-center justify-center text-center cursor-pointer"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Upload size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload your Resume
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                  Drag and drop your PDF resume here, or click to browse.
                  <br />
                  <span className="text-xs opacity-70">(PDF only, max 5MB)</span>
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleChange}
                />
                <Button variant="primary" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Select File
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={removeFile}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                  </p>
                </div>
                <div className="ml-auto text-green-500 dark:text-green-400">
                  <CheckCircle size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
