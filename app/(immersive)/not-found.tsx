import Link from "next/link";

export default function ImmersiveNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="p-8 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/30 dark:border-white/10 shadow-xl max-w-md w-full">
        <div className="text-6xl mb-4">🔍</div>
        
        <h2 className="text-xl font-bold mb-2 dark:text-white">
          Session Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
          This quiz or session doesn&apos;t exist or may have expired.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
