import { motion } from "framer-motion";

export function QuizSkeleton({ mode, isDark }: { mode: string; isDark: boolean }) {
  const bgClass = isDark ? "bg-gray-800" : "bg-gray-200";

  return (
    <div className={`h-screen flex flex-col p-4 md:p-8 animate-pulse ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`h-16 w-full mb-8 rounded-lg ${bgClass} opacity-50`} />

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-8">
        
        {/* Progress Bar */}
        <div className={`h-4 w-1/3 rounded-full mb-4 ${bgClass}`} />
        
        {/* Question Area */}
        <div className={`flex-1 rounded-3xl p-8 ${
          isDark ? 'bg-gray-800/30' : 'bg-white/50'
        }`}>
          <div className={`h-8 w-3/4 rounded mb-6 ${bgClass}`} />
          <div className={`h-4 w-1/2 rounded mb-12 ${bgClass}`} />

          {/* Options */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-16 w-full rounded-xl ${bgClass} opacity-60`} />
            ))}
          </div>
        </div>

        {/* Footer Nav */}
        <div className="flex justify-between mt-auto">
           <div className={`h-10 w-24 rounded-lg ${bgClass}`} />
           <div className={`h-10 w-32 rounded-lg ${bgClass}`} />
        </div>
      </div>
    </div>
  );
}
