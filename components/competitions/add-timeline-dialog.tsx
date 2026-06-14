"use client";

import { useState } from "react";
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

interface AddTimelineDialogProps {
  onAdd: (timeline: any) => void;
}

export function AddTimelineDialog({ onAdd }: AddTimelineDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "MILESTONE",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTimeline = {
      id: `tl-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      date: new Date(formData.date),
      description: formData.description,
    };

    onAdd(newTimeline);
    setOpen(false);
    setFormData((prev) => ({ ...prev, title: "", description: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Timeline Event</DialogTitle>
            <DialogDescription>
              Tambahkan event baru ke timeline kompetisi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Event</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Technical Meeting"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipe</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange as any}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="DEADLINE">Deadline</option>
                  <option value="MEETING">Meeting</option>
                  <option value="PRESENTATION">Presentation</option>
                  <option value="SUBMISSION">Submission</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Catatan kecil tentang event ini..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
