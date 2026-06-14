"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/* ─── Floating particle ─────────────────────── */
function Particle({ x, y, size, delay, duration }: any) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(79,70,229,0.6), rgba(139,92,246,0.2))`,
        filter: "blur(1px)",
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 3,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 4,
}));

/* ─── Grid lines ────────────────────────────── */
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

/* ─── Scanning line ─────────────────────────── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(139,92,246,0.6), transparent)",
        boxShadow: "0 0 12px rgba(99,102,241,0.4)",
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (result?.error) {
        toast.error("Login gagal. Periksa kembali email dan password Anda.");
      } else {
        toast.success("Login berhasil! Selamat datang 🚀");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050510]">

      {/* ── Deep space gradient background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[130px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[25%] h-[25%] rounded-full bg-purple-600/15 blur-[90px]" />
      </div>

      {/* ── Grid + scan line ── */}
      <GridLines />
      {mounted && <ScanLine />}

      {/* ── Floating particles ── */}
      {mounted && PARTICLES.map((p) => <Particle key={p.id} {...p} />)}

      {/* ── Orbiting ring ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[600px] h-[600px] rounded-full border border-indigo-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-400"
            style={{ boxShadow: "0 0 12px rgba(99,102,241,0.8)" }}
          />
        </motion.div>
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full border border-violet-500/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-violet-400"
            style={{ boxShadow: "0 0 10px rgba(139,92,246,0.8)" }}
          />
        </motion.div>
      </div>

      {/* ── Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-3xl bg-indigo-600/20 blur-2xl scale-105 pointer-events-none" />

        <div
          className="relative rounded-3xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(10, 10, 30, 0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.5), 0 0 80px rgba(79,70,229,0.15)",
          }}
        >
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

          <div className="p-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 blur-xl scale-150" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-xl">
                  <Zap className="h-8 w-8 text-white drop-shadow" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Cygnus
                <span className="ml-1.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  CCMS
                </span>
              </h1>
              <p className="text-sm text-white/40 mt-1 tracking-widest uppercase text-[11px]">
                Competition Management System
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</label>
                <div
                  className="relative rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: focused === "email" ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
                    border: focused === "email"
                      ? "1px solid rgba(99,102,241,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: focused === "email" ? "0 0 20px rgba(99,102,241,0.15)" : "none",
                  }}
                >
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
                <div
                  className="relative rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: focused === "password" ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
                    border: focused === "password"
                      ? "1px solid rgba(99,102,241,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: focused === "password" ? "0 0 20px rgba(99,102,241,0.15)" : "none",
                  }}
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className="w-full bg-transparent pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-white/20 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="relative w-full mt-2 py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED, #06B6D4)",
                  boxShadow: "0 4px 24px rgba(79,70,229,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Masuk ke Sistem
                    </>
                  )}
                </span>
              </motion.button>
            </motion.form>

            {/* Footer hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-white/25">
                © 2024 Cygnus Team · Powered by Joke
              </p>
            </motion.div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-500/60 rounded-br-sm pointer-events-none" />
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-widest"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        System Online
        <span className="text-white/10">·</span>
        Secure Connection
        <span className="text-white/10">·</span>
        v2.0
      </motion.div>
    </div>
  );
}
