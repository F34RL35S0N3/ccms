"use client";

import { useRef, useState } from "react";
import { Plus, Upload, ImageIcon, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

const categories = [
  "HACKATHON",
  "CTF",
  "RESEARCH",
  "PAPER_COMPETITION",
  "INNOVATION_COMPETITION",
  "BUSINESS_CASE",
  "TECHNOLOGY_COMPETITION",
];

const levels = ["REGIONAL", "NATIONAL", "INTERNATIONAL"];

interface AddCompetitionDialogProps {
  onAdd: (competition: any) => void;
}

export function AddCompetitionDialog({ onAdd }: AddCompetitionDialogProps) {
  const [open, setOpen] = useState(false);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    organizer: "",
    website: "",
    level: "NATIONAL",
    category: "HACKATHON",
    description: "",
    prizePool: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran poster maksimal 5MB");
      return;
    }
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCompetition = {
      id: `comp-${Date.now()}`,
      name: formData.name,
      organizer: formData.organizer,
      website: formData.website || null,
      level: formData.level,
      category: formData.category,
      description: formData.description || null,
      prizePool: formData.prizePool || null,
      poster: posterPreview,
      certificate: false,
      funding: false,
      incubation: false,
      status: "MONITORING",
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      endDate: formData.endDate ? new Date(formData.endDate) : new Date(),
      createdAt: new Date(),
      stages: [],
      timeline: [],
      tasks: [],
      deadlines: [],
      teamMembers: [],
      documents: [],
      results: null,
    };

    onAdd(newCompetition);
    toast.success("Lomba berhasil ditambahkan!");
    setOpen(false);

    // Reset form
    setFormData({ name: "", organizer: "", website: "", level: "NATIONAL", category: "HACKATHON", description: "", prizePool: "", startDate: "", endDate: "" });
    setPosterPreview(null);
    setPosterFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Lomba
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Lomba Baru</DialogTitle>
            <DialogDescription>
              Masukkan detail kompetisi yang ingin ditambahkan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            {/* Poster Upload */}
            <div className="grid gap-2">
              <Label>Poster Lomba (Opsional)</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer border-2 border-dashed border-border rounded-xl overflow-hidden transition-colors hover:border-cygnus-primary/60 hover:bg-cygnus-primary/5"
                style={{ minHeight: posterPreview ? "180px" : "100px" }}
              >
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="w-full h-full object-cover rounded-xl"
                    style={{ maxHeight: "200px", objectPosition: "top" }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-40" />
                    <p className="text-sm">Klik untuk upload poster</p>
                    <p className="text-xs opacity-60">JPG, PNG, WebP — maks 5MB</p>
                  </div>
                )}
                {posterPreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Ganti Poster
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lomba *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Hackathon AI Indonesia"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organizer">Penyelenggara *</Label>
              <Input
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="Contoh: Universitas Indonesia"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange as any}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Tingkat</Label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange as any}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prizePool">Total Hadiah (Opsional)</Label>
              <Input
                id="prizePool"
                name="prizePool"
                value={formData.prizePool}
                onChange={handleChange}
                placeholder="Contoh: Rp 50.000.000"
              />
            </div>
            {/* Tanggal Mulai & Selesai */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (Opsional)</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat lomba..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Lomba</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
