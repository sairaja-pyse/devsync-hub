import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const goals = [
  { id: "1", title: "Crack SDE Job", description: "Prepare for top tech companies", progress: 65, targetDate: "2026-06-01", category: "Career" },
  { id: "2", title: "Learn System Design", description: "Master distributed systems concepts", progress: 40, targetDate: "2026-08-01", category: "Learning" },
  { id: "3", title: "Master TypeScript", description: "Advanced TS patterns and generics", progress: 80, targetDate: "2026-05-01", category: "Skills" },
  { id: "4", title: "Improve DSA", description: "Solve 300+ LeetCode problems", progress: 55, targetDate: "2026-07-01", category: "Preparation" },
  { id: "5", title: "Become Senior Engineer", description: "Build leadership and architecture skills", progress: 25, targetDate: "2027-01-01", category: "Career" },
];

export default function Goals() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your personal and career goals</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Goal</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <Badge variant="outline" className="text-[10px]">{goal.category}</Badge>
                <span className="font-semibold">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
