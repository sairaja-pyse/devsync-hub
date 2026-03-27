import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const applications = [
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

export default function Jobs() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your job applications</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Application</span>
        </Button>
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
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-4 font-medium">{app.company}</td>
                <td className="p-4 text-muted-foreground">{app.role}</td>
                <td className="p-4">
                  <Badge variant="outline" className={statusColor[app.status]}>{app.status}</Badge>
                </td>
                <td className="p-4 text-muted-foreground">
                  {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="p-4 text-muted-foreground truncate max-w-[200px]">{app.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="rounded-xl border bg-card p-4 space-y-3">
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
              <Badge variant="outline" className={statusColor[app.status]}>{app.status}</Badge>
            </div>
            {app.notes && (
              <p className="text-xs text-muted-foreground">{app.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Applied {new Date(app.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
