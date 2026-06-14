"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  Calendar,
  Trophy,
  LayoutGrid,
  List,
  Flag,
  ChevronDown,
  Filter,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePersistedCompetitions } from "@/hooks/use-persisted-competitions";
import { mockUsers } from "@/lib/mock-data";
import {
  getStatusColor,
  getInitials,
  getDaysRemaining,
  getDeadlineColor,
  formatDate,
} from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "cygnus_competitions";

const columns = [
  { id: "BACKLOG", label: "Backlog", color: "border-slate-500/30", dot: "bg-slate-500", textColor: "text-slate-400" },
  { id: "TODO", label: "To Do", color: "border-blue-500/30", dot: "bg-blue-500", textColor: "text-blue-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-amber-500/30", dot: "bg-amber-500", textColor: "text-amber-400" },
  { id: "REVIEW", label: "Review", color: "border-purple-500/30", dot: "bg-purple-500", textColor: "text-purple-400" },
  { id: "DONE", label: "Done", color: "border-emerald-500/30", dot: "bg-emerald-500", textColor: "text-emerald-400" },
];

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const priorityColors: Record<string, string> = {
  LOW: "text-slate-400 bg-slate-500/10",
  MEDIUM: "text-blue-400 bg-blue-500/10",
  HIGH: "text-amber-400 bg-amber-500/10",
  CRITICAL: "text-red-400 bg-red-500/10",
};

