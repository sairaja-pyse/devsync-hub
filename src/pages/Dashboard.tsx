import {
  CheckSquare,
  Target,
  Briefcase,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const todayTasks = [
  { id: 1, title: "Fix authentication bug", priority: "High", project: "Auth Service" },
  { id: 2, title: "Review PR #234", priority: "Medium", project: "Frontend" },
  { id: 3, title: "Write unit tests for API", priority: "Low", project: "Backend" },
];

const activeGoals = [
  { id: 1, title: "Crack SDE Job", progress: 65, category: "Career" },
  { id: 2, title: "Learn System Design", progress: 40, category: "Learning" },
  { id: 3, title: "Master TypeScript", progress: 80, category: "Skills" },
];

const recentApps = [
  { company: "Google", role: "SDE II", status: "Interview" },
  { company: "Meta", role: "Frontend Engineer", status: "Applied" },
  { company: "Stripe", role: "Full Stack", status: "Offer" },
];

const priorityColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-success/10 text-success border-success/20",
};

const statusColor: Record<string, string> = {
  Applied: "bg-info/10 text-info border-info/20",
  Interview: "bg-warning/10 text-warning border-warning/20",
  Offer: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Good morning 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Tasks Today"
          value={3}
          subtitle="2 in progress"
          icon={CheckSquare}
          trend={{ value: "12%", positive: true }}
        />
        <StatCard
          title="Active Goals"
          value={5}
          subtitle="2 near deadline"
          icon={Target}
        />
        <StatCard
          title="Applications"
          value={12}
          subtitle="3 interviews"
          icon={Briefcase}
          trend={{ value: "4 this week", positive: true }}
        />
        <StatCard
          title="Streak"
          value="7 days"
          subtitle="Keep it up!"
          icon={Zap}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Today's Tasks
            </h2>
            <span className="text-xs text-muted-foreground">{todayTasks.length} tasks</span>
          </div>
          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="h-5 w-5 rounded border-2 border-muted-foreground/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.project}</p>
                </div>
                <Badge variant="outline" className={priorityColor[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Active Goals */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Active Goals
          </h2>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{goal.title}</p>
                  <span className="text-xs font-medium text-muted-foreground">
                    {goal.progress}%
                  </span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{goal.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Applications */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Recent Applications
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentApps.map((app, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-secondary/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{app.company}</p>
                <Badge variant="outline" className={statusColor[app.status]}>
                  {app.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{app.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
