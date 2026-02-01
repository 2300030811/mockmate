"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: "🎯",
      title: "AI Quiz Generator",
      description: "Upload PDFs and generate smart quizzes instantly",
      href: "/upload",
      color: "from-blue-500 to-cyan-500",
      delay: 0.4
    },
    {
      icon: "🎤",
      title: "Mock Interviews",
      description: "Practice with AI-powered interview sessions",
      href: "/demo",
      color: "from-purple-500 to-pink-500",
      delay: 0.5
    },
    {
      icon: "🏆",
      title: "Certification Quizzes",
      description: "Prepare for AWS & Azure exams with curated quizzes",
      href: "/certification",
      color: "from-orange-500 to-cyan-500",
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 pt-20">
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden -mt-20">
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-float bg-blue-500/20 dark:bg-blue-500/10"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float bg-purple-500/20 dark:bg-purple-500/10" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse bg-cyan-500/10 dark:bg-cyan-500/5" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-wider">MOCKMATE</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent"
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
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400"
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay, ease: "easeOut" }}
              >
                <Link
                  href={feature.href}
                  className="group relative block h-full"
                >
                  <div className="relative p-8 rounded-3xl transition-all duration-300 overflow-hidden transform h-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-2xl dark:bg-gray-900/50 dark:hover:bg-gray-900/70 dark:border-gray-800 dark:hover:border-gray-700 hover:scale-105 hover:-translate-y-1 active:scale-100 flex flex-col items-center text-center">
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Shimmer Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 transition-colors text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="transition-colors text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/demo"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              {/* Button Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>
              <span className="relative flex items-center gap-2">
                Start Interview
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </Link>
            
            <Link
              href="/upload"
              className="px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-2xl dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700 dark:hover:border-gray-600"
            >
              Generate Quiz
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className="mt-16 flex flex-wrap gap-8 justify-center text-sm text-gray-600 dark:text-gray-500"
          >
            {[
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />, text: "AI-Powered", color: "text-green-500" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />, text: "Real-time Feedback", color: "text-blue-500" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />, text: "Customizable", color: "text-purple-500" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-2 transition-all duration-300 hover:scale-110 cursor-default"
                whileHover={{ y: -2 }}
              >
                <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {stat.icon}
                </svg>
                <span>{stat.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}