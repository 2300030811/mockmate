
import React from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  title?: string;
  message?: string;
  isDark?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Content Found",
  message = "We couldn't load the requested content. Please try again later.",
  isDark = false
}) => {
  const router = useRouter();
  
  return (
    <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="text-center p-10 max-w-md">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{title}</h2>
        <p className="mb-6 opacity-70">{message}</p>
        <Button onClick={() => router.back()} variant="primary">Go Back</Button>
      </div>
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string; isDark?: boolean }> = ({ 
  message = "Loading...", 
  isDark = false 
}) => {
  return (
    <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium">{message}</p>
        </div>
    </div>
  );
};
