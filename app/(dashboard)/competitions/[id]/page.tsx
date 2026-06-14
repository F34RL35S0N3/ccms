"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Calendar,
  Users,
  Clock,
  FileText,
  CheckCircle2,
  Circle,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Trash2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockCompetitions } from "@/lib/mock-data";
import { useState } from "react";
import { EditCompetitionDialog } from "@/components/competitions/edit-competition-dialog";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { AddStageDialog } from "@/components/competitions/add-stage-dialog";
import { AddTimelineDialog } from "@/components/competitions/add-timeline-dialog";
import { AddMemberDialog } from "@/components/competitions/add-member-dialog";
import { AddDocumentDialog } from "@/components/documents/add-document-dialog";
import { EditStageDialog } from "@/components/competitions/edit-stage-dialog";
import { EditTimelineDialog } from "@/components/competitions/edit-timeline-dialog";
import { toast } from "sonner";

import {
  getStatusColor,
  getCategoryLabel,
  getLevelLabel,
  getInitials,
  getDaysRemaining,
  getDeadlineColor,
  getDeadlineBadgeColor,
  formatDate,
} from "@/lib/utils";
import { usePersistedCompetitions } from "@/hooks/use-persisted-competitions";

const STORAGE_KEY = "cygnus_competitions";

