import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground opacity-70 text-sm font-medium animate-pulse">
          Loading dashboard data...
        </p>
      </div>
    </div>
  );
}
