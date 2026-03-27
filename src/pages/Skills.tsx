import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const skills = [
  { id: "1", name: "Data Structures & Algorithms", level: "Intermediate", progress: 65 },
  { id: "2", name: "Frontend (React)", level: "Advanced", progress: 85 },
  { id: "3", name: "Backend (Node.js)", level: "Intermediate", progress: 60 },
  { id: "4", name: "System Design", level: "Beginner", progress: 30 },
  { id: "5", name: "DevOps", level: "Beginner", progress: 20 },
  { id: "6", name: "TypeScript", level: "Advanced", progress: 80 },
];

const levelColor: Record<string, string> = {
  Beginner: "bg-info/10 text-info border-info/20",
  Intermediate: "bg-warning/10 text-warning border-warning/20",
  Advanced: "bg-success/10 text-success border-success/20",
};

export default function Skills() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your technical skills</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Skill</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{skill.name}</h3>
                <Badge variant="outline" className={`text-[10px] mt-1 ${levelColor[skill.level]}`}>
                  {skill.level}
                </Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{skill.progress}%</span>
              </div>
              <Progress value={skill.progress} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
