"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const STORAGE_KEY = "cygnus_competitions";

interface AddDeadlineDialogProps {
  onAdd: (deadline: any) => void;
  competitionId?: string;
  triggerButton?: React.ReactNode;
}

/** Read competitions list from localStorage (always fresh) */
function getPersistedCompetitions(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function AddDeadlineDialog({ onAdd, competitionId, triggerButton }: AddDeadlineDialogProps) {
  const [open, setOpen] = useState(false);
  const [competitions, setCompetitions] = useState<any[]>([]);

  // Load competitions from localStorage each time the dialog opens
  useEffect(() => {
    if (open) {
      const list = getPersistedCompetitions();
      setCompetitions(list);
      // Reset competitionId default if needed
      if (!competitionId && list.length > 0) {
        setFormData((prev) => ({ ...prev, competitionId: list[0].id }));
      }
    }
  }, [open, competitionId]);

  const [formData, setFormData] = useState({
    title: "",
    type: "OTHER",
    date: new Date().toISOString().split("T")[0],
    description: "",
    competitionId: competitionId || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const competition = competitions.find((c) => c.id === formData.competitionId);
    const deadlineDate = new Date(formData.date);

    const newDeadline = {
      id: `dl-${Date.now()}`,
      competitionId: formData.competitionId,
      competition: competition
        ? { id: competition.id, name: competition.name }
        : null,
      title: formData.title,
      type: formData.type,
      date: deadlineDate,
      description: formData.description,
      daysRemaining: Math.ceil(
        (deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
      createdAt: new Date(),
    };

    onAdd(newDeadline);
    setOpen(false);
    setFormData((prev) => ({ ...prev, title: "", description: "" }));
  };

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Deadline
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Deadline Baru</DialogTitle>
            <DialogDescription>
              Buat pengingat deadline untuk kompetisi Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dl-title">Judul Deadline</Label>
              <Input
                id="dl-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Pengumpulan Proposal"
                required
              />
            </div>

            {/* Competition selector — only from localStorage, only shown if not locked */}
            {!competitionId && (
              <div className="grid gap-2">
                <Label htmlFor="dl-competitionId">Kompetisi</Label>
                {competitions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/40">
                    Belum ada kompetisi. Tambahkan kompetisi terlebih dahulu.
                  </p>
                ) : (
                  <select
                    id="dl-competitionId"
                    name="competitionId"
                    value={formData.competitionId}
                    onChange={handleChange as any}
                    className={selectClass}
                    required
                  >
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dl-type">Tipe</Label>
                <select
                  id="dl-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange as any}
                  className={selectClass}
                  required
                >
                  <option value="REGISTRATION">Registrasi</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="SUBMISSION">Submission</option>
                  <option value="PRESENTATION">Presentasi</option>
                  <option value="FINAL_ROUND">Final Round</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dl-date">Tanggal</Label>
                <Input
                  id="dl-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dl-description">Deskripsi</Label>
              <Textarea
                id="dl-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat deadline..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!competitionId && competitions.length === 0}>
              Simpan Deadline
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
