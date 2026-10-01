"use client";

import { CheckCircle2, ShieldCheck, Terminal, Cpu } from "lucide-react";

const platformMetrics = [
  {
    icon: ShieldCheck,
    title: "2,400+ Verified Questions",
    subtitle: "AWS, Azure, Salesforce, MongoDB",
  },
  {
    icon: Terminal,
    title: "10-Year Placement Data",
    subtitle: "KLU recruitment schedules & packages",
  },
  {
    icon: Cpu,
    title: "Sub-200ms Execution",
    subtitle: "Sandboxed browser test runner",
  },
  {
    icon: CheckCircle2,
    title: "Rubric Feedback Engine",
    subtitle: "Objective AI grading criteria",
  },
];

export function StatsRow() {
  return (
    <div
      className="rounded-lg border border-zinc-200 dark:border-[#1e1e2a] bg-zinc-50/50 dark:bg-[#11111a] px-5 py-4 text-left"
      aria-label="Platform Specifications"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {platformMetrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-2.5">
              <div className="mt-0.5 w-6 h-6 rounded-[5px] bg-zinc-200/60 dark:bg-[#181824] flex items-center justify-center shrink-0 text-[#5e6ad2]">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-zinc-900 dark:text-[#ebebef] leading-tight">
                  {item.title}
                </div>
                <div className="text-[10.5px] text-zinc-500 dark:text-[#5a5a6e] mt-0.5 leading-tight">
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
