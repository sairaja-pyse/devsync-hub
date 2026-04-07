import { useState } from "react";
import { Plus, Briefcase, Pencil, Trash2, ExternalLink, Link2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
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
  link?: string;
}

const statusColor: Record<string, string> = {
  Applied:   "bg-info/10 text-info border-info/20",
  Interview: "bg-warning/10 text-warning border-warning/20",
  Offer:     "bg-success/10 text-success border-success/20",
  Rejected:  "bg-destructive/10 text-destructive border-destructive/20",
};

const emptyApp: Omit<Application, "id"> = {
  company: "", role: "", status: "Applied", appliedDate: "", notes: "", link: "",
};

function normalizeUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return "https://" + url;
}

export default function Jobs() {
  const { items: apps, add, update, remove } = useCollection<Application>('jobs', '_createdAt', 'desc');
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editing,      setEditing]      = useState<Application | null>(null);
  const [form,         setForm]         = useState<Omit<Application, "id">>(emptyApp);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyApp);
    setDialogOpen(true);
  };

  const openEdit = (a: Application) => {
    setEditing(a);
    setForm({
      company: a.company, role: a.role, status: a.status,
      appliedDate: a.appliedDate, notes: a.notes, link: a.link ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim()) { toast.error("Company is required"); return; }
    try {
      if (editing) {
        await update(editing.id, form);
        toast.success("Application updated");
      } else {
        await add({ ...form });
        toast.success("Application added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    toast.success("Application deleted");
  };

  const filtered = filterStatus === "all" ? apps : apps.filter((a) => a.status === filterStatus);
  const sorted   = [...filtered].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

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
          <Button
            key={s}
            variant={filterStatus === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(s)}
            className="text-xs"
          >
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
              <th className="text-left p-4 font-semibold w-16">Link</th>
              <th className="p-4 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((app) => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors group">
                <td className="p-4 font-medium">{app.company}</td>
                <td className="p-4 text-muted-foreground">{app.role}</td>
                <td className="p-4">
                  <Badge variant="outline" className={statusColor[app.status]}>{app.status}</Badge>
                </td>
                <td className="p-4 text-muted-foreground">
                  {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="p-4 text-muted-foreground truncate max-w-[180px]">{app.notes || "—"}</td>
                <td className="p-4">
                  {app.link ? (
                    <a
                      href={normalizeUrl(app.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[#007AFF] dark:text-[#0A84FF] hover:underline text-xs font-medium"
                      title={app.link}
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      Open
                    </a>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(app)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
          <div key={app.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{app.company}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className={statusColor[app.status]}>{app.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(app)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(app.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            {app.notes && (
              <p className="text-xs text-muted-foreground">{app.notes}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Applied {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              {app.link && (
                <a
                  href={normalizeUrl(app.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#007AFF] dark:text-[#0A84FF] font-medium hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Posting
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Application" : "Add Application"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="SDE II" />
              </div>
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
              <div className="space-y-2">
                <Label>Applied Date</Label>
                <Input type="date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} />
              </div>
            </div>
            {/* Application Link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                Application Link
              </Label>
              <Input
                value={form.link ?? ""}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://careers.company.com/job/..."
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes..."
                rows={3}
              />
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
