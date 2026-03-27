import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-20 sm:pb-6">
          <Outlet />
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
