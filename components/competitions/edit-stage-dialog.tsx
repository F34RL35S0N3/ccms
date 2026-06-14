"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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

const stageStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"];

interface Stage {
  id: string;
  name: string;
  order: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
}

interface EditStageDialogProps {
  stage: Stage;
  onSave: (updated: Stage) => void;
}

export function EditStageDialog({ stage, onSave }: EditStageDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: stage.name,
    status: stage.status,
    description: stage.description || "",
    startDate: stage.startDate ? stage.startDate.toISOString().split("T")[0] : "",
    endDate: stage.endDate ? stage.endDate.toISOString().split("T")[0] : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...stage,
      name: formData.name,
      status: formData.status as Stage["status"],
      description: formData.description || null,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Workflow Stage</DialogTitle>
            <DialogDescription>Ubah informasi tahapan workflow ini</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-name">Nama Stage</Label>
              <Input id="edit-stage-name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-status">Status</Label>
              <select
                id="edit-stage-status"
                name="status"
                value={formData.status}
                onChange={handleChange as any}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {stageStatuses.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-stage-start">Tanggal Mulai</Label>
                <Input id="edit-stage-start" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stage-end">Tanggal Selesai</Label>
                <Input id="edit-stage-end" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stage-desc">Deskripsi</Label>
              <Textarea id="edit-stage-desc" name="description" value={formData.description} onChange={handleChange} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
