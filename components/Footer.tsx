"use client";

import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide footer on specific interactive pages
  const hiddenPaths = ["/system-design", "/arena"];
  if (hiddenPaths.includes(pathname)) return null;

  return (
    <footer className="relative mt-20 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                MockMate
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Your AI-powered companion for mastering technical certifications
              and acing your dream job interviews.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/aws-quiz"
                  target="_blank"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Cloud Quizzes
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  target="_blank"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Mock Interview
                </Link>
              </li>
              <li>
                <Link
                  href="/career-path"
                  target="_blank"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Career Pathfinder
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  target="_blank"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  PDF Quiz Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-6">
              
            </h4>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md"
            >
              <Users className="w-4 h-4" />
              Connect with Us
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} MockMate. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
