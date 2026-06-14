"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
  ClipboardList,
  FileText,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePersistedCompetitions } from "@/hooks/use-persisted-competitions";
import { mockUsers } from "@/lib/mock-data";
import { getInitials, getCategoryLabel, getLevelLabel } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const CATEGORY_LABELS: Record<string, string> = {
  HACKATHON: "Hackathon",
  CTF: "CTF",
  RESEARCH: "Research",
  PAPER_COMPETITION: "Paper",
  INNOVATION_COMPETITION: "Innovation",
  BUSINESS_CASE: "Business",
  TECHNOLOGY_COMPETITION: "Tech",
};

const LEVEL_COLORS: Record<string, string> = {
  REGIONAL: "#06B6D4",
  NATIONAL: "#4F46E5",
  INTERNATIONAL: "#8B5CF6",
};

const STATUS_COLORS: Record<string, string> = {
  MONITORING: "#64748b",
  REGISTRATION: "#3b82f6",
  SELECTION_PROPOSAL: "#f59e0b",
  SEMIFINAL: "#f97316",
  FINAL: "#8b5cf6",
  FINISHED: "#6b7280",
  WON: "#10b981",
  ELIMINATED: "#ef4444",
};

const CHART_COLORS = ["#4F46E5", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function AnalyticsPage() {
  const { competitions, loaded } = usePersistedCompetitions();

  const stats = useMemo(() => {
    const total = competitions.length;
    const active = competitions.filter(
      (c) => !["FINISHED", "WON", "ELIMINATED"].includes(c.status)
    ).length;
    const finished = competitions.filter(
      (c) => ["FINISHED", "WON", "ELIMINATED"].includes(c.status)
    ).length;
    const won = competitions.filter((c) => c.status === "WON").length;
    const winRate = finished > 0 ? Math.round((won / finished) * 100) : 0;

    const allTasks = competitions.flatMap((c) => c.tasks || []);
    const doneTasks = allTasks.filter((t) => t.status === "DONE").length;
    const taskCompletion = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

    const allTimeline = competitions.flatMap((c) => c.timeline || []);
    const allDeadlines = competitions.flatMap((c) => c.deadlines || []);

    return { total, active, finished, won, winRate, allTasks, doneTasks, taskCompletion, allTimeline, allDeadlines };
  }, [competitions]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, { total: number; won: number }> = {};
    competitions.forEach((c) => {
      const key = CATEGORY_LABELS[c.category] || c.category;
      if (!map[key]) map[key] = { total: 0, won: 0 };
      map[key].total++;
      if (c.status === "WON") map[key].won++;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
  }, [competitions]);

  // Level distribution
  const levelData = useMemo(() => {
    const map: Record<string, number> = {};
    competitions.forEach((c) => {
      map[c.level] = (map[c.level] || 0) + 1;
    });
    return Object.entries(map).map(([level, value]) => ({
      name: getLevelLabel(level),
      value,
      color: LEVEL_COLORS[level] || "#6b7280",
    }));
  }, [competitions]);

  // Status distribution
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    competitions.forEach((c) => {
      map[c.status] = (map[c.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, value]) => ({
      name: status.replace(/_/g, " "),
      value,
      color: STATUS_COLORS[status] || "#6b7280",
    }));
  }, [competitions]);

  // Monthly activity (based on competition createdAt)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: Record<string, { month: string; competitions: number; tasks: number; wins: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = {
        month: MONTH_SHORT[d.getMonth()],
        competitions: 0,
        tasks: 0,
        wins: 0,
      };
    }
    competitions.forEach((c) => {
      const d = c.createdAt ? new Date(c.createdAt) : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key]) {
        months[key].competitions++;
        if (c.status === "WON") months[key].wins++;
      }
      (c.tasks || []).forEach((t: any) => {
        const td = t.createdAt ? new Date(t.createdAt) : null;
        if (!td) return;
        const tk = `${td.getFullYear()}-${td.getMonth()}`;
        if (months[tk]) months[tk].tasks++;
      });
    });
    return Object.values(months);
  }, [competitions]);

  // Stage completion per competition
  const workflowData = useMemo(() => {
    return competitions
      .filter((c) => (c.stages || []).length > 0)
      .map((c) => {
        const total = c.stages.length;
        const done = c.stages.filter((s: any) => s.status === "COMPLETED").length;
        return {
          name: c.name.length > 20 ? c.name.slice(0, 18) + "…" : c.name,
          progress: Math.round((done / total) * 100),
          done,
          total,
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 8);
  }, [competitions]);

  // Member contribution from localStorage tasks
  const memberContribution = useMemo(() => {
    const allTasks = competitions.flatMap((c) => c.tasks || []);
    return mockUsers.map((user) => {
      const assigned = allTasks.filter((t: any) => t.assigneeId === user.id);
      const done = assigned.filter((t: any) => t.status === "DONE").length;
      const rate = assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0;
      return {
        id: user.id,
        name: user.name || "User",
        avatar: user.name || "U",
        completed: done,
        total: assigned.length,
        rate,
      };
    }).filter((m) => m.total > 0 || competitions.flatMap(c => (c.teamMembers || [])).some((tm: any) => tm.userId === m.id));
  }, [competitions]);

  // Task status breakdown
  const taskStatusData = useMemo(() => {
    const allTasks = competitions.flatMap((c) => c.tasks || []);
    const map: Record<string, number> = {};
    allTasks.forEach((t: any) => { map[t.status] = (map[t.status] || 0) + 1; });
    return Object.entries(map).map(([status, count], i) => ({
      name: status.replace(/_/g, " "),
      count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [competitions]);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Visualisasi data dan performa tim Cygnus — data real-time dari {competitions.length} kompetisi
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Trophy,
            iconColor: "text-cygnus-primary",
            iconBg: "bg-cygnus-primary/10",
            value: `${stats.winRate}%`,
            label: "Win Rate",
            sub: `${stats.won} menang dari ${stats.finished} selesai`,
            accent: "text-emerald-400",
          },
          {
            icon: CheckCircle2,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-500/10",
            value: `${stats.taskCompletion}%`,
            label: "Task Completion",
            sub: `${stats.doneTasks} dari ${stats.allTasks.length} task selesai`,
            accent: "text-emerald-400",
          },
          {
            icon: Zap,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
            value: stats.active,
            label: "Kompetisi Aktif",
            sub: `dari ${stats.total} total kompetisi`,
            accent: "text-amber-400",
          },
          {
            icon: ClipboardList,
            iconColor: "text-cygnus-secondary",
            iconBg: "bg-cygnus-secondary/10",
            value: stats.allTasks.length,
            label: "Total Tasks",
            sub: `${stats.allDeadlines.length} deadline aktif`,
            accent: "text-blue-400",
          },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", kpi.iconBg)}>
                    <kpi.icon className={cn("h-5 w-5", kpi.iconColor)} />
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] gap-1", kpi.accent)}>
                    <ArrowUpRight className="h-3 w-3" />
                    Live
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{kpi.value}</p>
                <p className="text-xs font-medium mt-1">{kpi.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Monthly Activity + Level Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cygnus-primary" />
              Aktivitas 6 Bulan Terakhir
            </CardTitle>
            <CardDescription>Jumlah kompetisi dan task yang dibuat per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: "#4F46E5", r: 4 }} name="Tasks" />
                  <Line type="monotone" dataKey="competitions" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: "#06B6D4", r: 4 }} name="Kompetisi" />
                  <Line type="monotone" dataKey="wins" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981", r: 4 }} name="Wins" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cygnus-secondary" />
              Distribusi Tingkat
            </CardTitle>
            <CardDescription>Kompetisi berdasarkan level</CardDescription>
          </CardHeader>
          <CardContent>
            {levelData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data
              </div>
            ) : (
              <>
                <div className="h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={levelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {levelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {levelData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Category Analysis + Status Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cygnus-secondary" />
              Analisis per Kategori
            </CardTitle>
            <CardDescription>Total kompetisi dan kemenangan per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data kompetisi
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="total" fill="#4F46E5" radius={[0, 4, 4, 0]} name="Total" barSize={16} />
                    <Bar dataKey="won" fill="#10B981" radius={[0, 4, 4, 0]} name="Menang" barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Status Kompetisi
            </CardTitle>
            <CardDescription>Distribusi status semua kompetisi saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data kompetisi
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Workflow Progress + Task Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              Progress Workflow Kompetisi
            </CardTitle>
            <CardDescription>Persentase stage yang sudah selesai per kompetisi</CardDescription>
          </CardHeader>
          <CardContent>
            {workflowData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Belum ada workflow stage yang ditambahkan
              </div>
            ) : (
              <div className="space-y-4">
                {workflowData.map((comp) => (
                  <div key={comp.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[200px]" title={comp.name}>{comp.name}</span>
                      <span className="text-muted-foreground text-xs shrink-0 ml-2">
                        {comp.done}/{comp.total} ({comp.progress}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${comp.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          comp.progress === 100 ? "bg-emerald-500" :
                          comp.progress >= 60 ? "bg-cygnus-primary" :
                          comp.progress >= 30 ? "bg-amber-500" : "bg-red-500"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Distribusi Status Task
            </CardTitle>
            <CardDescription>Sebaran task berdasarkan status saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            {taskStatusData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Belum ada task yang dibuat
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStatusData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="count" name="Jumlah" radius={[4, 4, 0, 0]} barSize={40}>
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Contribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cygnus-accent" />
            Kontribusi Anggota Tim
          </CardTitle>
          <CardDescription>Task completion rate setiap anggota berdasarkan data yang ada</CardDescription>
        </CardHeader>
        <CardContent>
          {memberContribution.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Belum ada data kontribusi anggota
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {memberContribution.map((member) => (
                <div key={member.id} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
                        {getInitials(member.avatar)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.completed}/{member.total} selesai</p>
                    </div>
                    <Badge
                      className={cn(
                        "ml-auto text-[10px] shrink-0",
                        member.rate >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                        member.rate >= 50 ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      )}
                    >
                      {member.rate}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.rate}%` }}
                        transition={{ duration: 0.8 }}
                        className={cn(
                          "h-full rounded-full",
                          member.rate >= 80 ? "bg-emerald-500" :
                          member.rate >= 50 ? "bg-amber-500" : "bg-red-500"
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Competitions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Ringkasan Kompetisi
          </CardTitle>
          <CardDescription>Semua kompetisi dan metrik utamanya</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {competitions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Trophy className="h-10 w-10 mx-auto mb-2 opacity-40" />
              Belum ada kompetisi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-muted-foreground">Kompetisi</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Kategori</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Tingkat</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Progress</th>
                    <th className="text-right p-4 font-medium text-muted-foreground hidden sm:table-cell">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {competitions.map((comp, i) => {
                    const stages = comp.stages || [];
                    const done = stages.filter((s: any) => s.status === "COMPLETED").length;
                    const progress = stages.length > 0 ? Math.round((done / stages.length) * 100) : 0;
                    const tasks = (comp.tasks || []).length;
                    const doneTasks = (comp.tasks || []).filter((t: any) => t.status === "DONE").length;

                    return (
                      <motion.tr
                        key={comp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium truncate max-w-[180px]">{comp.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{comp.organizer}</p>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <Badge variant="outline" className="text-[10px]">
                            {getCategoryLabel(comp.category)}
                          </Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-xs text-muted-foreground">
                          {getLevelLabel(comp.level)}
                        </td>
                        <td className="p-4">
                          <Badge
                            className="text-[10px]"
                            style={{
                              background: STATUS_COLORS[comp.status] + "33",
                              color: STATUS_COLORS[comp.status],
                              border: `1px solid ${STATUS_COLORS[comp.status]}44`,
                            }}
                          >
                            {comp.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden sm:block w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  progress === 100 ? "bg-emerald-500" : "bg-cygnus-primary"
                                )}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{progress}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-right hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">{doneTasks}/{tasks}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
