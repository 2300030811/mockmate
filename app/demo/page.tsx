"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DemoSelection() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"behavioral" | "technical" | null>(null);

  const handleStart = () => {
    if (selectedType) {
      router.push(`/demo/session?type=${selectedType}`);
    }
  };

  const interviewTypes = [
    {
      id: "behavioral",
      icon: "🤝",
      title: "Behavioral",
      description: "Leadership, teamwork, and conflict resolution scenarios",
      gradient: "from-blue-500 to-cyan-500",
      hoverGradient: "from-blue-600 to-cyan-600",
      features: ["STAR Method", "Soft Skills", "Past Experience"]
    },
    {
      id: "technical",
      icon: "💻",
      title: "Technical",
      description: "System design, algorithms, and architecture discussions",
      gradient: "from-purple-500 to-pink-500",
      hoverGradient: "from-purple-600 to-pink-600",
      features: ["Coding", "System Design", "Problem Solving"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-6xl w-full text-center relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-400 font-medium">AI-Powered Mock Interview</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Choose Your Interview Track
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Practice with our advanced AI interviewer. Get real-time feedback and improve your skills.
          </p>
        </motion.div>

        {/* Interview Type Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {interviewTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setSelectedType(type.id as "behavioral" | "technical")}
              className={`group relative p-8 rounded-3xl text-left transition-all duration-300 overflow-hidden ${
                selectedType === type.id
                  ? "scale-105 shadow-2xl"
                  : "hover:scale-102 shadow-xl"
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                selectedType === type.id ? type.hoverGradient : type.gradient
              } opacity-90 transition-all duration-300`}></div>
              
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              
              {/* Selection Ring */}
              {selectedType === type.id && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 border-4 border-white/30 rounded-3xl"
                ></motion.div>
              )}
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {type.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  {type.title}
                </h3>
                
                <p className="text-white/80 mb-4 leading-relaxed">
                  {type.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {type.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* Check Icon */}
                {selectedType === type.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={handleStart}
            disabled={!selectedType}
            className={`group relative px-12 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
              selectedType
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Interview
              <svg className={`w-5 h-5 transition-transform ${selectedType ? 'group-hover:translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          {!selectedType && (
            <p className="mt-4 text-sm text-gray-500">
              Please select an interview type to continue
            </p>
          )}
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Real-time AI Feedback</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>~15-20 Minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Voice Enabled</span>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}