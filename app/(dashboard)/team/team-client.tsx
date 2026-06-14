"use client";

import { motion } from "framer-motion";
import {
  Users,
  Search,
  Mail,
  GraduationCap,
  Wrench,
  Shield,
  Crown,
  User as UserIcon,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { User, UserRole } from "@prisma/client";
import { toast } from "sonner";
import { mockUsers } from "@/lib/mock-data";

const skillColors: Record<string, string> = {
  Frontend: "bg-blue-500/20 text-blue-400",
  Backend: "bg-emerald-500/20 text-emerald-400",
  Mobile: "bg-purple-500/20 text-purple-400",
  "AI/ML": "bg-pink-500/20 text-pink-400",
  "Cyber Security": "bg-red-500/20 text-red-400",
  "UI/UX": "bg-orange-500/20 text-orange-400",
  Research: "bg-cyan-500/20 text-cyan-400",
  Writing: "bg-yellow-500/20 text-yellow-400",
  "Data Science": "bg-indigo-500/20 text-indigo-400",
  "Business Case": "bg-teal-500/20 text-teal-400",
  CTF: "bg-red-500/20 text-red-400",
};

const roleConfig = {
  ADMIN: { icon: Shield, color: "text-red-400", bg: "bg-red-500/10", label: "Admin" },
  TEAM_LEADER: { icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10", label: "Team Leader" },
  MEMBER: { icon: UserIcon, color: "text-blue-400", bg: "bg-blue-500/10", label: "Member" },
};

export default function TeamClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const allSkills = Array.from(new Set(users.flatMap((u) => u.skills)));

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER" as UserRole,
    nim: "",
    faculty: "",
    skills: "", // comma separated
  });

  const handleOpenAdd = () => {
    setFormData({ name: "", email: "", password: "", role: "MEMBER", nim: "", faculty: "", skills: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "", // do not show existing password
      role: user.role,
      nim: user.nim || "",
      faculty: user.faculty || "",
      skills: user.skills.join(", "),
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        nim: data.nim || null,
        faculty: data.faculty || null,
        skills: data.skills,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockUsers.unshift(newUser as any);
      setUsers([newUser as any, ...users]);
      setIsAddOpen(false);
      toast.success("Akun berhasil ditambahkan!");
      setIsSubmitting(false);
    }, 500);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    
    const data = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    
    // Simulate API call
    setTimeout(() => {
      const updatedUser = {
        ...selectedUser,
        ...data,
      };
      
      const userIndex = mockUsers.findIndex(u => u.id === selectedUser.id);
      if (userIndex !== -1) mockUsers[userIndex] = updatedUser as any;
      
      setUsers(users.map((u) => (u.id === selectedUser.id ? (updatedUser as any) : u)));
      setIsEditOpen(false);
      toast.success("Akun berhasil diperbarui!");
      setIsSubmitting(false);
    }, 500);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const userIndex = mockUsers.findIndex(u => u.id === selectedUser.id);
      if (userIndex !== -1) mockUsers.splice(userIndex, 1);
      
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteOpen(false);
      toast.success("Akun berhasil dihapus!");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Kelola anggota tim Cygnus dan keahlian mereka
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cygnus-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-cygnus-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Anggota</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter((u) => u.role === "TEAM_LEADER").length}</p>
              <p className="text-xs text-muted-foreground">Team Leaders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allSkills.length}</p>
              <p className="text-xs text-muted-foreground">Total Skills</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cygnus-secondary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-cygnus-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Array.from(new Set(users.map((u) => u.faculty))).filter(Boolean).length}
              </p>
              <p className="text-xs text-muted-foreground">Fakultas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari anggota berdasarkan nama, email, atau skill..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Team Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user, idx) => {
          const role = roleConfig[user.role];
          const RoleIcon = role.icon;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                <CardContent className="p-0">
                  {/* Options Menu */}
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)} className="cursor-pointer gap-2">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          Edit Akun
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDelete(user)} className="cursor-pointer gap-2 text-red-500 focus:text-red-500">
                          <Trash2 className="h-4 w-4" />
                          Hapus Akun
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Top gradient bar */}
                  <div className="h-20 bg-gradient-to-r from-cygnus-primary/80 via-cygnus-secondary/80 to-cygnus-accent/80 relative">
                    <div className="absolute -bottom-8 left-6">
                      <Avatar className="h-16 w-16 border-4 border-background">
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-cygnus-primary to-cygnus-accent text-white">
                          {getInitials(user.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="pt-10 px-6 pb-6">
                    <div className="flex items-start justify-between mt-1">
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                      <Badge className={cn("gap-1 text-[10px]", role.bg, role.color)}>
                        <RoleIcon className="h-3 w-3" />
                        {role.label}
                      </Badge>
                    </div>

                    {user.nim && (
                      <p className="text-xs text-muted-foreground mt-2">
                        NIM: {user.nim}
                      </p>
                    )}
                    {user.faculty && (
                      <p className="text-xs text-muted-foreground">
                        {user.faculty}
                      </p>
                    )}

                    <div className="mt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className={cn("text-[10px]", skillColors[skill] || "bg-muted")}
                          >
                            {skill}
                          </Badge>
                        ))}
                        {user.skills.length === 0 && (
                          <span className="text-xs text-muted-foreground">Belum ada skill</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">Tidak ada anggota ditemukan</h3>
          <p className="text-muted-foreground mt-1">Coba ubah kata kunci pencarian</p>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Akun Baru</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk anggota tim Cygnus.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Masukkan password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <option value="MEMBER">Member</option>
                  <option value="TEAM_LEADER">Team Leader</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nim">NIM</Label>
                <Input
                  id="nim"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Masukkan NIM"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="faculty">Fakultas</Label>
                <Input
                  id="faculty"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  placeholder="Masukkan fakultas"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills (Pisahkan dengan koma)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Frontend, AI/ML, Design"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Akun</DialogTitle>
            <DialogDescription>
              Ubah detail informasi akun anggota.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Password Baru (Opsional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  <option value="MEMBER">Member</option>
                  <option value="TEAM_LEADER">Team Leader</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-nim">NIM</Label>
                <Input
                  id="edit-nim"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  placeholder="Masukkan NIM"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-faculty">Fakultas</Label>
                <Input
                  id="edit-faculty"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  placeholder="Masukkan fakultas"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-skills">Skills (Pisahkan dengan koma)</Label>
                <Input
                  id="edit-skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Frontend, AI/ML, Design"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun <b>{selectedUser?.name}</b>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
