import { useState, useMemo } from "react";
import { useCollection } from "@/hooks/useCollection";
import {
  Plus, FolderKanban, Pencil, Trash2, Search, CheckCircle2,
  Circle, PauseCircle, ChevronRight, LayoutGrid, List,
  CalendarDays, Layers, TrendingUp, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProjectStatus = "active" | "paused" | "completed";
type ProjectColor =
  | "blue" | "purple" | "green" | "orange" | "red" | "pink" | "teal" | "indigo";

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: number;
  completedTasks: number;
  progress: number;
  status: ProjectStatus;
  color: ProjectColor;
  dueDate?: string;
  updatedAt: string;
}


const COLOR_OPTIONS: { value: ProjectColor; label: string }[] = [
  { value: "blue",   label: "Blue"   },
  { value: "purple", label: "Purple" },
  { value: "green",  label: "Green"  },
  { value: "orange", label: "Orange" },
  { value: "red",    label: "Red"    },
  { value: "pink",   label: "Pink"   },
  { value: "teal",   label: "Teal"   },
  { value: "indigo", label: "Indigo" },
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active",    label: "Active"    },
  { value: "paused",    label: "Paused"    },
  { value: "completed", label: "Completed" },
];

function statusConfig(status: ProjectStatus) {
  switch (status) {
    case "active":
      return {
        icon: <Circle className="h-3 w-3" />,
        label: "Active",
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    case "paused":
      return {
        icon: <PauseCircle className="h-3 w-3" />,
        label: "Paused",
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    case "completed":
      return {
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: "Done",
        classes: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
        dot: "bg-blue-500",
      };
  }
}

function progressColor(pct: number) {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 40) return "bg-primary";
  return "bg-amber-500";
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type FilterStatus = "all" | ProjectStatus;
type ViewMode = "grid" | "list";

const defaultForm = {
  name: "",
  description: "",
  status: "active" as ProjectStatus,
  color: "blue" as ProjectColor,
  tasks: 0,
  completedTasks: 0,
  progress: 0,
  dueDate: "",
};

export default function Projects() {
  const { items: projects, loading, add, update, remove } = useCollection<Project>('projects', '_createdAt', 'desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      status: p.status,
      color: p.color,
      tasks: p.tasks,
      completedTasks: p.completedTasks,
      progress: p.progress,
      dueDate: p.dueDate ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Project name is required"); return; }
    try {
      const now = new Date().toISOString();
      if (editing) {
        await update(editing.id, { ...form, updatedAt: now, dueDate: form.dueDate || undefined });
        toast.success("Project updated");
      } else {
        await add({ ...form, updatedAt: now, dueDate: form.dueDate || undefined });
        toast.success("Project created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    toast.success("Project deleted");
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, search, filterStatus]);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    paused: projects.filter((p) => p.status === "paused").length,
    completed: projects.filter((p) => p.status === "completed").length,
    avgProgress: Math.round(projects.reduce((s, p) => s + p.progress, 0) / (projects.length || 1)),
  }), [projects]);

  const filterTabs: { value: FilterStatus; label: string; count: number }[] = [
    { value: "all",       label: "All",       count: stats.total     },
    { value: "active",    label: "Active",    count: stats.active    },
    { value: "paused",    label: "Paused",    count: stats.paused    },
    { value: "completed", label: "Done",      count: stats.completed },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total} projects · {stats.avgProgress}% avg progress
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 rounded-xl shadow-sm gradient-primary text-white border-0 h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">New Project</span>
        </Button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,     icon: Layers,     color: "text-primary"        },
          { label: "Active",    value: stats.active,    icon: TrendingUp, color: "text-emerald-500"    },
          { label: "Paused",    value: stats.paused,    icon: PauseCircle,color: "text-amber-500"      },
          { label: "Completed", value: stats.completed, icon: CheckCircle2,color: "text-blue-500"      },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div
            key={label}
            className={cn("ios-card p-4 flex items-center gap-3 animate-slide-up", `stagger-${i + 1}`)}
            style={{ animationFillMode: "both" }}
          >
            <div className={cn("h-9 w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter + View Toggle ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 rounded-xl bg-secondary/70 border-0 h-10 focus-visible:ring-1"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-secondary/70 rounded-xl p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                filterStatus === tab.value
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                  filterStatus === tab.value
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-secondary/70 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="ios-card flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 animate-float">
            <FolderKanban className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">
            {search || filterStatus !== "all" ? "No matching projects" : "No projects yet"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            {search || filterStatus !== "all"
              ? "Try adjusting your search or filter."
              : "Create your first project to start tracking tasks and progress."}
          </p>
          {!search && filterStatus === "all" && (
            <Button onClick={openCreate} className="mt-5 rounded-xl gradient-primary text-white border-0">
              <Plus className="h-4 w-4 mr-2" /> Create project
            </Button>
          )}
        </div>
      )}

      {/* ── Grid View ── */}
      {filtered.length > 0 && viewMode === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const st = statusConfig(project.status);
            const pColor = progressColor(project.progress);
            return (
              <div
                key={project.id}
                className={cn("ios-card-hover group p-0 overflow-hidden animate-spring-in", `stagger-${Math.min(i + 1, 6)}`)}
                style={{ animationFillMode: "both" }}
              >
                {/* Color accent strip + icon */}
                <div className={cn("project-color-" + project.color, "h-1.5 w-full")} />

                <div className="p-5 space-y-4">
                  {/* Title row */}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "project-color-" + project.color,
                      "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    )}>
                      <FolderKanban className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base leading-tight truncate">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEdit(project)} className="gap-2 rounded-lg">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(project.id)}
                          className="gap-2 rounded-lg text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status + Due date */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("ios-badge gap-1", st.classes)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                      {st.label}
                    </span>
                    {project.dueDate && (
                      <span className="ios-badge bg-secondary text-muted-foreground gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(project.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Progress</span>
                      <span className="font-bold tabular-nums">{project.progress}%</span>
                    </div>
                    <div className="ios-progress">
                      <div
                        className={cn("ios-progress-fill", pColor)}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{project.completedTasks}</span>
                      /{project.tasks} tasks done
                    </span>
                    <button
                      onClick={() => openEdit(project)}
                      className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {filtered.length > 0 && viewMode === "list" && (
        <div className="ios-card overflow-hidden divide-y divide-border/50 animate-fade-in">
          {filtered.map((project, i) => {
            const st = statusConfig(project.status);
            const pColor = progressColor(project.progress);
            return (
              <div
                key={project.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group"
              >
                {/* Color icon */}
                <div className={cn(
                  "project-color-" + project.color,
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                )}>
                  <FolderKanban className="h-5 w-5 text-white" />
                </div>

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{project.name}</span>
                    <span className={cn("ios-badge hidden sm:inline-flex", st.classes)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
                </div>

                {/* Progress */}
                <div className="hidden sm:flex items-center gap-3 w-40 shrink-0">
                  <div className="flex-1 ios-progress">
                    <div className={cn("ios-progress-fill", pColor)} style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums w-8 text-right">{project.progress}%</span>
                </div>

                {/* Tasks */}
                <span className="hidden lg:block text-xs text-muted-foreground w-20 shrink-0 text-right">
                  {project.completedTasks}/{project.tasks} tasks
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editing ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Project Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mobile App Redesign"
                className="rounded-xl h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What is this project about?"
                className="rounded-xl resize-none text-sm"
                rows={3}
              />
            </div>

            {/* Status + Color row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Status</Label>
                <div className="flex flex-col gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: opt.value })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                        form.status === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {(() => {
                        const cfg = statusConfig(opt.value);
                        return <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />;
                      })()}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      title={c.label}
                      className={cn(
                        "h-8 w-8 rounded-xl transition-all project-color-" + c.value,
                        form.color === c.value
                          ? "ring-2 ring-offset-2 ring-foreground/30 scale-110"
                          : "opacity-70 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks + Progress row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Total Tasks</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.tasks}
                  onChange={(e) => setForm({ ...form, tasks: Number(e.target.value) })}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Done Tasks</Label>
                <Input
                  type="number"
                  min={0}
                  max={form.tasks}
                  value={form.completedTasks}
                  onChange={(e) => setForm({ ...form, completedTasks: Number(e.target.value) })}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Progress slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm font-semibold">Progress</Label>
                <span className="text-sm font-bold text-primary">{form.progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full accent-primary h-2 rounded-full cursor-pointer"
              />
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Due Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl flex-1 sm:flex-none gradient-primary text-white border-0 font-semibold"
            >
              {editing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
