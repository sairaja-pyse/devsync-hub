import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  Target,
  Briefcase,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", icon: LayoutDashboard, path: "/" },
  { title: "Board", icon: Kanban, path: "/board" },
  { title: "Goals", icon: Target, path: "/goals" },
  { title: "Jobs", icon: Briefcase, path: "/jobs" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-sm sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[3.5rem]",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
