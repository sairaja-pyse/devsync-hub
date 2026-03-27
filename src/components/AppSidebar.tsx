import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Target,
  Sparkles,
  Briefcase,
  Calendar,
  Settings,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", icon: FolderKanban, path: "/projects" },
      { title: "Board", icon: Kanban, path: "/board" },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Goals", icon: Target, path: "/goals" },
      { title: "Skills", icon: Sparkles, path: "/skills" },
      { title: "Job Tracker", icon: Briefcase, path: "/jobs" },
    ],
  },
  {
    label: "Plan",
    items: [
      { title: "Calendar", icon: Calendar, path: "/calendar" },
    ],
  },
  {
    label: "",
    items: [
      { title: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">DevSync</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
