"use client";

import { useState, useEffect, useCallback } from "react";
import { Competition } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

/**
 * Hook that manages competitions via Supabase API.
 * Replaces the old localStorage-based usePersistedCompetitions hook.
 */
export function useCompetitions() {
  const [competitions, setCompetitionsState] = useState<Competition[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from API on mount
  const fetchCompetitions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.competitions.list();
      // Parse dates from string
      const parsedData = restoreDates(data);
      setCompetitionsState(parsedData);
    } catch (error) {
      console.error("Failed to fetch competitions:", error);
      toast.error("Gagal memuat data kompetisi");
    } finally {
      setLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const addCompetition = async (compData: any) => {
    try {
      const newComp = await api.competitions.create(compData);
      const parsedComp = restoreDates(newComp);
      setCompetitionsState((prev) => [parsedComp, ...prev]);
      toast.success("Kompetisi berhasil ditambahkan");
      return parsedComp;
    } catch (error) {
      console.error("Failed to add competition:", error);
      toast.error("Gagal menambahkan kompetisi");
      throw error;
    }
  };

  const deleteCompetition = async (id: string) => {
    // Optimistic UI update
    const previous = [...competitions];
    setCompetitionsState((prev) => prev.filter((c) => c.id !== id));
    
    try {
      await api.competitions.delete(id);
      toast.success("Kompetisi berhasil dihapus");
    } catch (error) {
      console.error("Failed to delete competition:", error);
      toast.error("Gagal menghapus kompetisi");
      // Revert optimistic update
      setCompetitionsState(previous);
      throw error;
    }
  };

  const updateCompetition = async (updatedData: any) => {
    try {
      const updated = await api.competitions.update(updatedData.id, updatedData);
      const parsedUpdated = restoreDates(updated);
      setCompetitionsState((prev) => prev.map((c) => c.id === updated.id ? parsedUpdated : c));
      toast.success("Kompetisi berhasil diupdate");
      return parsedUpdated;
    } catch (error) {
      console.error("Failed to update competition:", error);
      toast.error("Gagal mengupdate kompetisi");
      throw error;
    }
  };

  return { 
    competitions, 
    loaded, 
    isLoading,
    refresh: fetchCompetitions,
    addCompetition, 
    deleteCompetition, 
    updateCompetition 
  };
}

/** Recursively restore Date fields from ISO strings */
function restoreDates(obj: any): any {
  if (Array.isArray(obj)) return obj.map(restoreDates);
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (
        typeof val === "string" &&
        /^\d{4}-\d{2}-\d{2}T/.test(val)
      ) {
        result[key] = new Date(val);
      } else {
        result[key] = restoreDates(val);
      }
    }
    return result;
  }
  return obj;
}
