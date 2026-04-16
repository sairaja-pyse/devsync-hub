import { useState, useMemo, useEffect } from "react";
import {
  CheckSquare, Target, Briefcase, Flame, ArrowRight,
  Circle, CheckCircle2, ChevronRight, Sparkles,
  Clock, TrendingUp, BookOpen, FileText, Pin,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { getAllMeta, type ResourceMeta } from "@/lib/resourceStorage";
import { CATEGORY_STYLES } from "@/pages/ResourceVault";
import { useCollection } from "@/hooks/useCollection";

// ─── Firestore data shapes (must match the respective pages exactly) ──────────

interface BoardTask {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  project: string;
  dueDate: string;
  columnId: string;
  order: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  category: string;
}

interface Application {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  appliedDate: string;
  notes: string;
  link?: string;
}

// ─── Static display helpers ───────────────────────────────────────────────────

const priorityDot: Record<string, string> = {
  High:   "#FF3B30",
  Medium: "#FF9500",
  Low:    "#34C759",
};

const statusStyle: Record<string, { bg: string; text: string }> = {
  Applied:   { bg: "rgba(0,122,255,0.10)",   text: "#007AFF" },
  Interview: { bg: "rgba(255,149,0,0.10)",   text: "#FF9500" },
  Offer:     { bg: "rgba(52,199,89,0.10)",   text: "#34C759" },
  Rejected:  { bg: "rgba(255,59,48,0.10)",   text: "#FF3B30" },
};

// Category → ring colour for goals (falls back to cycling palette)
const CATEGORY_COLORS: Record<string, string> = {
  Career:     "#007AFF",
  Health:     "#34C759",
  Finance:    "#FFCC00",
  Education:  "#FF9500",
  Personal:   "#AF52DE",
  Fitness:    "#FF2D55",
  Learning:   "#30B0C7",
};
const GOAL_PALETTE = ["#FF3B30", "#FF9500", "#34C759", "#007AFF", "#AF52DE", "#FF2D55"];
function goalColor(category: string, idx: number) {
  return CATEGORY_COLORS[category] ?? GOAL_PALETTE[idx % GOAL_PALETTE.length];
}

// Company logo = first 2 chars; colour cycles through palette
const APP_PALETTE = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#FF2D55", "#30B0C7"];
function appInitials(company: string) { return company.slice(0, 2).toUpperCase() || "??"; }
function appColor(idx: number)        { return APP_PALETTE[idx % APP_PALETTE.length]; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Activity Ring ─────────────────────────────────────────────────────────────
function ActivityRing({
  progress, color, trackOpacity = 0.15, size = 56, stroke = 6, children,
}: {
  progress: number; color: string; trackOpacity?: number;
  size?: number; stroke?: number; children?: React.ReactNode;
}) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(progress, 100) / 100) * circ;
  const half   = size / 2;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={half} cy={half} r={r} fill="none" stroke={color} strokeOpacity={trackOpacity} strokeWidth={stroke} />
        <circle cx={half} cy={half} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

// ─── Three-ring stack ─────────────────────────────────────────────────────────
function ActivityRings({ tasks, goals }: { tasks: number; goals: number }) {
  const outerSize = 96, midSize = 72, innerSize = 48, stroke = 9;
  const rings = [
    { progress: tasks, color: "#FF3B30", size: outerSize, stroke },
    { progress: goals, color: "#34C759", size: midSize,   stroke: stroke - 1 },
    { progress: 0,     color: "#007AFF", size: innerSize, stroke: stroke - 2 },
  ];
  return (
    <div className="relative" style={{ width: outerSize, height: outerSize }}>
      {rings.map(({ progress, color, size, stroke: sw }, i) => {
        const offset = (outerSize - size) / 2;
        return (
          <div key={i} className="absolute" style={{ top: offset, left: offset, width: size, height: size }}>
            <ActivityRing progress={progress} color={color} size={size} stroke={sw} trackOpacity={0.18} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Pinned Resource Card ─────────────────────────────────────────────────────
function PinnedResourceCard({ meta }: { meta: ResourceMeta }) {
  const s     = CATEGORY_STYLES[meta.category];
  const isImg = meta.mimeType.startsWith("image/");
  return (
    <Link to="/vault" className="group apple-widget p-0 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 flex-shrink-0 w-36 sm:w-40">
      <div className="relative h-24 overflow-hidden bg-secondary/30">
        {isImg && meta.thumbnail ? (
          <img src={meta.thumbnail} alt={meta.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(145deg, ${s.color}18, ${s.color}08)` }}>
            <FileText className="h-10 w-10 opacity-30" style={{ color: s.color }} />
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,122,255,0.85)", backdropFilter: "blur(6px)" }}>
          <Pin className="h-2.5 w-2.5 text-white" fill="white" />
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-foreground truncate">{meta.name.replace(/\.[^.]+$/, "")}</p>
        <span className="text-[10px] font-semibold" style={{ color: s.color }}>{meta.category}</span>
      </div>
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  // ── Real-time Firestore data ──────────────────────────────────────────────
  const { items: allTasks,  loading: tasksLoading,  update: updateTask }  = useCollection<BoardTask>('board_tasks', '_createdAt', 'asc');
  const { items: allGoals,  loading: goalsLoading  }                       = useCollection<Goal>('goals', '_createdAt', 'desc');
  const { items: allApps,   loading: appsLoading   }                       = useCollection<Application>('jobs', '_createdAt', 'desc');

  const [pinnedResources] = useState<ResourceMeta[]>(() =>
    getAllMeta().filter((r) => r.pinned).slice(0, 6),
  );

  const greeting = useMemo(getGreeting, []);
  const today    = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // ── Derived values ────────────────────────────────────────────────────────
  // Tasks: show up to 6; "done" = columnId === 'done'
  const displayTasks = allTasks.slice(0, 6);
  const done         = allTasks.filter(t => t.columnId === "done").length;
  const pending      = allTasks.length - done;
  const taskPct      = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;

  // Goals: average progress
  const goalAvgPct = allGoals.length > 0
    ? Math.round(allGoals.reduce((s, g) => s + g.progress, 0) / allGoals.length)
    : 0;

  // Applications: show 5 most recent
  const displayApps = allApps.slice(0, 5);

  // ── Toggle task done/undone in Firestore ──────────────────────────────────
  async function toggleTask(task: BoardTask) {
    const newCol = task.columnId === "done" ? "backlog" : "done";
    await updateTask(task.id, { columnId: newCol });
  }

  const loading = tasksLoading || goalsLoading || appsLoading;

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 animate-fade-in pb-24 sm:pb-8 max-w-7xl mx-auto" style={{ minHeight: "100%" }}>

      {/* ══ ROW 1 — Hero Greeting ══ */}
      <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-8" style={{
        background: "linear-gradient(145deg, #409CFF 0%, #007AFF 50%, #5856D6 100%)",
        boxShadow: "0 4px 24px rgba(0,122,255,0.4), 0 12px 48px rgba(0,122,255,0.2)",
      }}>
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff, transparent 70%)" }} />
        <div className="absolute bottom-0 right-8 h-24 w-24 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff, transparent 70%)" }} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-white/70" />
              <span className="text-ios-caption1 text-white/70 tracking-wider font-medium uppercase">{today}</span>
            </div>
            <h1 className="text-white leading-tight mb-2" style={{
              fontFamily: '-apple-system, "SF Pro Display", "Space Grotesk", sans-serif',
              fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700, letterSpacing: "-0.5px",
            }}>
              {greeting} 👋
            </h1>
            <p className="text-white/75 text-ios-callout max-w-sm">
              {loading
                ? "Loading your data…"
                : pending > 0
                  ? `You have ${pending} pending task${pending !== 1 ? "s" : ""}`
                  : allTasks.length === 0
                    ? "Add your first task to get started"
                    : "All tasks done!"
              }
              {!loading && ` · ${allGoals.length} active ${allGoals.length === 1 ? "goal" : "goals"}`}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <Flame className="h-3.5 w-3.5" />
                {done} done today
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <TrendingUp className="h-3.5 w-3.5" />
                {allTasks.length} tasks
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
            <ActivityRings tasks={taskPct} goals={goalAvgPct} />
            <div className="flex flex-col gap-0.5 text-right">
              {[{ label: "Tasks", color: "#FF3B30" }, { label: "Goals", color: "#34C759" }, { label: "Streak", color: "#007AFF" }]
                .map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 justify-end">
                    <span className="text-[10px] text-white/70 font-medium">{label}</span>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 2 — 4 Stat Cards ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: "Total Tasks",   value: loading ? "—" : allTasks.length,
            subtitle: loading ? "Loading…" : `${done} completed · ${pending} pending`,
            icon: CheckSquare, gradient: "blue" as const,
          },
          {
            title: "Active Goals",  value: loading ? "—" : allGoals.length,
            subtitle: loading ? "Loading…" : allGoals.length > 0
              ? `Avg ${goalAvgPct}% progress`
              : "No goals yet",
            icon: Target, gradient: "green" as const,
          },
          {
            title: "Applications",  value: loading ? "—" : allApps.length,
            subtitle: loading ? "Loading…" : allApps.length > 0
              ? `${allApps.filter(a => a.status === "Interview").length} interview${allApps.filter(a => a.status === "Interview").length !== 1 ? "s" : ""} · ${allApps.filter(a => a.status === "Offer").length} offer${allApps.filter(a => a.status === "Offer").length !== 1 ? "s" : ""}`
              : "No applications yet",
            icon: Briefcase, gradient: "amber" as const,
          },
          {
            title: "Completed",     value: loading ? "—" : done,
            subtitle: loading ? "Loading…" : allTasks.length > 0
              ? `${taskPct}% of all tasks`
              : "Add tasks to start",
            icon: Flame, gradient: "purple" as const,
          },
        ].map((card, i) => (
          <StatCard key={card.title} {...card} className={cn("animate-spring-in", `stagger-${i + 1}`)} />
        ))}
      </div>

      {/* ══ ROW 3 — Tasks + Goals ══ */}
      <div className="grid lg:grid-cols-5 gap-3">

        {/* ── Today's Tasks ── */}
        <div className="lg:col-span-3 apple-widget p-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 squircle-sm apple-icon-blue flex items-center justify-center">
                <Clock className="h-4.5 w-4.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-ios-headline font-bold text-foreground">Tasks</p>
                <p className="text-ios-caption1 text-muted-foreground">{done}/{allTasks.length} complete</p>
              </div>
            </div>
            <Link to="/board">
              <button className="flex items-center gap-1 text-[#007AFF] text-ios-subhead font-semibold hover:opacity-70 transition-opacity">
                All <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-4">
            <div className="ios-progress">
              <div className="ios-progress-fill" style={{
                width: `${taskPct}%`,
                background: "linear-gradient(90deg, #409CFF, #007AFF)",
              }} />
            </div>
          </div>

          {/* Task list */}
          <div>
            {tasksLoading && (
              <div className="px-5 py-6 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-[#007AFF]/30 border-t-[#007AFF] animate-spin" />
              </div>
            )}
            {!tasksLoading && allTasks.length === 0 && (
              <div className="px-5 py-8 flex flex-col items-center text-center">
                <CheckSquare className="h-9 w-9 text-muted-foreground/20 mb-2" />
                <p className="text-ios-subhead font-semibold text-muted-foreground/60">No tasks yet</p>
                <p className="text-ios-caption1 text-muted-foreground/40 mt-0.5">Go to Board to add tasks</p>
              </div>
            )}
            {displayTasks.map((task) => {
              const isDone = task.columnId === "done";
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ios-separator",
                    isDone ? "opacity-50" : "hover:bg-secondary/50 active:bg-secondary",
                  )}
                >
                  <div className="shrink-0 w-10 flex items-center justify-center">
                    {isDone
                      ? <CheckCircle2 className="h-6 w-6" style={{ color: "#007AFF" }} />
                      : <Circle className="h-6 w-6 text-muted-foreground/30" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-ios-subhead font-medium text-foreground", isDone && "line-through text-muted-foreground")}>
                      {task.title}
                    </p>
                    <p className="text-ios-caption1 text-muted-foreground">{task.project || task.columnId}</p>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: priorityDot[task.priority] ?? "#8E8E93" }} />
                </button>
              );
            })}
            {allTasks.length > 6 && (
              <p className="px-5 py-2 text-ios-caption1 text-muted-foreground/50 text-center">
                +{allTasks.length - 6} more tasks on the board
              </p>
            )}
          </div>

          <div className="px-5 py-3.5 border-t border-border/50">
            <Link to="/board">
              <Button variant="ghost" size="sm" className="w-full rounded-xl text-[#007AFF] hover:bg-[#007AFF]/8 font-semibold">
                View all tasks <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Goals ── */}
        <div className="lg:col-span-2 apple-widget p-0 overflow-hidden flex flex-col">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 squircle-sm apple-icon-green flex items-center justify-center">
                <Target className="h-4.5 w-4.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-ios-headline font-bold text-foreground">Goals</p>
                <p className="text-ios-caption1 text-muted-foreground">{allGoals.length} active</p>
              </div>
            </div>
            <Link to="/goals">
              <button className="flex items-center gap-1 text-[#007AFF] text-ios-subhead font-semibold hover:opacity-70 transition-opacity">
                All <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          <div className="flex-1 divide-y divide-border/50">
            {goalsLoading && (
              <div className="px-5 py-6 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-[#34C759]/30 border-t-[#34C759] animate-spin" />
              </div>
            )}
            {!goalsLoading && allGoals.length === 0 && (
              <div className="px-5 py-8 flex flex-col items-center text-center">
                <Target className="h-9 w-9 text-muted-foreground/20 mb-2" />
                <p className="text-ios-subhead font-semibold text-muted-foreground/60">No goals yet</p>
                <p className="text-ios-caption1 text-muted-foreground/40 mt-0.5">Go to Goals to set one</p>
              </div>
            )}
            {allGoals.slice(0, 5).map((goal, idx) => {
              const color = goalColor(goal.category, idx);
              return (
                <div key={goal.id} className="flex items-center gap-4 px-5 py-4">
                  <ActivityRing progress={goal.progress} color={color} size={52} stroke={5} trackOpacity={0.15}>
                    <span className="text-[11px] font-bold" style={{ color }}>{goal.progress}</span>
                  </ActivityRing>
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-subhead font-semibold text-foreground truncate">{goal.title}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      {goal.category && (
                        <span className="text-ios-caption1 font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${color}18`, color }}>
                          {goal.category}
                        </span>
                      )}
                      <span className="text-ios-caption2 text-muted-foreground">
                        {goal.progress >= 100 ? "Complete!" : goal.progress >= 70 ? "Almost there!" : "In progress"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3.5 border-t border-border/50">
            <Link to="/goals">
              <Button variant="ghost" size="sm" className="w-full rounded-xl text-[#007AFF] hover:bg-[#007AFF]/8 font-semibold">
                Manage goals <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ ROW 4 — Recent Applications ══ */}
      <div className="apple-widget p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 squircle-sm apple-icon-orange flex items-center justify-center">
              <Briefcase className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-ios-headline font-bold text-foreground">Recent Applications</p>
              <p className="text-ios-caption1 text-muted-foreground">
                {appsLoading ? "Loading…" : `${allApps.length} total`}
              </p>
            </div>
          </div>
          <Link to="/jobs">
            <button className="flex items-center gap-1 text-[#007AFF] text-ios-subhead font-semibold hover:opacity-70 transition-opacity">
              All <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        <div>
          {appsLoading && (
            <div className="px-5 py-6 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-[#FF9500]/30 border-t-[#FF9500] animate-spin" />
            </div>
          )}
          {!appsLoading && allApps.length === 0 && (
            <div className="px-5 py-8 flex flex-col items-center text-center">
              <Briefcase className="h-9 w-9 text-muted-foreground/20 mb-2" />
              <p className="text-ios-subhead font-semibold text-muted-foreground/60">No applications yet</p>
              <p className="text-ios-caption1 text-muted-foreground/40 mt-0.5">Go to Job Tracker to add one</p>
            </div>
          )}
          {displayApps.map((app, idx) => {
            const style = statusStyle[app.status] ?? { bg: "rgba(142,142,147,0.1)", text: "#8E8E93" };
            const color = appColor(idx);
            return (
              <div key={app.id} className="flex items-center gap-4 px-5 py-4 ios-separator hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="h-11 w-11 squircle-sm flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ background: `linear-gradient(145deg, ${color}cc, ${color})` }}>
                  {appInitials(app.company)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ios-subhead font-semibold text-foreground">{app.company}</p>
                  <p className="text-ios-caption1 text-muted-foreground">{app.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-ios-caption1 font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: style.bg, color: style.text }}>
                    {app.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3.5 border-t border-border/50">
          <Link to="/jobs">
            <Button variant="ghost" size="sm" className="w-full rounded-xl text-[#007AFF] hover:bg-[#007AFF]/8 font-semibold">
              View all applications <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ══ ROW 5 — Pinned Resources ══ */}
      <div className="apple-widget p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 squircle-sm apple-icon-purple flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-ios-headline font-bold text-foreground">Resource Vault</p>
              <p className="text-ios-caption1 text-muted-foreground">
                {pinnedResources.length > 0 ? `${pinnedResources.length} pinned` : "Your files, one place"}
              </p>
            </div>
          </div>
          <Link to="/vault">
            <button className="flex items-center gap-1 text-[#007AFF] text-ios-subhead font-semibold hover:opacity-70 transition-opacity">
              Open <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {pinnedResources.length > 0 ? (
          <div className="px-5 py-4 flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {pinnedResources.map((meta) => <PinnedResourceCard key={meta.id} meta={meta} />)}
          </div>
        ) : (
          <div className="px-5 py-8 flex flex-col items-center text-center">
            <div className="h-12 w-12 squircle-sm flex items-center justify-center mb-3" style={{ background: "rgba(175,82,222,0.08)" }}>
              <Pin className="h-5 w-5 text-[#AF52DE] opacity-50" />
            </div>
            <p className="text-ios-subhead font-semibold text-foreground">No pinned files yet</p>
            <p className="text-ios-caption1 text-muted-foreground mt-1 max-w-xs">
              Add files in the Vault and pin them for quick access here
            </p>
          </div>
        )}

        <div className="px-5 py-3.5 border-t border-border/50">
          <Link to="/vault">
            <Button variant="ghost" size="sm" className="w-full rounded-xl text-[#007AFF] hover:bg-[#007AFF]/8 font-semibold">
              Go to Resource Vault <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
