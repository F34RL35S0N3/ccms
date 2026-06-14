"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockUsers } from "@/lib/mock-data";

const STORAGE_KEY = "cygnus_competitions";

function getPersistedCompetitions(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface AddDocumentDialogProps {
  onAdd: (document: any) => void;
  competitionId?: string;
}

export function AddDocumentDialog({ onAdd, competitionId }: AddDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "PROPOSAL",
    competitionId: competitionId || "",
  });

  // Load fresh competitions every time dialog opens
  useEffect(() => {
    if (open) {
      const list = getPersistedCompetitions();
      setCompetitions(list);
      if (!competitionId && list.length > 0) {
        setFormData((prev) => ({ ...prev, competitionId: list[0].id }));
      }
      // reset file selection
      setSelectedFile(null);
      setFileDataUrl(null);
      setFormData((prev) => ({ ...prev, name: "", type: "PROPOSAL" }));
    }
  }, [open, competitionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Use file name as document name (without extension for display)
    const nameNoExt = file.name.replace(/\.[^/.]+$/, "");
    setFormData((prev) => ({ ...prev, name: prev.name || nameNoExt }));
    // Read file as base64 data URL for download simulation
    const reader = new FileReader();
    reader.onload = (ev) => setFileDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const competition = competitions.find((c) => c.id === formData.competitionId);
    const uploader = mockUsers[0];

    const newDocument = {
      id: `doc-${Date.now()}`,
      competitionId: formData.competitionId,
      competitionName: competition?.name || "Unknown",
      uploadedBy: uploader?.id || "user-1",
      user: uploader || { id: "user-1", name: "User" },
      name: formData.name + (formData.name.includes(".") ? "" : selectedFile ? `.${selectedFile.name.split(".").pop()}` : ".pdf"),
      type: formData.type,
      // Store data URL for real download; fall back to a mock URL
      url: fileDataUrl || `/docs/${formData.name.toLowerCase().replace(/\s+/g, "-")}`,
      size: selectedFile?.size || Math.floor(Math.random() * 3000000) + 500000,
      version: 1,
      createdAt: new Date(),
      mimeType: selectedFile?.type || "application/pdf",
    };

    onAdd(newDocument);
    setOpen(false);
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Dokumen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Dokumen</DialogTitle>
            <DialogDescription>
              Upload dokumen baru untuk kompetisi terkait.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Competition */}
            {!competitionId && (
              <div className="grid gap-2">
                <Label htmlFor="doc-comp">Kompetisi</Label>
                {competitions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/40">
                    Belum ada kompetisi. Tambahkan kompetisi terlebih dahulu.
                  </p>
                ) : (
                  <select
                    id="doc-comp"
                    name="competitionId"
                    value={formData.competitionId}
                    onChange={handleChange as any}
                    className={selectClass}
                    required
                  >
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Document type */}
            <div className="grid gap-2">
              <Label htmlFor="doc-type">Tipe Dokumen</Label>
              <select
                id="doc-type"
                name="type"
                value={formData.type}
                onChange={handleChange as any}
                className={selectClass}
                required
              >
                <option value="PROPOSAL">Proposal</option>
                <option value="PAPER">Paper</option>
                <option value="PPT">PPT / Presentation</option>
                <option value="SOURCE_CODE">Source Code</option>
                <option value="DATASET">Dataset</option>
                <option value="REFERENCES">References</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            {/* File upload area */}
            <div className="grid gap-2">
              <Label>File</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                  selectedFile
                    ? "border-cygnus-primary/50 bg-cygnus-primary/5"
                    : "border-muted-foreground/20 hover:border-cygnus-primary/40 hover:bg-accent/30"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.py,.js,.ts,.ipynb,.txt,.csv"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-cygnus-primary" />
                    <span className="text-sm font-medium text-cygnus-primary truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileDataUrl(null); }}
                      className="ml-1"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Klik atau drag file ke sini
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      PDF, DOC, PPT, ZIP, dan lainnya
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Document name */}
            <div className="grid gap-2">
              <Label htmlFor="doc-name">Nama Dokumen</Label>
              <Input
                id="doc-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Proposal Final V2"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button
              type="submit"
              disabled={!competitionId && competitions.length === 0}
            >
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
