"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Command,
  X,
  Trophy,
  CheckSquare,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockCompetitions, mockUsers } from "@/lib/mock-data";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications = [
    { id: 1, title: "Deadline mendekat", message: "Final Submission - Hackathon AI Indonesia tinggal 3 hari", time: "2 jam yang lalu", type: "deadline" },
    { id: 2, title: "Task selesai", message: "Diana menyelesaikan 'Practice Web Exploitation'", time: "5 jam yang lalu", type: "task" },
    { id: 3, title: "Kompetisi baru", message: "Business Case Competition Unair 2026 ditambahkan", time: "1 hari yang lalu", type: "competition" },
  ];

  const allTasks = mockCompetitions.flatMap((c) => c.tasks);
  const searchResults = searchQuery.length > 1
    ? [
        ...mockCompetitions.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => ({ type: "competition", title: c.name, subtitle: c.organizer, id: c.id })),
        ...allTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ type: "task", title: t.title, subtitle: t.status, id: t.id })),
        ...mockUsers.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => ({ type: "member", title: u.name || "", subtitle: u.role, id: u.id })),
      ]
    : [];

  const typeIcon: Record<string, typeof Trophy> = {
    competition: Trophy,
    task: CheckSquare,
    member: User,
  };

  const typeColor: Record<string, string> = {
    competition: "bg-cygnus-primary/15 text-cygnus-primary",
    task: "bg-cygnus-secondary/15 text-cygnus-secondary",
    member: "bg-cygnus-accent/15 text-cygnus-accent",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6">

      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search competitions, tasks, members..."
            className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-16 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(e.target.value.length > 0);
            }}
            onFocus={() => searchQuery.length > 0 && setSearchOpen(true)}
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-popover shadow-2xl shadow-black/20 overflow-hidden z-50"
            >
              {searchResults.length > 0 ? (
                <div className="max-h-72 overflow-auto py-2">
                  {searchResults.map((result, idx) => {
                    const Icon = typeIcon[result.type] ?? User;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", typeColor[result.type])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
              {notifications.length}
            </span>
          </Button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-2xl shadow-black/20 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{notifications.length} new</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNotificationsOpen(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors">
                      <div className={cn(
                        "mt-1 h-2 w-2 rounded-full shrink-0",
                        notif.type === "deadline" && "bg-red-500",
                        notif.type === "task" && "bg-blue-500",
                        notif.type === "competition" && "bg-emerald-500",
                      )} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <AnimatePresence mode="wait">
            {!mounted ? (
              <motion.div key="placeholder">
                <Moon className="h-[18px] w-[18px]" />
              </motion.div>
            ) : theme === "dark" ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-[18px] w-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-[18px] w-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </header>
  );
}


