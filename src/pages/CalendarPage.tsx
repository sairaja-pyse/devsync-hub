import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Plus, Pencil, Trash2, Clock } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "task" | "interview" | "goal" | "reminder";
}

const typeColor: Record<string, string> = {
  task: "bg-primary/15 text-primary border-primary/30",
  interview: "bg-warning/15 text-warning border-warning/30",
  goal: "bg-success/15 text-success border-success/30",
  reminder: "bg-accent text-accent-foreground border-accent",
};

const typeLabel: Record<string, string> = {
  task: "Task",
  interview: "Interview",
  goal: "Goal",
  reminder: "Reminder",
};

const initialEvents: CalendarEvent[] = [
  { id: "1", title: "Fix auth bug", description: "Fix the authentication flow bug", date: "2026-03-27", type: "task" },
  { id: "2", title: "Google phone screen", description: "Initial phone screen with Google", date: "2026-03-28", type: "interview" },
  { id: "3", title: "System Design milestone", description: "Complete system design module", date: "2026-03-30", type: "goal" },
  { id: "4", title: "PR review deadline", description: "Review pending pull requests", date: "2026-03-27", type: "task" },
  { id: "5", title: "DSA goal deadline", description: "Finish DSA practice set", date: "2026-04-01", type: "goal" },
  { id: "6", title: "Microsoft round 2", description: "Second round interview", date: "2026-04-02", type: "interview" },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<CalendarEvent["type"]>("task");

  const today = new Date();

  const eventDates = events.map((e) => parseISO(e.date));

  const selectedDateEvents = selectedDate
    ? events.filter((e) => isSameDay(parseISO(e.date), selectedDate))
    : [];

  const upcomingEvents = events
    .filter((e) => parseISO(e.date) >= new Date(today.toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  function openCreate() {
    setEditingEvent(null);
    setFormTitle("");
    setFormDesc("");
    setFormType("task");
    setDialogOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDesc(event.description);
    setFormType(event.type);
    setSelectedDate(parseISO(event.date));
    setDialogOpen(true);
  }

  function handleSave() {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? { ...e, title: formTitle, description: formDesc, type: formType, date: dateStr }
            : e
        )
      );
      toast.success("Event updated");
    } else {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: formTitle,
        description: formDesc,
        type: formType,
        date: dateStr,
      };
      setEvents((prev) => [...prev, newEvent]);
      toast.success("Event created");
    }
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
    toast.success("Event deleted");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your schedule & deadlines</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        {/* Calendar widget */}
        <div className="rounded-xl border bg-card p-2 sm:p-4 w-full lg:w-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto mx-auto"
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{
              hasEvent: "bg-primary/20 font-bold text-primary rounded-md",
            }}
          />
        </div>

        {/* Selected date events */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-lg">
              {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : "Select a date"}
            </h2>
            {selectedDate && isSameDay(selectedDate, today) && (
              <Badge className="bg-primary text-primary-foreground text-[10px]">Today</Badge>
            )}
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">No events on this date</p>
              <Button variant="ghost" size="sm" onClick={openCreate} className="mt-2 text-primary">
                <Plus className="h-3 w-3 mr-1" /> Add one
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex items-start gap-3 p-3 rounded-lg bg-card border hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`${typeColor[event.type]} text-[10px] shrink-0`}>
                    {typeLabel[event.type]}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(event)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(event.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming events */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Upcoming</h3>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedDate(parseISO(event.date))}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="text-center shrink-0 w-10">
                    <p className="text-[10px] uppercase text-muted-foreground leading-tight">
                      {format(parseISO(event.date), "MMM")}
                    </p>
                    <p className="text-lg font-bold leading-tight">{format(parseISO(event.date), "d")}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                  </div>
                  <Badge variant="outline" className={`${typeColor[event.type]} text-[10px]`}>
                    {typeLabel[event.type]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update event details below." : "Add a new event to your calendar."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Event title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type</label>
              <Select value={formType} onValueChange={(v) => setFormType(v as CalendarEvent["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="goal">Goal</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Date: {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick on calendar"}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingEvent ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
