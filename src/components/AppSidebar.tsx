import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Kanban, Target,
  Sparkles, Briefcase, Calendar, Settings, X, Zap, BookOpen, StickyNote, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

// Apple system color per nav item
const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard", iconClass: "apple-icon-blue" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", icon: FolderKanban, path: "/projects", iconClass: "apple-icon-indigo" },
      { title: "Board",    icon: Kanban,        path: "/board",    iconClass: "apple-icon-purple" },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Goals",       icon: Target,    path: "/goals",  iconClass: "apple-icon-green"  },
      { title: "Skills",      icon: Sparkles,  path: "/skills", iconClass: "apple-icon-yellow" },
      { title: "Job Tracker", icon: Briefcase, path: "/jobs",   iconClass: "apple-icon-orange" },
    ],
  },
  {
    label: "Plan",
    items: [
      { title: "Calendar", icon: Calendar, path: "/calendar", iconClass: "apple-icon-red" },
    ],
  },
  {
    label: "Library",
    items: [
      { title: "Notes",          icon: StickyNote, path: "/notes", iconClass: "apple-icon-yellow" },
      { title: "Resource Vault", icon: BookOpen,   path: "/vault", iconClass: "apple-icon-purple" },
    ],
  },
  {
    label: "",
    items: [
      { title: "Settings", icon: Settings, path: "/settings", iconClass: "apple-icon-brown" },
    ],
  },
];

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0",
          "apple-vibrancy border-r",
          "border-r-[rgba(60,60,67,0.22)] dark:border-r-[rgba(84,84,88,0.45)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Logo ── */}
        <div className="h-14 flex items-center justify-between px-5"
          style={{ borderBottom: "0.5px solid rgba(60,60,67,0.18)" }}>
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-9 w-9 squircle-sm gradient-primary flex items-center justify-center shadow-sm"
              style={{ boxShadow: "0 2px 8px rgba(0,122,255,0.4)" }}>
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-[1.1]">
              <span
                className="text-[16px] font-bold tracking-tight"
                style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: "-0.3px" }}
              >
                DevSync
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
                Hub
              </span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 px-3 mb-1">
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
                        "flex items-center gap-3 px-3 py-2 rounded-[12px] text-[15px] font-medium transition-all duration-150",
                        active
                          ? "bg-[rgba(0,122,255,0.1)] text-[#007AFF] dark:bg-[rgba(10,132,255,0.15)] dark:text-[#0A84FF]"
                          : "text-foreground/80 hover:bg-secondary/70 hover:text-foreground"
                      )}
                      style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }}
                    >
                      {/* Squircle icon */}
                      <div className={cn(
                        "h-7 w-7 squircle-xs flex items-center justify-center shrink-0 transition-all duration-150",
                        active ? item.iconClass : "bg-secondary/80"
                      )}>
                        <item.icon
                          className={cn("h-3.5 w-3.5", active ? "text-white" : "text-muted-foreground")}
                          strokeWidth={active ? 2.5 : 2}
                        />
                      </div>
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div className="px-4 py-4" style={{ borderTop: "0.5px solid rgba(60,60,67,0.18)" }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center shrink-0"
              style={{ boxShadow: "0 2px 8px rgba(0,122,255,0.3)" }}>
              <span className="text-white text-xs font-bold">{user?.initials ?? 'DS'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate"
                style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }}>
                {user?.name ?? 'DevSync User'}
              </p>
              <p className="text-[12px] text-muted-foreground truncate">{user?.email ?? ''}</p>
            </div>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 rounded-lg shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sign out"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
