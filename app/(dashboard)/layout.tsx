"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div
          className="min-h-screen flex flex-col transition-[margin-left] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        >
          <Header />
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 p-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </SessionProvider>
  );
}
