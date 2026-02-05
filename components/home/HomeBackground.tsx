"use client";

export function HomeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-float bg-blue-500/20 dark:bg-blue-500/10"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float bg-purple-500/20 dark:bg-purple-500/10" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse bg-cyan-500/10 dark:bg-cyan-500/5" style={{animationDelay: '0.5s'}}></div>
    </div>
  );
}
