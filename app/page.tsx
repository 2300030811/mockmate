"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(true);

  const features = [
    {
      icon: "🎯",
      title: "AI Quiz Generator",
      description: "Upload PDFs and generate smart quizzes instantly",
      href: "/upload",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🎤",
      title: "Mock Interviews",
      description: "Practice with AI-powered interview sessions",
      href: "/demo",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "☁️",
      title: "AWS Certification",
      description: "Prepare for AWS exams with curated quizzes",
      href: "/aws-quiz/mode",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
    }`}>
      
      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
            : 'bg-white hover:bg-gray-100 text-gray-900 shadow-lg'
        }`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
          }`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
          }`} style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              isDark 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
            }`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-wider">MOCKMATE</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`text-6xl md:text-8xl font-extrabold mb-6 ${
              isDark 
                ? 'bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'
            }`}
          >
            Elevate Your
            <br />
            Tech Interviews
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            AI-powered platform for quiz generation, mock interviews, and certification prep
          </motion.p>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group relative"
              >
                <div className={`relative p-8 rounded-3xl transition-all duration-300 overflow-hidden ${
                  isDark 
                    ? 'bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-lg'
                } hover:scale-105 hover:shadow-2xl`}>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/demo"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start Interview
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            
            <Link
              href="/upload"
              className={`px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-lg'
              }`}
            >
              Generate Quiz
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`mt-16 flex flex-wrap gap-8 justify-center text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Real-time Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Customizable</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}