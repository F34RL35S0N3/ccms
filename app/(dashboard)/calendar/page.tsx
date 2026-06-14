"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trophy,
  Presentation,
  FileText,
  Users,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompetitions } from "@/hooks/use-competitions";
import { AddDeadlineDialog } from "@/components/deadlines/add-deadline-dialog";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "cygnus_competitions";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const EVENT_COLORS: Record<string, string> = {
  DEADLINE: "bg-red-500",
  MEETING: "bg-blue-500",
  PRESENTATION: "bg-purple-500",
  SUBMISSION: "bg-emerald-500",
  MILESTONE: "bg-amber-500",
  OTHER: "bg-gray-500",
  REGISTRATION: "bg-red-500",
  PROPOSAL: "bg-emerald-500",
};

const EVENT_ICONS: Record<string, any> = {
  DEADLINE: Clock,
  MEETING: Users,
  PRESENTATION: Presentation,
  SUBMISSION: FileText,
  MILESTONE: Trophy,
  OTHER: CalendarIcon,
};

function getEventColor(type: string) {
  return EVENT_COLORS[type] || "bg-gray-500";
}
function getEventIcon(type: string) {
  return EVENT_ICONS[type] || CalendarIcon;
}

export default function CalendarPage() {
  const { competitions, loaded } = useCompetitions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // Collect all events from localStorage competitions
  const allEvents = useMemo(() => {
    const events: any[] = [];
    competitions.forEach((comp) => {
      // Timeline events
      (comp.timeline || []).forEach((t: any) => {
        events.push({
          ...t,
          date: t.date ? new Date(t.date) : new Date(),
          competitionName: comp.name,
          competitionId: comp.id,
          source: "timeline",
        });
      });
      // Deadlines
      (comp.deadlines || []).forEach((d: any) => {
        events.push({
          id: d.id,
          title: d.title,
          date: d.date ? new Date(d.date) : new Date(),
          type: d.type === "REGISTRATION" ? "DEADLINE" : d.type === "PROPOSAL" ? "SUBMISSION" : (d.type || "DEADLINE"),
          description: d.description,
          competitionName: comp.name,
          competitionId: comp.id,
          source: "deadline",
        });
      });
      // Competition start/end dates (if set)
      if (comp.startDate) {
        events.push({
          id: `start-${comp.id}`,
          title: `Mulai: ${comp.name}`,
          date: new Date(comp.startDate),
          type: "MILESTONE",
          description: "Tanggal mulai kompetisi",
          competitionName: comp.name,
          competitionId: comp.id,
          source: "competition",
        });
      }
      if (comp.endDate) {
        events.push({
          id: `end-${comp.id}`,
          title: `Selesai: ${comp.name}`,
          date: new Date(comp.endDate),
          type: "DEADLINE",
          description: "Tanggal selesai kompetisi",
          competitionName: comp.name,
          competitionId: comp.id,
          source: "competition",
        });
      }
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [competitions]);

  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    setEvents(allEvents);
  }, [allEvents]);

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const handleAddDeadline = async (newDeadline: any) => {
    try {
      await api.competitions.deadlines.create(newDeadline.competitionId, newDeadline);
      const comp = competitions.find((c) => c.id === newDeadline.competitionId);
      setEvents((prev) => [
        ...prev,
        {
          ...newDeadline,
          date: new Date(newDeadline.date),
          competitionName: comp?.name || "Unknown",
          type: newDeadline.type === "REGISTRATION" ? "DEADLINE" : newDeadline.type === "PROPOSAL" ? "SUBMISSION" : newDeadline.type,
          source: "deadline",
        },
      ]);
      toast.success("Event berhasil ditambahkan ke kalender!");
    } catch (error) {
      toast.error("Gagal menambahkan event ke kalender");
    }
  };

  const upcomingEvents = useMemo(() =>
    events
      .filter((e) => getDaysRemaining(new Date(e.date)) >= -1)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 12),
    [events]
  );

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDay(null); };

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
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Jadwal dan timeline seluruh kompetisi ({events.length} event)
          </p>
        </div>
        <AddDeadlineDialog
          onAdd={handleAddDeadline}
          triggerButton={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Event
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {MONTH_NAMES[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToday}>Today</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { color: "bg-red-500", label: "Deadline" },
                { color: "bg-blue-500", label: "Meeting" },
                { color: "bg-purple-500", label: "Presentasi" },
                { color: "bg-emerald-500", label: "Submission" },
                { color: "bg-amber-500", label: "Milestone" },
              ].map(({ color, label }) => (
                <Badge key={label} variant="outline" className="gap-1 text-[10px]">
                  <div className={cn("h-2 w-2 rounded-full", color)} />
                  {label}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Prev month padding */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div
                  key={`prev-${i}`}
                  className="min-h-[90px] rounded-lg border border-dashed border-muted p-1.5 opacity-40"
                >
                  <span className="text-sm text-muted-foreground">
                    {daysInPrevMonth - firstDay + i + 1}
                  </span>
                </div>
              ))}

              {/* Current month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === todayDate && month === todayMonth && year === todayYear;
                const isSelected = day === selectedDay;

                return (
                  <motion.div
                    key={day}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      "min-h-[90px] rounded-lg border p-1.5 transition-all cursor-pointer",
                      isToday && "border-cygnus-primary bg-cygnus-primary/5",
                      isSelected && !isToday && "border-cygnus-primary/50 bg-cygnus-primary/5 ring-1 ring-cygnus-primary/30",
                      !isToday && !isSelected && "border-muted hover:border-muted-foreground/30",
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isToday ? "text-cygnus-primary font-bold" : "text-foreground"
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-[9px] rounded px-1 py-0.5 truncate text-white leading-tight",
                            getEventColor(event.type)
                          )}
                          title={`${event.title} — ${event.competitionName}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground text-center">
                          +{dayEvents.length - 2} lagi
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Next month padding */}
              {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                <div
                  key={`next-${i}`}
                  className="min-h-[90px] rounded-lg border border-dashed border-muted p-1.5 opacity-40"
                >
                  <span className="text-sm text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected day events */}
          {selectedDay && selectedDayEvents.length > 0 && (
            <Card className="border-cygnus-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {selectedDay} {MONTH_NAMES[month]}
                  </CardTitle>
                  <button onClick={() => setSelectedDay(null)}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedDayEvents.map((event) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="flex gap-2 items-start rounded-lg p-2 bg-accent/50">
                      <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", getEventColor(event.type))}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{event.competitionName}</p>
                        {event.description && <p className="text-[10px] text-muted-foreground">{event.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingEvents.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Tidak ada event mendatang</p>
              )}
              {upcomingEvents.map((event, idx) => {
                const Icon = getEventIcon(event.type);
                const daysLeft = getDaysRemaining(new Date(event.date));
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const d = new Date(event.date);
                      if (d.getMonth() !== month || d.getFullYear() !== year) {
                        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                      }
                      setSelectedDay(d.getDate());
                    }}
                  >
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", getEventColor(event.type))}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{event.competitionName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{formatDate(new Date(event.date))}</span>
                        <span className={cn("text-[10px] font-medium",
                          daysLeft <= 3 ? "text-red-400" :
                          daysLeft <= 7 ? "text-yellow-400" :
                          "text-emerald-400"
                        )}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d late` : `${daysLeft}d left`}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Competition dates */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Kompetisi Aktif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {competitions
                .filter((c) => !["FINISHED", "WON", "ELIMINATED"].includes(c.status))
                .slice(0, 6)
                .map((comp, idx) => (
                  <div key={comp.id} className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-cygnus-primary shrink-0" />
                    <span className="truncate flex-1">{comp.name}</span>
                    <Badge variant="outline" className="text-[9px] shrink-0">{comp.status}</Badge>
                  </div>
                ))}
              {competitions.filter((c) => !["FINISHED", "WON", "ELIMINATED"].includes(c.status)).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Tidak ada kompetisi aktif</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
