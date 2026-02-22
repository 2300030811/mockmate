export default function ImmersiveLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="relative">
        {/* Pulsing rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 animate-ping" style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Center dot */}
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium tracking-wide">
        Loading session...
      </p>
    </div>
  );
}
