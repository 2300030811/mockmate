"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./ThemeProvider";

import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient in useState to avoid sharing it across SSR requests
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Export useTheme to avoid breaking imports in other files that imported it from here
export { useTheme } from "./ThemeProvider";
