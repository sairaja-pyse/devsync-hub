import { Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const events = [
  { id: "1", title: "Fix auth bug", date: "2026-03-27", type: "task" },
  { id: "2", title: "Google phone screen", date: "2026-03-28", type: "interview" },
  { id: "3", title: "System Design milestone", date: "2026-03-30", type: "goal" },
  { id: "4", title: "PR review deadline", date: "2026-03-27", type: "task" },
  { id: "5", title: "DSA goal deadline", date: "2026-04-01", type: "goal" },
  { id: "6", title: "Microsoft round 2", date: "2026-04-02", type: "interview" },
];

const typeColor: Record<string, string> = {
  task: "bg-primary/10 text-primary border-primary/20",
  interview: "bg-warning/10 text-warning border-warning/20",
  goal: "bg-success/10 text-success border-success/20",
};

export default function CalendarPage() {
  const grouped = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Upcoming deadlines and events</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {date === "2026-03-27" && (
                <Badge className="bg-primary text-primary-foreground text-[10px]">Today</Badge>
              )}
            </div>
            <div className="space-y-1.5 ml-6">
              {grouped[date].map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                  </div>
                  <Badge variant="outline" className={typeColor[event.type]}>
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
