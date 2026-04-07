import { useState } from "react";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  category: string;
}

const emptyGoal = { title: "", description: "", progress: 0, targetDate: "", category: "" };

export default function Goals() {
  const { items: goals, add, update, remove } = useCollection<Goal>('goals', '_createdAt', 'desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyGoal);

  const openCreate = () => { setEditing(null); setForm(emptyGoal); setDialogOpen(true); };
  const openEdit = (g: Goal) => { setEditing(g); setForm({ title: g.title, description: g.description, progress: g.progress, targetDate: g.targetDate, category: g.category }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (editing) {
      await update(editing.id, form);
      toast.success("Goal updated");
    } else {
      await add({ ...form });
      toast.success("Goal created");
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => { await remove(id); toast.success("Goal deleted"); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your personal and career goals</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Goal</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow group">
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
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(goal)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(goal.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Goal title" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Career" /></div>
              <div className="space-y-2"><Label>Target Date</Label><Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Progress: {form.progress}%</Label>
              <Slider value={[form.progress]} onValueChange={([v]) => setForm({ ...form, progress: v })} max={100} step={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
