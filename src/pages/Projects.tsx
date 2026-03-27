import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  { id: "1", name: "Auth Service", tasks: 8, progress: 60 },
  { id: "2", name: "Frontend Redesign", tasks: 12, progress: 35 },
  { id: "3", name: "API Gateway", tasks: 5, progress: 80 },
  { id: "4", name: "Mobile App", tasks: 15, progress: 20 },
];

export default function Projects() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your workspace projects</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <FolderKanban className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-xs text-muted-foreground">{project.tasks} tasks</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
