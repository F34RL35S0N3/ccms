"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface AddMemberDialogProps {
  onAdd: (member: any) => void;
  existingMemberIds: string[];
}

export function AddMemberDialog({ onAdd, existingMemberIds }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    role: "MEMBER",
  });

  const availableUsers = mockUsers.filter(u => !existingMemberIds.includes(u.id));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) return;

    const user = mockUsers.find(u => u.id === formData.userId);

    const newMember = {
      id: `tm-${Date.now()}`,
      userId: formData.userId,
      user: user,
      role: formData.role,
      joinedAt: new Date(),
    };

    onAdd(newMember);
    setOpen(false);
    setFormData({ userId: "", role: "MEMBER" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim</DialogTitle>
            <DialogDescription>
              Pilih pengguna untuk ditambahkan ke tim kompetisi ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Semua user sudah bergabung di tim ini.
              </p>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="userId">Pengguna</Label>
                  <select
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>Pilih pengguna...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role / Peran</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="MEMBER">Member</option>
                    <option value="CO_LEADER">Co-Leader</option>
                    <option value="LEADER">Leader</option>
                    <option value="MENTOR">Mentor</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={availableUsers.length === 0 || !formData.userId}>
              Tambahkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
