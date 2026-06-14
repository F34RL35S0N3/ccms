"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  MessageSquare,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { mockUsers } from "@/lib/mock-data";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const { data: session } = useSession();

  // Get current user data from session + mockUsers for extra fields
  const sessionEmail = session?.user?.email;
  const currentUser = mockUsers.find(u => u.email === sessionEmail);
  const displayName = session?.user?.name || currentUser?.name || "Guest";
  const displayEmail = session?.user?.email || "";
  const displayNim = currentUser?.nim || "";
  const displayFaculty = currentUser?.faculty || "";
  const displayRole = currentUser?.role || "MEMBER";


  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    nim: "",
    faculty: "",
    bio: "",
  });

  // Compute initials from display name — reactive to form changes
  const displayInitials = (profileForm.name || displayName)
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Sync form once session is available
  const [formSynced, setFormSynced] = useState(false);
  if (!formSynced && sessionEmail) {
    setProfileForm({
      name: displayName,
      email: displayEmail,
      nim: displayNim,
      faculty: displayFaculty,
      bio: `${displayRole === "ADMIN" ? "Admin" : displayRole === "TEAM_LEADER" ? "Team Leader" : "Member"} CYGNUS`,
    });
    setFormSynced(true);
  }

  const handleSave = () => {
    // Persist changes back to the mockUsers array (in-memory persistence)
    if (currentUser) {
      currentUser.name = profileForm.name || currentUser.name;
      currentUser.email = profileForm.email || currentUser.email;
      currentUser.nim = profileForm.nim || currentUser.nim;
      currentUser.faculty = profileForm.faculty || currentUser.faculty;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleLabel = displayRole === "ADMIN" ? "Admin" : displayRole === "TEAM_LEADER" ? "Team Leader" : "Member";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Kelola preferensi dan konfigurasi akun Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Tampilan
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Keamanan
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Informasi akun yang sedang login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-cygnus-primary to-cygnus-accent text-white">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{displayName}</p>
                  <Badge className="mt-1 text-[10px]" variant="secondary">
                    {roleLabel}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">{displayEmail}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <Input
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={profileForm.email}
                    type="email"
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIM</label>
                  <Input
                    value={profileForm.nim}
                    onChange={e => setProfileForm({ ...profileForm, nim: e.target.value })}
                    placeholder="Belum diatur"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fakultas</label>
                  <Input
                    value={profileForm.faculty}
                    onChange={e => setProfileForm({ ...profileForm, faculty: e.target.value })}
                    placeholder="Belum diatur"
                  />
                </div>
              </div>

              {currentUser?.skills && currentUser.skills.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentUser.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Input
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Tersimpan" : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>Atur channel dan frekuensi notifikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cygnus-primary" />
                  Email Notifications
                </h4>
                {[
                  { label: "Deadline mendekat", desc: "Notifikasi 30, 14, 7, 3, 1 hari sebelum deadline", defaultChecked: true },
                  { label: "Task diassign", desc: "Notifikasi ketika ada task baru yang diassign", defaultChecked: true },
                  { label: "Progress update", desc: "Notifikasi ketika ada update progress kompetisi", defaultChecked: false },
                  { label: "Weekly summary", desc: "Ringkasan mingguan aktivitas tim", defaultChecked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-cygnus-secondary" />
                  WhatsApp Notifications
                </h4>
                {[
                  { label: "Deadline urgent", desc: "Notifikasi WhatsApp untuk deadline ≤ 3 hari", defaultChecked: true },
                  { label: "Meeting reminder", desc: "Reminder 1 jam sebelum meeting", defaultChecked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-cygnus-accent" />
                  Telegram Notifications
                </h4>
                {[
                  { label: "Group notifications", desc: "Kirim notifikasi ke grup Telegram tim", defaultChecked: true },
                  { label: "Daily digest", desc: "Ringkasan harian aktivitas", defaultChecked: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Tersimpan" : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tema &amp; Tampilan</CardTitle>
              <CardDescription>Kustomisasi tampilan aplikasi CYGNUS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Tema</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      theme === "light" ? "border-cygnus-primary bg-cygnus-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <Sun className="h-8 w-8 text-amber-500" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      theme === "dark" ? "border-cygnus-primary bg-cygnus-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <Moon className="h-8 w-8 text-indigo-400" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      theme === "system" ? "border-cygnus-primary bg-cygnus-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <Monitor className="h-8 w-8 text-cygnus-secondary" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex gap-3">
                  {["#4F46E5", "#06B6D4", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444"].map((color) => (
                    <button
                      key={color}
                      className="h-10 w-10 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Bahasa</label>
                <div className="flex gap-2">
                  <Badge className="bg-cygnus-primary/20 text-cygnus-primary cursor-pointer">Bahasa Indonesia</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">English</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
              <CardDescription>Kelola keamanan dan privasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Ubah Password</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">Password Saat Ini</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Password Baru</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Konfirmasi Password Baru</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button size="sm">Update Password</Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Authenticator App</p>
                    <p className="text-xs text-muted-foreground">Gunakan Google Authenticator atau similar</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="text-sm font-medium">Sesi Aktif</h4>
                <div className="space-y-2">
                  {[
                    { device: "Chrome di Windows", location: "Surabaya, Indonesia", current: true },
                    { device: "Safari di iPhone", location: "Surabaya, Indonesia", current: false },
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{s.device}</p>
                        <p className="text-xs text-muted-foreground">{s.location}</p>
                      </div>
                      {s.current ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Aktif</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-500 text-xs">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
