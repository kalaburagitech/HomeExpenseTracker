"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardContent } from "./dashboard-content";
import { useAuth } from "@/lib/auth-no-jsx";

export function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardContent />
      </div>
    </SidebarProvider>
  );
}