/** Persist a single updated competition back to localStorage */
function persistUpdate(updated: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: any[] = JSON.parse(raw);
    const idx = list.findIndex((c: any) => c.id === updated.id);
    if (idx !== -1) list[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const { competitions, loaded } = usePersistedCompetitions();

  // Find from persisted list (after localStorage loads)
  const initialComp = competitions.find((c) => c.id === params.id);
  const [competition, setCompetition] = useState<any>(null);

  // Sync competition from persisted list once loaded
  const [synced, setSynced] = useState(false);
  if (loaded && !synced && initialComp) {
    setCompetition(initialComp);
    setSynced(true);
  }

  const updateComp = (updated: any) => {
    persistUpdate(updated);
    setCompetition(updated);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-cygnus-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Kompetisi tidak ditemukan</h2>
          <Link href="/competitions">
            <Button variant="link" className="mt-2">Kembali ke daftar kompetisi</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedStages = competition.stages.filter((s: any) => s.status === "COMPLETED").length;
  const progress = competition.stages.length > 0
    ? Math.round((completedStages / competition.stages.length) * 100)
    : 0;
  const currentStage = competition.stages.find((s: any) => s.status === "IN_PROGRESS");

  // --- Stage handlers ---
  const handleStageCheck = (stageId: string) => {
    const updated = {
      ...competition,
      stages: competition.stages.map((s: any) =>
        s.id === stageId
          ? { ...s, status: s.status === "COMPLETED" ? "PENDING" : "COMPLETED" }
          : s
      ),
    };
    updateComp(updated);
    toast.success("Status workflow diperbarui!");
  };

  const handleStageEdit = (updatedStage: any) => {
    const updated = {
      ...competition,
      stages: competition.stages.map((s: any) => s.id === updatedStage.id ? updatedStage : s),
    };
    updateComp(updated);
    toast.success("Workflow stage berhasil diperbarui!");
  };

  const handleStageDelete = (stageId: string) => {
    const updated = {
      ...competition,
      stages: competition.stages.filter((s: any) => s.id !== stageId),
    };
    updateComp(updated);
    toast.success("Stage dihapus.");
  };

  // --- Timeline handlers ---
  const handleTimelineEdit = (updatedItem: any) => {
    const updated = {
      ...competition,
      timeline: competition.timeline
        .map((t: any) => t.id === updatedItem.id ? updatedItem : t)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
    updateComp(updated);
    toast.success("Timeline berhasil diperbarui!");
  };

  const handleTimelineDelete = (timelineId: string) => {
    const updated = {
      ...competition,
      timeline: competition.timeline.filter((t: any) => t.id !== timelineId),
    };
    updateComp(updated);
    toast.success("Timeline event dihapus.");
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <Link href="/competitions">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">{getCategoryLabel(competition.category)}</Badge>
              <Badge className={getStatusColor(competition.status)}>
                {competition.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {getLevelLabel(competition.level)}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{competition.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              {competition.organizer}
              {competition.website && (
                <a href={competition.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 text-cygnus-primary hover:text-cygnus-accent transition-colors" />
                </a>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <EditCompetitionDialog
              competition={competition}
              onSave={(updated) => updateComp(updated)}
            />
            <AddTaskDialog
              competitionId={competition.id}
              onAdd={(newTask) => {
                updateComp({ ...competition, tasks: [newTask, ...competition.tasks] });
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cygnus-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-cygnus-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">{progress}%</p>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cygnus-secondary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-cygnus-secondary" />
            </div>
            <div>
              <p className="text-lg font-bold">{competition.teamMembers.length}</p>
              <p className="text-xs text-muted-foreground">Anggota Tim</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cygnus-accent/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-cygnus-accent" />
            </div>
            <div>
              <p className="text-lg font-bold">{competition.tasks.length}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold">{competition.prizePool || "-"}</p>
              <p className="text-xs text-muted-foreground">Prize Pool</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {competition.description || "Tidak ada deskripsi."}
                </p>

                <Separator className="my-4" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Tanggal Mulai</p>
                    <p className="text-sm text-muted-foreground">
                      {competition.startDate ? formatDate(competition.startDate) : "Belum ditentukan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Tanggal Selesai</p>
                    <p className="text-sm text-muted-foreground">
                      {competition.endDate ? formatDate(competition.endDate) : "Belum ditentukan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Benefit</p>
                    <div className="flex gap-2 mt-1">
                      {competition.certificate && <Badge variant="secondary" className="text-xs">Sertifikat</Badge>}
                      {competition.funding && <Badge variant="secondary" className="text-xs">Pendanaan</Badge>}
                      {competition.incubation && <Badge variant="secondary" className="text-xs">Inkubasi</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Website</p>
                    <p className="text-sm text-muted-foreground">
                      {competition.website ? (
                        <a href={competition.website} target="_blank" rel="noopener noreferrer" className="text-cygnus-primary hover:underline">
                          {competition.website}
                        </a>
                      ) : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Stage</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStage ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-cygnus-primary/20 flex items-center justify-center">
                        <Circle className="h-5 w-5 text-cygnus-primary animate-pulse" />
                      </div>
                      <div>
                        <p className="font-semibold">{currentStage.name}</p>
                        <p className="text-xs text-muted-foreground">Sedang berjalan</p>
                      </div>
                    </div>
                    <Progress value={50} className="h-2" />
                    {currentStage.description && (
                      <p className="text-sm text-muted-foreground">{currentStage.description}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada stage yang sedang berjalan</p>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Upcoming Deadlines</p>
                  {competition.deadlines
                    .filter((d: any) => getDaysRemaining(d.date) >= -1)
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 3)
                    .map((dl: any) => (
                      <div key={dl.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-muted/50">
                        <span className="truncate pr-2">{dl.title}</span>
                        <span className={cn("text-xs shrink-0", getDeadlineColor(getDaysRemaining(dl.date)))}>
                          {getDaysRemaining(dl.date) < 0
                            ? `${Math.abs(getDaysRemaining(dl.date))}d late`
                            : `${getDaysRemaining(dl.date)}d left`}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Competition Workflow</CardTitle>
                <CardDescription>
                  Tahapan kompetisi {getCategoryLabel(competition.category)}
                </CardDescription>
              </div>
              <AddStageDialog
                nextOrder={competition.stages.length + 1}
                onAdd={(newStage) => {
                  const updated = { ...competition, stages: [...competition.stages, newStage] };
                  const idx = mockCompetitions.findIndex((c) => c.id === updated.id);
                  if (idx !== -1) mockCompetitions[idx] = updated;
                  setCompetition(updated);
                }}
              />
            </CardHeader>
            <CardContent>
              {competition.stages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada workflow stage. Tambahkan stage pertama!</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-0">
                    {competition.stages.map((stage: any, idx: number) => {
                      const isCompleted = stage.status === "COMPLETED";
                      const isCurrent = stage.status === "IN_PROGRESS";
                      const isPending = stage.status === "PENDING";

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="relative flex gap-4 pb-8 last:pb-0 group/stage"
                        >
                          {/* Clickable Check Circle */}
                          <button
                            onClick={() => handleStageCheck(stage.id)}
                            title={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
                            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center focus:outline-none"
                          >
                            <div className={cn(
                              "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
                              isCompleted && "bg-emerald-500 border-emerald-500 hover:bg-emerald-600",
                              isCurrent && "bg-cygnus-primary border-cygnus-primary",
                              isPending && "bg-background border-muted-foreground/30 hover:border-emerald-500/60",
                            )}>
                              {isCompleted ? (
                                <Check className="h-5 w-5 text-white" />
                              ) : isCurrent ? (
                                <Circle className="h-5 w-5 text-white fill-white" />
                              ) : (
                                <span className="text-xs text-muted-foreground">{idx + 1}</span>
                              )}
                            </div>
                          </button>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={cn(
                                "font-semibold",
                                isCompleted && "text-emerald-500 line-through",
                                isCurrent && "text-cygnus-primary",
                                isPending && "text-muted-foreground",
                              )}>
                                {stage.name}
                              </h3>
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                isCompleted && "border-emerald-500/50 text-emerald-500",
                                isCurrent && "border-cygnus-primary/50 text-cygnus-primary",
                              )}>
                                {stage.status.replace("_", " ")}
                              </Badge>
                            </div>
                            {stage.description && (
                              <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                            )}
                            {(stage.startDate || stage.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {stage.startDate && formatDate(stage.startDate)}
                                {stage.startDate && stage.endDate && " - "}
                                {stage.endDate && formatDate(stage.endDate)}
                              </p>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-start gap-1 pt-1 opacity-0 group-hover/stage:opacity-100 transition-opacity">
                            <EditStageDialog stage={stage} onSave={handleStageEdit} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleStageDelete(stage.id)}
                              title="Hapus stage"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Daftar pekerjaan untuk kompetisi ini</CardDescription>
              </div>
              <AddTaskDialog
                competitionId={competition.id}
                onAdd={(newTask) => {
                  updateComp({ ...competition, tasks: [newTask, ...competition.tasks] });
                }}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competition.tasks.map((task: any, idx: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
                      task.status === "DONE" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30"
                    )}>
                      {task.status === "DONE" && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", task.status === "DONE" && "line-through text-muted-foreground")}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                      )}
                    </div>
                    <Badge className={cn("text-[10px]", getStatusColor(task.priority))}>
                      {task.priority}
                    </Badge>
                    <Badge className={cn("text-[10px]", getStatusColor(task.status))}>
                      {task.status.replace("_", " ")}
                    </Badge>
                    {task.assignee && (
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
                          {getInitials(task.assignee.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {task.dueDate && (
                      <span className={cn("text-xs shrink-0", getDeadlineColor(getDaysRemaining(task.dueDate)))}>
                        {getDaysRemaining(task.dueDate)}d
                      </span>
                    )}
                  </motion.div>
                ))}
                {competition.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Belum ada task</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Anggota tim untuk kompetisi ini</CardDescription>
              </div>
              <AddMemberDialog
                existingMemberIds={competition.teamMembers.map((tm: any) => tm.userId)}
                onAdd={(newMember) => {
                  updateComp({ ...competition, teamMembers: [...competition.teamMembers, newMember] });
                }}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {competition.teamMembers.map((member: any, idx: number) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm bg-gradient-to-br from-cygnus-primary to-cygnus-accent text-white">
                        {getInitials(member.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      <div className="flex gap-1 mt-1">
                        {member.user.skills?.slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className={cn("text-[10px]",
                      member.role === "LEADER" && "bg-cygnus-primary/20 text-cygnus-primary",
                      member.role === "CO_LEADER" && "bg-cygnus-secondary/20 text-cygnus-secondary",
                      member.role === "MEMBER" && "bg-muted text-muted-foreground",
                      member.role === "MENTOR" && "bg-cygnus-accent/20 text-cygnus-accent",
                    )}>
                      {member.role.replace("_", " ")}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Dokumen terkait kompetisi ini</CardDescription>
              </div>
              <AddDocumentDialog
                competitionId={competition.id}
                onAdd={(newDoc) => {
                  updateComp({ ...competition, documents: [newDoc, ...competition.documents] });
                }}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {competition.documents.map((doc: any, idx: number) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-cygnus-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-cygnus-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} · v{doc.version} · {doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[8px]">
                          {getInitials(doc.user.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
                {competition.documents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Belum ada dokumen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Jadwal dan milestone kompetisi</CardDescription>
              </div>
              <AddTimelineDialog
                onAdd={(newTimeline) => {
                  const updated = {
                    ...competition,
                    timeline: [...competition.timeline, newTimeline].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                  };
                  const idx = mockCompetitions.findIndex((c) => c.id === updated.id);
                  if (idx !== -1) mockCompetitions[idx] = updated;
                  setCompetition(updated);
                }}
              />
            </CardHeader>
            <CardContent>
              {competition.timeline.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Belum ada timeline. Tambahkan event pertama!</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-0">
                    {competition.timeline.map((item: any, idx: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="relative flex gap-4 pb-6 last:pb-0 group/tl"
                      >
                        <div className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                          item.type === "DEADLINE" && "bg-red-500/10 border-red-500/30",
                          item.type === "MEETING" && "bg-blue-500/10 border-blue-500/30",
                          item.type === "PRESENTATION" && "bg-purple-500/10 border-purple-500/30",
                          item.type === "SUBMISSION" && "bg-emerald-500/10 border-emerald-500/30",
                          item.type === "MILESTONE" && "bg-amber-500/10 border-amber-500/30",
                          item.type === "OTHER" && "bg-muted border-muted-foreground/30",
                        )}>
                          <Calendar className={cn("h-4 w-4",
                            item.type === "DEADLINE" && "text-red-500",
                            item.type === "MEETING" && "text-blue-500",
                            item.type === "PRESENTATION" && "text-purple-500",
                            item.type === "SUBMISSION" && "text-emerald-500",
                            item.type === "MILESTONE" && "text-amber-500",
                            item.type === "OTHER" && "text-muted-foreground",
                          )} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {formatDate(item.date)}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-start gap-1 pt-1 opacity-0 group-hover/tl:opacity-100 transition-opacity">
                          <EditTimelineDialog item={item} onSave={handleTimelineEdit} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleTimelineDelete(item.id)}
                            title="Hapus timeline event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
