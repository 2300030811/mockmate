"use client";

export function HomeBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {/* 28px Precision Grid */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-25 text-zinc-400 dark:text-zinc-600"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black 30%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 90%)",
        }}
      />

      {/* Subtle Linear-Horizon Top Illumination */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-[#5e6ad2]/50 to-transparent dark:via-[#5e6ad2]/40"
      />
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[160px] opacity-25 dark:opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #5e6ad2 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

