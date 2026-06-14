"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  Calendar,
  Trophy,
  ChevronRight,
  Loader2,
  Trash2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompetitions } from "@/hooks/use-competitions";
import { AddDeadlineDialog } from "@/components/deadlines/add-deadline-dialog";
import {
  getDaysRemaining,
  getDeadlineColor,
  getDeadlineBadgeColor,
  formatDate,
} from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "cygnus_competitions";

function persistDeadlineUpdate(competitionId: string, deadlines: any[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: any[] = JSON.parse(raw);
    const idx = list.findIndex((c: any) => c.id === competitionId);
    if (idx !== -1) list[idx].deadlines = deadlines;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function DeadlinesPage() {
  const { competitions, loaded } = useCompetitions();
  const [filter, setFilter] = useState<"all" | "urgent" | "upcoming" | "passed">("all");
  const [search, setSearch] = useState("");

  // Flatten deadlines from all competitions
  const allDeadlines = useMemo(() => {
    return competitions.flatMap((comp) =>
      (comp.deadlines || []).map((d: any) => ({
        ...d,
        date: d.date ? new Date(d.date) : new Date(),
        competition: { id: comp.id, name: comp.name },
        competitionId: comp.id,
      }))
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [competitions]);

  const [deadlines, setDeadlines] = useState<any[]>([]);
  useEffect(() => {
    setDeadlines(allDeadlines);
  }, [allDeadlines]);

  const handleAdd = async (newDeadline: any) => {
    try {
      await api.competitions.deadlines.create(newDeadline.competitionId, newDeadline);
      setDeadlines((prev) =>
        [...prev, {
          ...newDeadline,
          date: new Date(newDeadline.date),
          competition: { id: newDeadline.competitionId, name: newDeadline.competition?.name || "" },
        }].sort((a, b) => a.date.getTime() - b.date.getTime())
      );
      toast.success("Deadline berhasil ditambahkan!");
    } catch (error) {
      toast.error("Gagal menambahkan deadline");
    }
  };

  const handleDelete = async (deadlineId: string, competitionId: string) => {
    try {
      await api.competitions.deadlines.delete(competitionId, deadlineId);
      setDeadlines((prev) => prev.filter((d) => d.id !== deadlineId));
      toast.success("Deadline dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus deadline");
    }
  };

  const filtered = useMemo(() => {
    return deadlines.filter((dl) => {
      const days = getDaysRemaining(dl.date);
      const matchFilter =
        filter === "all" ? true :
        filter === "urgent" ? (days >= 0 && days <= 3) :
        filter === "upcoming" ? (days > 3 && days <= 14) :
        days < 0;
      const matchSearch =
        !search ||
        dl.title.toLowerCase().includes(search.toLowerCase()) ||
        (dl.competition?.name || "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [deadlines, filter, search]);

  const urgentCount = deadlines.filter((d) => { const days = getDaysRemaining(d.date); return days >= 0 && days <= 3; }).length;
  const upcomingCount = deadlines.filter((d) => { const days = getDaysRemaining(d.date); return days > 3 && days <= 14; }).length;
  const laterCount = deadlines.filter((d) => getDaysRemaining(d.date) > 14).length;
  const passedCount = deadlines.filter((d) => getDaysRemaining(d.date) < 0).length;

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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deadline Center</h1>
          <p className="text-muted-foreground mt-1">
            Pantau seluruh deadline kompetisi dalam satu tempat
          </p>
        </div>
        <AddDeadlineDialog
          onAdd={handleAdd}
          triggerButton={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Deadline
            </Button>
          }
        />
      </div>

      {/* Alert Banner */}
      {urgentCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {urgentCount} deadline memerlukan perhatian segera!
            </p>
            <p className="text-xs text-red-400/70">
              Deadline dalam 3 hari ke depan perlu diprioritaskan.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Urgent (≤3 hari)", value: urgentCount, color: "text-red-400", bg: "bg-red-500/10", icon: Clock, iconColor: "text-red-500", filter: "urgent" },
          { label: "Upcoming (4-14 hari)", value: upcomingCount, color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Calendar, iconColor: "text-yellow-500", filter: "upcoming" },
          { label: "Later (>14 hari)", value: laterCount, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Calendar, iconColor: "text-emerald-500", filter: "all" },
          { label: "Passed", value: passedCount, color: "text-gray-400", bg: "bg-gray-500/10", icon: Clock, iconColor: "text-gray-500", filter: "passed" },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setFilter(stat.filter as any)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">Semua ({deadlines.length})</TabsTrigger>
            <TabsTrigger value="urgent" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Urgent ({urgentCount})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Upcoming ({upcomingCount})
            </TabsTrigger>
            <TabsTrigger value="passed">Passed ({passedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari deadline..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {filtered.map((deadline, idx) => {
          const days = getDaysRemaining(deadline.date);
          const isUrgent = days >= 0 && days <= 3;
          const isUpcoming = days > 3 && days <= 7;

          return (
            <motion.div
              key={deadline.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 hover:shadow-lg transition-all group",
                isUrgent && "border-red-500/30 bg-red-500/5",
                isUpcoming && "border-yellow-500/30 bg-yellow-500/5",
              )}
            >
              {/* Days Counter */}
              <div className={cn(
                "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border-2 text-center",
                getDeadlineBadgeColor(days),
              )}>
                <span className="text-2xl font-bold leading-none">{Math.abs(days)}</span>
                <span className="text-[10px] uppercase font-medium mt-0.5">
                  {days < 0 ? "Late" : "Days"}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold truncate">{deadline.title}</h3>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {(deadline.type || "").replace(/_/g, " ")}
                  </Badge>
                  {isUrgent && (
                    <Badge className="bg-red-500/20 text-red-400 text-[10px] shrink-0">URGENT</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                  <Trophy className="h-3 w-3 shrink-0" />
                  {deadline.competition?.name}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(deadline.date)}
                  </span>
                  {deadline.description && <span className="truncate">{deadline.description}</span>}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="hidden sm:block w-32 shrink-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Time left</span>
                  <span className={getDeadlineColor(days)}>
                    {days < 0 ? "Overdue" : `${Math.round((days / 30) * 100)}%`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      days < 0 ? "bg-red-500 w-full" :
                      days <= 3 ? "bg-red-500" :
                      days <= 7 ? "bg-yellow-500" :
                      "bg-emerald-500",
                    )}
                    style={{ width: days < 0 ? "100%" : `${Math.max(5, Math.min(100, (days / 30) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(deadline.id, deadline.competitionId)}
                  title="Hapus deadline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">Tidak ada deadline</h3>
            <p className="text-muted-foreground mt-1">
              {search ? "Coba ubah kata pencarian" : "Deadline akan muncul di sini setelah ditambahkan dari kompetisi"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
