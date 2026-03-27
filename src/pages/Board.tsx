import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High";
  project: string;
}

const columns: { id: string; title: string; color: string; tasks: Task[] }[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "bg-muted-foreground",
    tasks: [
      { id: "1", title: "Set up CI/CD pipeline", priority: "Medium", project: "DevOps" },
      { id: "2", title: "Write API documentation", priority: "Low", project: "Backend" },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    color: "bg-primary",
    tasks: [
      { id: "3", title: "Implement auth flow", priority: "High", project: "Auth Service" },
      { id: "4", title: "Design dashboard UI", priority: "Medium", project: "Frontend" },
      { id: "5", title: "Optimize DB queries", priority: "High", project: "Backend" },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-success",
    tasks: [
      { id: "6", title: "Setup project repo", priority: "Low", project: "DevOps" },
      { id: "7", title: "Create user model", priority: "Medium", project: "Backend" },
    ],
  },
];

const priorityColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-success/10 text-success border-success/20",
};

export default function Board() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Kanban view of your tasks</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {columns.map((col) => (
          <div
            key={col.id}
            className="min-w-[280px] sm:min-w-[300px] flex-1 snap-start"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {col.tasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{task.project}</span>
                    <Badge variant="outline" className={cn("text-[10px]", priorityColor[task.priority])}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}

              <button className="w-full p-2.5 rounded-lg border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors text-sm flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
