import { useState } from "react";
import { Plus, Sparkles, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
}

const initialSkills: Skill[] = [
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

const emptySkill = { name: "", level: "Beginner" as const, progress: 0 };

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Omit<Skill, "id">>(emptySkill);

  const openCreate = () => { setEditing(null); setForm(emptySkill); setDialogOpen(true); };
  const openEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, level: s.level, progress: s.progress }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editing) {
      setSkills(skills.map((s) => s.id === editing.id ? { ...s, ...form } : s));
      toast.success("Skill updated");
    } else {
      setSkills([...skills, { id: crypto.randomUUID(), ...form }]);
      toast.success("Skill added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { setSkills(skills.filter((s) => s.id !== id)); toast.success("Skill deleted"); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your technical skills</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Skill</span>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{skill.name}</h3>
                <Badge variant="outline" className={`text-[10px] mt-1 ${levelColor[skill.level]}`}>{skill.level}</Badge>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(skill)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(skill.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Skill" : "Add Skill"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Skill Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="React, Python..." /></div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as Skill["level"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Progress: {form.progress}%</Label>
              <Slider value={[form.progress]} onValueChange={([v]) => setForm({ ...form, progress: v })} max={100} step={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
