import { useState, useMemo } from "react";
import {
  CheckSquare,
  Target,
  Briefcase,
  Zap,
  Clock,
  TrendingUp,
  ArrowRight,
  Flame,
  Sparkles,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const todayTasks = [
  { id: 1, title: "Fix authentication bug", priority: "High", project: "Auth Service", done: false },
  { id: 2, title: "Review PR #234", priority: "Medium", project: "Frontend", done: false },
  { id: 3, title: "Write unit tests for API", priority: "Low", project: "Backend", done: false },
];

const activeGoals = [
  { id: 1, title: "Crack SDE Job", progress: 65, category: "Career", color: "primary" },
  { id: 2, title: "Learn System Design", progress: 40, category: "Learning", color: "warning" },
  { id: 3, title: "Master TypeScript", progress: 80, category: "Skills", color: "success" },
];

const recentApps = [
  { company: "Google", role: "SDE II", status: "Interview", logo: "G" },
  { company: "Meta", role: "Frontend Engineer", status: "Applied", logo: "M" },
  { company: "Stripe", role: "Full Stack", status: "Offer", logo: "S" },
];

const priorityConfig: Record<string, { class: string; dot: string }> = {
  High: { class: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  Medium: { class: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning" },
  Low: { class: "bg-success/10 text-success border-success/20", dot: "bg-success" },
};

const statusConfig: Record<string, { class: string; bg: string }> = {
  Applied: { class: "text-info", bg: "bg-info/10" },
  Interview: { class: "text-warning", bg: "bg-warning/10" },
  Offer: { class: "text-success", bg: "bg-success/10" },
  Rejected: { class: "text-destructive", bg: "bg-destructive/10" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [tasks, setTasks] = useState(todayTasks);
  const greeting = useMemo(getGreeting, []);
  const completedCount = tasks.filter((t) => t.done).length;

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in pb-24 sm:pb-8">
      {/* Hero Greeting */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 sm:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary-glow)/0.3),transparent_60%)]" />
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary-foreground/5 blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 opacity-80" />
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-sm opacity-80 mt-1.5 max-w-md">
            You have {tasks.filter((t) => !t.done).length} pending tasks and {activeGoals.length} active goals. Let's make progress!
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-primary-foreground/15 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <Flame className="h-3.5 w-3.5" />
              7 day streak
            </div>
            <div className="flex items-center gap-1.5 bg-primary-foreground/15 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              +12% this week
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Tasks Today"
          value={tasks.length}
          subtitle={`${completedCount} completed`}
          icon={CheckSquare}
          trend={{ value: "12%", positive: true }}
          gradient="blue"
        />
        <StatCard
          title="Active Goals"
          value={5}
          subtitle="2 near deadline"
          icon={Target}
          gradient="green"
        />
        <StatCard
          title="Applications"
          value={12}
          subtitle="3 interviews"
          icon={Briefcase}
          trend={{ value: "4 this week", positive: true }}
          gradient="amber"
        />
        <StatCard
          title="Streak"
          value="7 days"
          subtitle="Keep it up!"
          icon={Zap}
          gradient="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Today's Tasks - wider */}
        <div className="lg:col-span-3 rounded-2xl border bg-card shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Today's Tasks
            </h2>
            <Link to="/board">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Mini progress */}
          <div className="flex items-center gap-3">
            <Progress value={(completedCount / tasks.length) * 100} className="h-1.5 flex-1" />
            <span className="text-xs font-mono font-medium text-muted-foreground">
              {completedCount}/{tasks.length}
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left group",
                  task.done
                    ? "bg-muted/50 opacity-60"
                    : "bg-secondary/50 hover:bg-secondary hover:shadow-sm"
                )}
              >
                <div className="shrink-0">
                  {task.done ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", task.done && "line-through")}>{task.title}</p>
                  <p className="text-[11px] text-muted-foreground">{task.project}</p>
                </div>
                <div className={cn("h-2 w-2 rounded-full shrink-0", priorityConfig[task.priority].dot)} />
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-success" />
              </div>
              Goals
            </h2>
            <Link to="/goals">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="space-y-2.5 p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{goal.title}</p>
                  <span className="text-xs font-mono font-bold text-primary">
                    {goal.progress}%
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] h-5">{goal.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {goal.progress >= 70 ? "Almost there!" : "In progress"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Applications */}
      <div className="rounded-2xl border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-warning" />
            </div>
            Recent Applications
          </h2>
          <Link to="/jobs">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentApps.map((app, i) => (
            <div
              key={i}
              className="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all hover-lift space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm",
                  statusConfig[app.status].bg,
                  statusConfig[app.status].class
                )}>
                  {app.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{app.company}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn("text-[10px]", statusConfig[app.status].class)}>
                  {app.status}
                </Badge>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
