
import { Skeleton } from "@/components/ui/Skeleton";

interface QuizSkeletonProps {
  mode: "practice" | "exam";
  isDark: boolean;
}

export function QuizSkeleton({ mode, isDark }: QuizSkeletonProps) {
  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-green-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-green-50'
    }`}>
      
      {/* NAVBAR SKELETON */}
      <nav className={`h-16 flex-none shadow-md z-50 flex items-center justify-between px-4 lg:px-8 ${
        isDark 
          ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-800' 
          : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          {mode === "exam" && <Skeleton className="h-6 w-16 rounded-md" />}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR SKELETON */}
        <aside className={`
          hidden lg:block w-72 h-full border-r p-4
          ${isDark 
            ? 'bg-gray-900/80 border-gray-800' 
            : 'bg-white/80 border-gray-200'
          }
        `}>
          <div className="grid grid-cols-5 gap-2 pb-20">
            {/* Grid of question numbers */}
            {Array.from({ length: 25 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-lg" />
            ))}
          </div>
          <div className="mt-8">
             <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </aside>

        {/* MAIN CONTENT SKELETON */}
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-3xl mx-auto pb-20">
            
            {/* Progress Bar & Mark */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 mr-4 space-y-2">
                 <Skeleton className="h-4 w-32 rounded" />
                 <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Question Card Skeleton */}
            <div className={`p-6 md:p-10 rounded-3xl shadow-sm border ${
               isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              {/* Question Text */}
              <Skeleton className="h-8 w-3/4 mb-4 rounded" />
              <Skeleton className="h-8 w-1/2 mb-8 rounded" />

              {/* Options */}
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className={`p-5 rounded-xl border ${
                     isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-white'
                   }`}>
                      <Skeleton className="h-5 w-11/12 rounded" />
                   </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
               <Skeleton className="h-12 w-32 rounded-xl" />
               <Skeleton className="h-12 w-40 rounded-xl" />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
