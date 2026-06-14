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
import { mockUsers } from "@/lib/mock-data";

interface AddKnowledgeDialogProps {
  onAdd: (article: any) => void;
}

export function AddKnowledgeDialog({ onAdd }: AddKnowledgeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    tags: "",
    isTemplate: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const checked = (e.target as any).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newArticle = {
      id: `kb-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      authorId: mockUsers[0].id,
      author: mockUsers[0],
      isTemplate: formData.isTemplate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAdd(newArticle);
    setOpen(false);
    setFormData({
      title: "",
      content: "",
      category: "GENERAL",
      tags: "",
      isTemplate: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Artikel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Artikel Baru</DialogTitle>
            <DialogDescription>
              Bagikan pengetahuan, tips, atau strategi ke Knowledge Base.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Judul Artikel</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Strategi Menang Hackathon"
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
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="GENERAL">General</option>
                  <option value="TIPS">Tips</option>
                  <option value="STRATEGY">Strategy</option>
                  <option value="TEMPLATE">Template</option>
                  <option value="LESSONS_LEARNED">Lessons Learned</option>
                  <option value="EVALUATION">Evaluation</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="hackathon, tips, ui"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Konten (Markdown supported)</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tulis konten artikel di sini..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTemplate"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={handleChange as any}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isTemplate" className="text-sm font-normal">
                Tandai sebagai Template
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Artikel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
