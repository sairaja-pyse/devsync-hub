import { useState } from "react";
import { Plus, Briefcase, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Application {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  appliedDate: string;
  notes: string;
}

const initialApps: Application[] = [
  { id: "1", company: "Google", role: "SDE II", status: "Interview", appliedDate: "2026-03-10", notes: "Completed phone screen" },
  { id: "2", company: "Meta", role: "Frontend Engineer", status: "Applied", appliedDate: "2026-03-15", notes: "Referred by friend" },
  { id: "3", company: "Stripe", role: "Full Stack Engineer", status: "Offer", appliedDate: "2026-02-28", notes: "Negotiating compensation" },
  { id: "4", company: "Amazon", role: "SDE I", status: "Rejected", appliedDate: "2026-03-01", notes: "Try again in 6 months" },
  { id: "5", company: "Netflix", role: "Senior Frontend", status: "Applied", appliedDate: "2026-03-20", notes: "" },
  { id: "6", company: "Microsoft", role: "SDE II", status: "Interview", appliedDate: "2026-03-12", notes: "System design round next" },
];

const statusColor: Record<string, string> = {
  Applied: "bg-info/10 text-info border-info/20",
  Interview: "bg-warning/10 text-warning border-warning/20",
  Offer: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const emptyApp = { company: "", role: "", status: "Applied" as const, appliedDate: "", notes: "" };

export default function Jobs() {
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [form, setForm] = useState<Omit<Application, "id">>(emptyApp);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const openCreate = () => { setEditing(null); setForm(emptyApp); setDialogOpen(true); };
  const openEdit = (a: Application) => { setEditing(a); setForm({ company: a.company, role: a.role, status: a.status, appliedDate: a.appliedDate, notes: a.notes }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.company.trim()) { toast.error("Company is required"); return; }
    if (editing) {
      setApps(apps.map((a) => a.id === editing.id ? { ...a, ...form } : a));
      toast.success("Application updated");
    } else {
      setApps([...apps, { id: crypto.randomUUID(), ...form }]);
      toast.success("Application added");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { setApps(apps.filter((a) => a.id !== id)); toast.success("Application deleted"); };

  const filtered = filterStatus === "all" ? apps : apps.filter((a) => a.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your job applications</p>
        </div>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Application</span>
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
          <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)} className="text-xs">
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left p-4 font-semibold">Company</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Applied</th>
              <th className="text-left p-4 font-semibold">Notes</th>
              <th className="p-4 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((app) => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors group">
                <td className="p-4 font-medium">{app.company}</td>
                <td className="p-4 text-muted-foreground">{app.role}</td>
                <td className="p-4"><Badge variant="outline" className={statusColor[app.status]}>{app.status}</Badge></td>
                <td className="p-4 text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td className="p-4 text-muted-foreground truncate max-w-[200px]">{app.notes || "—"}</td>
                <td className="p-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(app)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(app.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sorted.map((app) => (
          <div key={app.id} className="rounded-xl border bg-card p-4 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{app.company}</p>
                  <p className="text-xs text-muted-foreground">{app.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusColor[app.status]}>{app.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(app)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(app.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
            {app.notes && <p className="text-xs text-muted-foreground">{app.notes}</p>}
            <p className="text-xs text-muted-foreground">Applied {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Application" : "Add Application"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google" /></div>
              <div className="space-y-2"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="SDE II" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Application["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Applied Date</Label><Input type="date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." rows={3} /></div>
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
