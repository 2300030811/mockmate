import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated before accessing arena
  const user = await requireAuth();
  
  if (!user) {
    redirect("/login?from=/arena");
  }

  return <>{children}</>;
}
