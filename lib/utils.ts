import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getDaysRemaining(date: Date | string): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDeadlineColor(days: number): string {
  if (days < 0) return "text-red-500";
  if (days <= 3) return "text-red-400";
  if (days <= 7) return "text-yellow-400";
  return "text-emerald-400";
}

export function getDeadlineBadgeColor(days: number): string {
  if (days < 0) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (days <= 3) return "bg-red-500/15 text-red-400 border-red-500/25";
  if (days <= 7) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    MONITORING: "bg-slate-500/20 text-slate-400",
    REGISTRATION: "bg-blue-500/20 text-blue-400",
    SELECTION_PROPOSAL: "bg-purple-500/20 text-purple-400",
    SEMIFINAL: "bg-amber-500/20 text-amber-400",
    FINAL: "bg-orange-500/20 text-orange-400",
    FINISHED: "bg-gray-500/20 text-gray-400",
    WON: "bg-emerald-500/20 text-emerald-400",
    ELIMINATED: "bg-red-500/20 text-red-400",
    BACKLOG: "bg-slate-500/20 text-slate-400",
    TODO: "bg-blue-500/20 text-blue-400",
    IN_PROGRESS: "bg-amber-500/20 text-amber-400",
    REVIEW: "bg-purple-500/20 text-purple-400",
    DONE: "bg-emerald-500/20 text-emerald-400",
    LOW: "bg-slate-500/20 text-slate-400",
    MEDIUM: "bg-blue-500/20 text-blue-400",
    HIGH: "bg-amber-500/20 text-amber-400",
    CRITICAL: "bg-red-500/20 text-red-400",
  };
  return colors[status] || "bg-gray-500/20 text-gray-400";
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    HACKATHON: "Zap",
    CTF: "Shield",
    RESEARCH: "Microscope",
    PAPER_COMPETITION: "FileText",
    INNOVATION_COMPETITION: "Lightbulb",
    BUSINESS_CASE: "Briefcase",
    TECHNOLOGY_COMPETITION: "Cpu",
  };
  return icons[category] || "Trophy";
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    HACKATHON: "Hackathon",
    CTF: "Capture The Flag",
    RESEARCH: "Research",
    PAPER_COMPETITION: "Paper Competition",
    INNOVATION_COMPETITION: "Innovation",
    BUSINESS_CASE: "Business Case",
    TECHNOLOGY_COMPETITION: "Technology",
  };
  return labels[category] || category;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    REGIONAL: "Regional",
    NATIONAL: "Nasional",
    INTERNATIONAL: "Internasional",
  };
  return labels[level] || level;
}
