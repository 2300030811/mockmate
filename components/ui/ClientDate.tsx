"use client";

import { useEffect, useState } from "react";

interface ClientDateProps {
  date: string | number | Date;
  className?: string;
  placeholder?: string;
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Renders a localized date string only after mounting on the client
 * to prevent Next.js hydration mismatches.
 */
export function ClientDate({ date, className, placeholder = "Loading date...", options }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{placeholder}</span>;
  }

  return <span className={className}>{new Date(date).toLocaleDateString(undefined, options)}</span>;
}
