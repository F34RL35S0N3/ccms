"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Clock,
  Users,
  MapPin,
  ChevronDown,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddCompetitionDialog } from "@/components/competitions/add-competition-dialog";
import { useCompetitions } from "@/hooks/use-competitions";
import {
  getStatusColor,
  getCategoryLabel,
  getLevelLabel,
  getInitials,
  getDaysRemaining,
  getDeadlineColor,
} from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

const categories = ["ALL", "HACKATHON", "CTF", "RESEARCH", "PAPER_COMPETITION", "INNOVATION_COMPETITION", "BUSINESS_CASE", "TECHNOLOGY_COMPETITION"];
const levels = ["ALL", "REGIONAL", "NATIONAL", "INTERNATIONAL"];
const statuses = ["ALL", "MONITORING", "REGISTRATION", "SELECTION_PROPOSAL", "SEMIFINAL", "FINAL", "FINISHED", "WON", "ELIMINATED"];

export default function CompetitionsPage() {
  const { competitions, addCompetition, deleteCompetition, loaded } = useCompetitions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteCompetition(id);
    toast.success("Kompetisi berhasil dihapus.");
    setDeleteTarget(null);
  };

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || comp.category === selectedCategory;
    const matchesLevel = selectedLevel === "ALL" || comp.level === selectedLevel;
    const matchesStatus = selectedStatus === "ALL" || comp.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const activeCount = competitions.filter(
    (c) => c.status !== "FINISHED" && c.status !== "WON" && c.status !== "ELIMINATED"
  ).length;
  const wonCount = competitions.filter((c) => c.status === "WON").length;

  // Show loading skeleton while localStorage is being read
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
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground mt-1">
            Kelola seluruh kompetisi yang diikuti tim Cygnus
          </p>
        </div>
        <AddCompetitionDialog onAdd={addCompetition} />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-cygnus-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-cygnus-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{competitions.length}</p>
              <p className="text-xs text-muted-foreground">Total Lomba</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Sedang Berjalan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{wonCount}</p>
              <p className="text-xs text-muted-foreground">Menang</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-cygnus-accent/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-cygnus-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {competitions.filter((c) => c.level === "INTERNATIONAL").length}
              </p>
              <p className="text-xs text-muted-foreground">Internasional</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kompetisi..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Kategori
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categories.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={selectedCategory === cat}
                  onCheckedChange={() => setSelectedCategory(cat)}
                >
                  {cat === "ALL" ? "Semua Kategori" : getCategoryLabel(cat)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="h-4 w-4" />
                Tingkat
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {levels.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={selectedLevel === level}
                  onCheckedChange={() => setSelectedLevel(level)}
                >
                  {level === "ALL" ? "Semua Tingkat" : getLevelLabel(level)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="h-4 w-4" />
                Status
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatus === status}
                  onCheckedChange={() => setSelectedStatus(status)}
                >
                  {status === "ALL" ? "Semua Status" : status.replace(/_/g, " ")}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Competition Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitions.map((comp, idx) => {
            const completedStages = comp.stages.filter((s) => s.status === "COMPLETED").length;
            const progress = comp.stages.length > 0
              ? Math.round((completedStages / comp.stages.length) * 100)
              : 0;
            const nextDeadline = comp.deadlines
              .filter((d) => getDaysRemaining(new Date(d.date)) >= -1)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

            return (
              <motion.div
                key={comp.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                className="relative group/card"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(comp.id);
                  }}
                  className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-destructive/80 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity shadow-md"
                  title="Hapus kompetisi"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <Link href={`/competitions/${comp.id}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      {/* Poster or colored bar */}
                      {(comp as any).poster ? (
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={(comp as any).poster}
                            alt={comp.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "h-1.5 w-full",
                            comp.status === "WON" && "bg-emerald-500",
                            comp.status === "ELIMINATED" && "bg-red-500",
                            comp.status === "FINAL" && "bg-amber-500",
                            comp.status === "FINISHED" && "bg-gray-500",
                            !["WON", "ELIMINATED", "FINAL", "FINISHED"].includes(comp.status) && "bg-cygnus-primary"
                          )}
                        />
                      )}

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">
                              {getCategoryLabel(comp.category)}
                            </Badge>
                            <Badge className={cn("text-[10px]", getStatusColor(comp.status))}>
                              {comp.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>

                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {comp.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{comp.organizer}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getLevelLabel(comp.level)}
                          </span>
                          {comp.prizePool && (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {comp.prizePool}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {comp.teamMembers.length} anggota
                          </span>
                        </div>

                        {/* Benefits */}
                        <div className="flex gap-1.5 mb-4 flex-wrap">
                          {comp.certificate && <Badge variant="secondary" className="text-[10px]">Sertifikat</Badge>}
                          {comp.funding && <Badge variant="secondary" className="text-[10px]">Pendanaan</Badge>}
                          {comp.incubation && <Badge variant="secondary" className="text-[10px]">Inkubasi</Badge>}
                        </div>

                        {/* Progress */}
                        {comp.stages.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        )}

                        {/* Next Deadline */}
                        {nextDeadline && (
                          <div className="mt-4 flex items-center gap-2 text-xs pt-3 border-t">
                            <Clock className={cn("h-3 w-3", getDeadlineColor(getDaysRemaining(new Date(nextDeadline.date))))} />
                            <span className={getDeadlineColor(getDaysRemaining(new Date(nextDeadline.date)))}>
                              {getDaysRemaining(new Date(nextDeadline.date)) < 0
                                ? `Terlambat ${Math.abs(getDaysRemaining(new Date(nextDeadline.date)))} hari`
                                : `${getDaysRemaining(new Date(nextDeadline.date))} hari menuju ${nextDeadline.title}`}
                            </span>
                          </div>
                        )}

                        {/* Team Avatars */}
                        {comp.teamMembers.length > 0 && (
                          <div className="mt-3 flex items-center">
                            {comp.teamMembers.slice(0, 4).map((member, i) => (
                              <Avatar key={member.id} className={cn("h-6 w-6 border-2 border-background", i > 0 && "-ml-2")}>
                                <AvatarFallback className="text-[8px] bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
                                  {getInitials(member.user?.name || "U")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {comp.teamMembers.length > 4 && (
                              <span className="text-[10px] text-muted-foreground ml-2">
                                +{comp.teamMembers.length - 4} lainnya
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredCompetitions.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">Tidak ada kompetisi ditemukan</h3>
          <p className="text-muted-foreground mt-1">Coba ubah filter atau tambah kompetisi baru</p>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kompetisi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kompetisi ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
