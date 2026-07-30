import Link from "next/link";
import { Bot, Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 px-4">
      <div className="text-center max-w-md">
        {/* Animated illustration */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bot className="w-16 h-16 text-blue-500 dark:text-blue-400" />
            <Sparkles className="w-5 h-5 text-yellow-400 absolute top-2 right-4 animate-bounce" />
          </div>
        </div>

        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          Don&apos;t worry — Bob&apos;s got your back. Let&apos;s get you home.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
