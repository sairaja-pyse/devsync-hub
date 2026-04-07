import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Kanban, Target, Briefcase, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home",     icon: LayoutDashboard, path: "/dashboard", activeColor: "#007AFF" },
  { title: "Board",    icon: Kanban,          path: "/board",     activeColor: "#AF52DE" },
  { title: "Goals",    icon: Target,          path: "/goals",     activeColor: "#34C759" },
  { title: "Jobs",     icon: Briefcase,       path: "/jobs",      activeColor: "#FF9500" },
  { title: "Settings", icon: Settings,        path: "/settings",  activeColor: "#8E8E93" },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden apple-tabbar">
      {/* iOS home indicator spacer */}
      <div className="flex items-center justify-around h-[56px] px-1">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-[3px] px-3 py-1 min-w-[3rem] transition-opacity active:opacity-60"
            >
              {/* Icon with optional filled-circle indicator */}
              <div className="relative">
                <item.icon
                  className="h-[25px] w-[25px]"
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? item.activeColor : "#8E8E93" }}
                />
              </div>
              <span
                className="text-[10px] font-medium leading-none"
                style={{
                  color: active ? item.activeColor : "#8E8E93",
                  fontFamily: '-apple-system, "SF Pro Text", sans-serif',
                }}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
      {/* iOS home indicator */}
      <div className="flex justify-center pb-1">
        <div className="h-[5px] w-[134px] rounded-full bg-foreground/20" />
      </div>
    </nav>
  );
}
