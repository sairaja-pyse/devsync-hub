import { useState, useMemo } from "react";
import { useCollection } from "@/hooks/useCollection";
import { Plus, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

interface BoardTask {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  project: string;
  dueDate: string;
  columnId: string;
  order: number;
}

interface Column {
  id: string;
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: "backlog",  title: "Backlog",     color: "bg-muted-foreground" },
  { id: "progress", title: "In Progress", color: "bg-primary"          },
  { id: "done",     title: "Done",        color: "bg-success"          },
];

const priorityColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Low: "bg-success/10 text-success border-success/20",
};

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "Medium" as BoardTask["priority"],
  project: "",
  dueDate: "",
};

export default function Board() {
  const { items: tasks, add, update, remove } = useCollection<BoardTask>('board_tasks', '_createdAt', 'asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<BoardTask | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>("backlog");
  const [formData, setFormData] = useState(emptyTaskForm);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, BoardTask[]> = {};
    for (const col of COLUMNS) {
      map[col.id] = tasks
        .filter((t) => t.columnId === col.id)
        .sort((a, b) => a.order - b.order);
    }
    return map;
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcTasks = [...tasksByColumn[source.droppableId]];
    const destTasks = source.droppableId === destination.droppableId
      ? srcTasks
      : [...tasksByColumn[destination.droppableId]];

    const [moved] = srcTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, moved);

    const updates: Promise<void>[] = [];

    if (source.droppableId !== destination.droppableId) {
      updates.push(update(moved.id, { columnId: destination.droppableId, order: destination.index }));
      const destCol = COLUMNS.find((c) => c.id === destination.droppableId)!;
      toast.success(`Moved "${moved.title}" to ${destCol.title}`);
    }

    destTasks.forEach((t, i) => {
      if (t.order !== i || t.columnId !== destination.droppableId) {
        updates.push(update(t.id, { columnId: destination.droppableId, order: i }));
      }
    });

    await Promise.all(updates);
  };

  const openCreate = (columnId: string) => {
    setEditingTask(null);
    setTargetColumn(columnId);
    setFormData(emptyTaskForm);
    setDialogOpen(true);
  };

  const openEdit = (task: BoardTask, columnId: string) => {
    setEditingTask(task);
    setTargetColumn(columnId);
    setFormData({ title: task.title, description: task.description, priority: task.priority, project: task.project, dueDate: task.dueDate });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editingTask) {
      await update(editingTask.id, { ...formData });
      toast.success("Task updated");
    } else {
      const colTasks = tasksByColumn[targetColumn] ?? [];
      await add({ ...formData, columnId: targetColumn, order: colTasks.length });
      toast.success("Task created");
    }
    setDialogOpen(false);
  };

  const handleDelete = async (taskId: string) => {
    await remove(taskId);
    toast.success("Task deleted");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Drag tasks between columns</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => openCreate("backlog")}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {COLUMNS.map((col) => (
            <div key={col.id} className="min-w-[280px] sm:min-w-[300px] flex-1 snap-start">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <span className="text-xs text-muted-foreground ml-auto">{(tasksByColumn[col.id] ?? []).length}</span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-2.5 min-h-[120px] rounded-lg p-1.5 transition-colors",
                      snapshot.isDraggingOver && "bg-accent/50 ring-2 ring-primary/20"
                    )}
                  >
                    {(tasksByColumn[col.id] ?? []).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "rounded-lg border bg-card p-4 space-y-3 transition-shadow group",
                              snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30 rotate-1" : "hover:shadow-sm"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div {...provided.dragHandleProps} className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-snug">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(task, col.id)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDelete(task.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{task.project}</span>
                              <Badge variant="outline" className={cn("text-[10px]", priorityColor[task.priority])}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.dueDate && (
                              <p className="text-[10px] text-muted-foreground">
                                Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    <button
                      onClick={() => openCreate(col.id)}
                      className="w-full p-2.5 rounded-lg border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors text-sm flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add task
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as BoardTask["priority"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Input value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} placeholder="Project name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingTask ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