function persistTasks(competitionId: string, tasks: any[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: any[] = JSON.parse(raw);
    const idx = list.findIndex((c: any) => c.id === competitionId);
    if (idx !== -1) list[idx].tasks = tasks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function TasksPage() {
  const { competitions, loaded } = usePersistedCompetitions();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterComp, setFilterComp] = useState("ALL");

  // All tasks derived from persisted competitions
  const [allTasks, setAllTasks] = useState<any[]>([]);

  useEffect(() => {
    if (loaded) {
      const tasks = competitions.flatMap((comp) =>
        (comp.tasks || []).map((t: any) => ({
          ...t,
          competitionName: comp.name,
          competitionId: comp.id,
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
        }))
      );
      setAllTasks(tasks);
    }
  }, [loaded, competitions]);

  // Sync allTasks back to localStorage when changed
  const syncToStorage = (updatedTasks: any[]) => {
    setAllTasks(updatedTasks);
    // Group by competition and persist
    const byComp: Record<string, any[]> = {};
    updatedTasks.forEach((t) => {
      if (!byComp[t.competitionId]) byComp[t.competitionId] = [];
      byComp[t.competitionId].push(t);
    });
    Object.entries(byComp).forEach(([compId, tasks]) => {
      persistTasks(compId, tasks);
    });
    // Also persist competitions with empty tasks
    competitions.forEach((comp) => {
      if (!byComp[comp.id]) persistTasks(comp.id, []);
    });
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.competitionName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "ALL" || task.status === filterStatus;
      const matchPriority = filterPriority === "ALL" || task.priority === filterPriority;
      const matchComp = filterComp === "ALL" || task.competitionId === filterComp;
      return matchSearch && matchStatus && matchPriority && matchComp;
    });
  }, [allTasks, searchQuery, filterStatus, filterPriority, filterComp]);

  const taskStats = {
    total: allTasks.length,
    backlog: allTasks.filter((t) => t.status === "BACKLOG").length,
    todo: allTasks.filter((t) => t.status === "TODO").length,
    inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
    review: allTasks.filter((t) => t.status === "REVIEW").length,
    done: allTasks.filter((t) => t.status === "DONE").length,
  };

  const handleAddTask = (newTask: any) => {
    const updated = [newTask, ...allTasks];
    syncToStorage(updated);
    toast.success("Task berhasil ditambahkan!");
  };

  const handleEditTask = (updatedTask: any) => {
    const updated = allTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    syncToStorage(updated);
    toast.success("Task berhasil diperbarui!");
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = allTasks.filter((t) => t.id !== taskId);
    syncToStorage(updated);
    toast.success("Task dihapus.");
  };

  const handleToggleDone = (taskId: string) => {
    const updated = allTasks.map((t) =>
      t.id === taskId
        ? { ...t, status: t.status === "DONE" ? "TODO" : "DONE" }
        : t
    );
    syncToStorage(updated);
  };

  const handleMoveStatus = (taskId: string, newStatus: string) => {
    const updated = allTasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    syncToStorage(updated);
    toast.success(`Task dipindah ke ${newStatus.replace("_", " ")}`);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua tugas dari seluruh kompetisi
          </p>
        </div>
        <AddEditTaskDialog competitions={competitions} onSave={handleAddTask} />
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3 md:grid-cols-6">
        {[
          { label: "Total", value: taskStats.total, color: "text-foreground", bg: "bg-muted/50" },
          { label: "Backlog", value: taskStats.backlog, color: "text-slate-400", bg: "bg-slate-500/10" },
          { label: "To Do", value: taskStats.todo, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "In Progress", value: taskStats.inProgress, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Review", value: taskStats.review, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Done", value: taskStats.done, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={cn("cursor-pointer transition-all hover:scale-105", stat.bg)}
            onClick={() => setFilterStatus(stat.label === "Total" ? "ALL" : stat.label.replace(" ", "_").toUpperCase())}
          >
            <CardContent className="p-4 text-center">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari task atau kompetisi..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Kompetisi */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Trophy className="h-4 w-4" />
                {filterComp === "ALL" ? "Semua Kompetisi" : competitions.find(c => c.id === filterComp)?.name?.slice(0, 15) + "..."}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-60 overflow-y-auto">
              <DropdownMenuCheckboxItem checked={filterComp === "ALL"} onCheckedChange={() => setFilterComp("ALL")}>
                Semua Kompetisi
              </DropdownMenuCheckboxItem>
              {competitions.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={filterComp === c.id}
                  onCheckedChange={() => setFilterComp(c.id)}
                >
                  {c.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Prioritas */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Flag className="h-4 w-4" />
                {filterPriority === "ALL" ? "Prioritas" : filterPriority}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuCheckboxItem checked={filterPriority === "ALL"} onCheckedChange={() => setFilterPriority("ALL")}>
                Semua
              </DropdownMenuCheckboxItem>
              {priorities.map((p) => (
                <DropdownMenuCheckboxItem key={p} checked={filterPriority === p} onCheckedChange={() => setFilterPriority(p)}>
                  {p}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={viewMode === "board" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-9 px-3"
              onClick={() => setViewMode("board")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-9 px-3 border-l"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(filterStatus !== "ALL" || filterPriority !== "ALL" || filterComp !== "ALL") && (
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-muted-foreground text-xs">Filter aktif:</span>
          {filterStatus !== "ALL" && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilterStatus("ALL")}>
              {filterStatus.replace("_", " ")} <X className="h-3 w-3" />
            </Badge>
          )}
          {filterPriority !== "ALL" && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilterPriority("ALL")}>
              {filterPriority} <X className="h-3 w-3" />
            </Badge>
          )}
          {filterComp !== "ALL" && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFilterComp("ALL")}>
              {competitions.find(c => c.id === filterComp)?.name?.slice(0, 20)} <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Board View */}
      {viewMode === "board" && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className={cn("rounded-xl border-2 bg-muted/20", col.color)}>
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", col.dot)} />
                    <span className="text-sm font-semibold">{col.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5">{colTasks.length}</Badge>
                </div>
                <div className="p-2 space-y-2 min-h-[80px]">
                  <AnimatePresence>
                    {colTasks.map((task, idx) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        idx={idx}
                        columns={columns}
                        competitions={competitions}
                        onToggle={() => handleToggleDone(task.id)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onEdit={(updated) => handleEditTask(updated)}
                        onMove={(status) => handleMoveStatus(task.id, status)}
                      />
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground/50">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Semua Task ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Tidak ada task ditemukan</p>
                </div>
              )}
              <AnimatePresence>
                {filteredTasks.map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors group"
                  >
                    {/* Done toggle */}
                    <button
                      onClick={() => handleToggleDone(task.id)}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        task.status === "DONE"
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-muted-foreground/30 hover:border-emerald-500/60"
                      )}
                    >
                      {task.status === "DONE" && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        task.status === "DONE" && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{task.competitionName}</p>
                    </div>

                    {/* Priority */}
                    <Badge className={cn("text-[10px] shrink-0", priorityColors[task.priority] || "")}>
                      {task.priority}
                    </Badge>

                    {/* Status */}
                    <Badge className={cn("text-[10px] shrink-0 hidden sm:flex", getStatusColor(task.status))}>
                      {task.status.replace(/_/g, " ")}
                    </Badge>

                    {/* Assignee */}
                    {task.assignee && (
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
                          {getInitials(task.assignee.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Due Date */}
                    {task.dueDate && (
                      <span className={cn(
                        "text-xs shrink-0 hidden md:block",
                        getDeadlineColor(getDaysRemaining(new Date(task.dueDate)))
                      )}>
                        {formatDate(new Date(task.dueDate))}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <AddEditTaskDialog
                        competitions={competitions}
                        task={task}
                        onSave={handleEditTask}
                        isEdit
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard component (for board view)
// ─────────────────────────────────────────────────────────────────────────────
function TaskCard({ task, idx, columns, competitions, onToggle, onDelete, onEdit, onMove }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.04 }}
      className="group/card rounded-lg border bg-card p-3 hover:shadow-md transition-all"
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={onToggle}
          className={cn(
            "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
            task.status === "DONE"
              ? "bg-emerald-500 border-emerald-500"
              : "border-muted-foreground/30 hover:border-emerald-500/50"
          )}
        >
          {task.status === "DONE" && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
        </button>
        <p className={cn(
          "text-xs font-medium line-clamp-2 flex-1",
          task.status === "DONE" && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
      </div>

      {/* Competition name */}
      <p className="text-[10px] text-muted-foreground truncate ml-6 mb-2">{task.competitionName}</p>

      {/* Priority + Due */}
      <div className="flex items-center justify-between ml-6">
        <Badge className={cn("text-[9px] px-1.5 py-0", priorityColors[task.priority] || "")}>
          {task.priority}
        </Badge>
        {task.dueDate && (
          <span className={cn("text-[9px]", getDeadlineColor(getDaysRemaining(new Date(task.dueDate))))}>
            {getDaysRemaining(new Date(task.dueDate))}d
          </span>
        )}
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-1 mt-2 ml-6">
          <Avatar className="h-4 w-4">
            <AvatarFallback className="text-[7px] bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
              {getInitials(task.assignee.name || "U")}
            </AvatarFallback>
          </Avatar>
          <span className="text-[9px] text-muted-foreground">{task.assignee.name}</span>
        </div>
      )}

      {/* Actions (on hover) */}
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/card:opacity-100 transition-opacity border-t pt-2">
        {/* Move to next/prev */}
        {columns.map((col: any) => {
          if (col.id === task.status) return null;
          return (
            <button
              key={col.id}
              onClick={() => onMove(col.id)}
              className={cn("text-[9px] px-1.5 py-0.5 rounded border transition-colors hover:bg-accent", col.textColor)}
            >
              → {col.label}
            </button>
          );
        }).filter(Boolean).slice(0, 2)}
        <div className="flex-1" />
        <AddEditTaskDialog competitions={competitions} task={task} onSave={onEdit} isEdit />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AddEditTaskDialog component
// ─────────────────────────────────────────────────────────────────────────────
function AddEditTaskDialog({
  competitions,
  task,
  onSave,
  isEdit = false,
}: {
  competitions: any[];
  task?: any;
  onSave: (task: any) => void;
  isEdit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    competitionId: task?.competitionId || (competitions[0]?.id || ""),
    assigneeId: task?.assigneeId || (mockUsers[0]?.id || ""),
    priority: task?.priority || "MEDIUM",
    status: task?.status || "TODO",
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  // Reset form when task changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: task?.title || "",
        description: task?.description || "",
        competitionId: task?.competitionId || (competitions[0]?.id || ""),
        assigneeId: task?.assigneeId || (mockUsers[0]?.id || ""),
        priority: task?.priority || "MEDIUM",
        status: task?.status || "TODO",
        dueDate: task?.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const competition = competitions.find((c) => c.id === formData.competitionId);
    const assignee = mockUsers.find((u) => u.id === formData.assigneeId);

    const saved = {
      ...(task || {}),
      id: task?.id || `task-${Date.now()}`,
      competitionId: formData.competitionId,
      competitionName: competition?.name || "Unknown",
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assigneeId: formData.assigneeId,
      assignee: assignee || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      createdAt: task?.createdAt || new Date(),
      comments: task?.comments || [],
    };

    onSave(saved);
    setOpen(false);
  };

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Task" : "Tambah Task Baru"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Ubah detail task ini." : "Masukkan detail task yang ingin ditambahkan."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Judul Task *</Label>
              <Input id="task-title" name="title" value={formData.title} onChange={handleChange} placeholder="Contoh: Buat presentasi deck" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-comp">Kompetisi *</Label>
              <select id="task-comp" name="competitionId" value={formData.competitionId} onChange={handleChange as any} className={selectClass} required>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-desc">Deskripsi</Label>
              <Textarea id="task-desc" name="description" value={formData.description} onChange={handleChange} placeholder="Deskripsi singkat..." rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <select id="task-assignee" name="assigneeId" value={formData.assigneeId} onChange={handleChange as any} className={selectClass}>
                  {mockUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-priority">Prioritas</Label>
                <select id="task-priority" name="priority" value={formData.priority} onChange={handleChange as any} className={selectClass}>
                  {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-status">Status</Label>
                <select id="task-status" name="status" value={formData.status} onChange={handleChange as any} className={selectClass}>
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-due">Tenggat Waktu</Label>
                <Input id="task-due" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">{isEdit ? "Simpan Perubahan" : "Tambah Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
