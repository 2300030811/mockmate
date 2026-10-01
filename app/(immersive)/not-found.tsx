import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { HomeBackground } from "@/components/home/HomeBackground";

export default function ImmersiveNotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d12] text-zinc-900 dark:text-[#ebebef] relative selection:bg-[#5e6ad2]/20 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors overflow-hidden">
      {/* 28px Precision Grid & Horizon Illumination */}
      <HomeBackground />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-4 text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] text-xs font-mono text-zinc-600 dark:text-[#8b8b9e]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-pulse" />
          <span className="font-semibold text-zinc-900 dark:text-[#ebebef]">Session Resolution</span>
          <span className="opacity-40">•</span>
          <span>404 Not Found</span>
        </div>

        {/* Card */}
        <div className="w-full bg-white dark:bg-[#14141e] border border-zinc-200 dark:border-[#1e1e2a] rounded-2xl p-6 sm:p-8 shadow-subtle space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] flex items-center justify-center mx-auto">
            <Compass size={24} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-[#ebebef]">
              Session Not Found
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8b8b9e] leading-relaxed">
              This assessment or immersive session does not exist or may have completed and expired.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="w-full py-3 px-5 rounded-xl text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4f5ac4] text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-[#5e6ad2]/20"
            >
              <ArrowLeft size={14} />
              <span>Back to MockMate Hub</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
