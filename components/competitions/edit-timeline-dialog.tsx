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

const timelineTypes = ["DEADLINE", "MEETING", "PRESENTATION", "SUBMISSION", "MILESTONE", "OTHER"];

interface TimelineItem {
  id: string;
  title: string;
  date: Date;
  type: "DEADLINE" | "MEETING" | "PRESENTATION" | "SUBMISSION" | "MILESTONE" | "OTHER";
  description: string | null;
}

interface EditTimelineDialogProps {
  item: TimelineItem;
  onSave: (updated: TimelineItem) => void;
}

export function EditTimelineDialog({ item, onSave }: EditTimelineDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title,
    type: item.type,
    date: item.date.toISOString().split("T")[0],
    description: item.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      title: formData.title,
      type: formData.type as TimelineItem["type"],
      date: new Date(formData.date),
      description: formData.description || null,
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
            <DialogTitle>Edit Timeline</DialogTitle>
            <DialogDescription>Ubah informasi timeline event ini</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-tl-title">Judul</Label>
              <Input id="edit-tl-title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-tl-type">Tipe</Label>
                <select
                  id="edit-tl-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange as any}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {timelineTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tl-date">Tanggal</Label>
                <Input id="edit-tl-date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tl-desc">Deskripsi</Label>
              <Textarea id="edit-tl-desc" name="description" value={formData.description} onChange={handleChange} rows={2} />
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
