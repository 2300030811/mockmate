"use client";

import { motion } from "framer-motion";
import { InteractiveCard } from "@/components/ui/Card";

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  gradient: string;
  iconBgLight: string;
  iconBgDark: string;
  onClick: () => void;
  iconColorClass?: string;
  buttonColorClass?: string; // e.g. "text-blue-600 dark:text-blue-400"
}

export function ModeCard({
  title,
  description,
  icon,
  features,
  buttonText,
  gradient,
  iconBgLight,
  iconBgDark,
  onClick,
  iconColorClass = "text-blue-500",
  buttonColorClass = "text-blue-600 dark:text-blue-400"
}: ModeCardProps) {
  return (
    <button onClick={onClick} className="group relative w-full text-left h-full">
      <InteractiveCard className="h-full flex flex-col p-8">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

        <div className="relative z-10 flex-1 flex flex-col">
          <div className={`mb-6 w-20 h-20 flex items-center justify-center rounded-2xl transform group-hover:scale-110 transition-transform duration-300 ${iconBgLight} dark:${iconBgDark.replace('bg-', 'bg-opacity-20 ')}`}>
            {icon}
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">
            {description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6 flex-1">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                 <svg
                    className={`w-5 h-5 ${iconColorClass}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <span className={`inline-flex items-center gap-2 font-bold group-hover:gap-4 transition-all ${buttonColorClass}`}>
            {buttonText}
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </div>
      </InteractiveCard>
    </button>
  );
}
