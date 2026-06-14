"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  File,
  Clock,
  Download,
  Trash2,
  FolderOpen,
  Loader2,
  X,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useCompetitions } from "@/hooks/use-competitions";
import { api } from "@/lib/api";

const documentTypes = [
  { id: "ALL", label: "Semua", icon: File },
  { id: "PROPOSAL", label: "Proposal", icon: FileText },
  { id: "PAPER", label: "Paper", icon: FileText },
  { id: "PPT", label: "PPT", icon: FileSpreadsheet },
  { id: "SOURCE_CODE", label: "Source Code", icon: FileCode },
  { id: "DATASET", label: "Dataset", icon: FileArchive },
  { id: "REFERENCES", label: "References", icon: FileText },
  { id: "OTHER", label: "Lainnya", icon: File },
];

const FILE_COLORS: Record<string, string> = {
  PROPOSAL: "bg-blue-500/10 text-blue-400",
  PAPER: "bg-purple-500/10 text-purple-400",
  PPT: "bg-orange-500/10 text-orange-400",
  SOURCE_CODE: "bg-emerald-500/10 text-emerald-400",
  DATASET: "bg-cyan-500/10 text-cyan-400",
  REFERENCES: "bg-pink-500/10 text-pink-400",
  OTHER: "bg-muted text-muted-foreground",
};

const FILE_ICONS: Record<string, any> = {
  PROPOSAL: FileText,
  PAPER: FileText,
  PPT: FileSpreadsheet,
  SOURCE_CODE: FileCode,
  DATASET: FileArchive,
  REFERENCES: FileText,
};

function getFileIcon(type: string) { return FILE_ICONS[type] || File; }
function getFileColor(type: string) { return FILE_COLORS[type] || "bg-muted text-muted-foreground"; }

function formatSize(bytes: number) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Remove persistDocuments

export default function DocumentsPage() {
  const { competitions, loaded: compsLoaded } = useCompetitions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; competitionId: string; name: string } | null>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoaded, setDocsLoaded] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await api.documents.list();
      const formatted = data.map(doc => ({
        ...doc,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        competitionName: doc.competition?.name || "Unknown",
        competitionId: doc.competitionId,
      }));
      setDocuments(formatted);
    } catch (e) {
      toast.error("Gagal memuat dokumen");
    } finally {
      setDocsLoaded(true);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.competitionName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === "ALL" || doc.type === selectedType;
      return matchSearch && matchType;
    });
  }, [documents, searchQuery, selectedType]);

  const handleAdd = async (newDoc: any) => {
    try {
      await api.competitions.documents.create(newDoc.competitionId, newDoc);
      fetchDocuments();
      toast.success("Dokumen berhasil diupload!");
    } catch (e) {
      toast.error("Gagal upload dokumen");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.competitions.documents.delete(deleteTarget.competitionId, deleteTarget.id);
      fetchDocuments();
      toast.success("Dokumen dihapus.");
    } catch (e) {
      toast.error("Gagal hapus dokumen");
    }
    setDeleteTarget(null);
  };

  const handleDownload = (doc: any) => {
    // If stored as base64 data URL, trigger real download
    if (doc.url && doc.url.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = doc.url;
      a.download = doc.name;
      a.click();
      toast.success(`Mengunduh ${doc.name}…`);
    } else {
      // Fallback: create a blank text file as demo
      const blob = new Blob(
        [`Dokumen: ${doc.name}\nKompetisi: ${doc.competitionName}\nTipe: ${doc.type}`],
        { type: "text/plain" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Mengunduh ${doc.name}…`);
    }
  };

  const docStats = documentTypes.slice(1).map((type) => ({
    ...type,
    count: documents.filter((d) => d.type === type.id).length,
  }));

  if (!docsLoaded || !compsLoaded) {
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
          <h1 className="text-3xl font-bold tracking-tight">Document Center</h1>
          <p className="text-muted-foreground mt-1">
            Pusat penyimpanan dan manajemen dokumen kompetisi ({documents.length} dokumen)
          </p>
        </div>
        <AddDocumentDialog onAdd={handleAdd} />
      </div>

      {/* Type Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-8">
        {/* All */}
        <Card
          className={cn(
            "cursor-pointer hover:shadow-md transition-all col-span-2 sm:col-span-1",
            selectedType === "ALL" && "border-cygnus-primary/50 bg-cygnus-primary/5"
          )}
          onClick={() => setSelectedType("ALL")}
        >
          <CardContent className="p-3 text-center">
            <File className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{documents.length}</p>
            <p className="text-[10px] text-muted-foreground">Semua</p>
          </CardContent>
        </Card>
        {docStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                selectedType === stat.id && "border-cygnus-primary/50 bg-cygnus-primary/5"
              )}
              onClick={() => setSelectedType(stat.id)}
            >
              <CardContent className="p-3 text-center">
                <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{stat.count}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari dokumen atau kompetisi..."
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
        {selectedType !== "ALL" && (
          <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedType("ALL")}>
            {documentTypes.find(t => t.id === selectedType)?.label}
            <X className="h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Documents Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc, idx) => {
            const Icon = getFileIcon(doc.type);
            return (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Color bar by type */}
                    <div className={cn("h-1 w-full", {
                      "bg-blue-500": doc.type === "PROPOSAL",
                      "bg-purple-500": doc.type === "PAPER",
                      "bg-orange-500": doc.type === "PPT",
                      "bg-emerald-500": doc.type === "SOURCE_CODE",
                      "bg-cyan-500": doc.type === "DATASET",
                      "bg-pink-500": doc.type === "REFERENCES",
                      "bg-gray-500": doc.type === "OTHER",
                    })} />

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", getFileColor(doc.type))}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">v{doc.version || 1}</Badge>
                          <Badge variant="outline" className="text-[10px]">{doc.type?.replace(/_/g, " ")}</Badge>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Trophy className="h-3 w-3 shrink-0" />
                        <span className="truncate">{doc.competitionName}</span>
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(doc.createdAt)}
                        </span>
                        <span>{formatSize(doc.size)}</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-cygnus-primary/80 to-cygnus-accent/80 text-white">
                              {getInitials(doc.user?.name || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {doc.user?.name || "Unknown"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-cygnus-primary"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: doc.id, competitionId: doc.competitionId, name: doc.name })}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredDocs.length === 0 && (
        <div className="text-center py-16">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">
            {searchQuery || selectedType !== "ALL" ? "Tidak ada dokumen cocok" : "Belum ada dokumen"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery || selectedType !== "ALL"
              ? "Coba ubah filter atau kata pencarian"
              : "Upload dokumen pertama dari tombol di atas"}
          </p>
        </div>
      )}

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen <strong>{deleteTarget?.name}</strong> akan dihapus secara permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  return inputs
    .flatMap((i) => {
      if (!i) return [];
      if (typeof i === "object") return Object.entries(i).filter(([, v]) => v).map(([k]) => k);
      return [i];
    })
    .join(" ");
}
