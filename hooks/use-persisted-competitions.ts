import { useState, useEffect } from "react";
import { mockCompetitions } from "@/lib/mock-data";
import { Competition } from "@/types";

const STORAGE_KEY = "cygnus_competitions";

/**
 * Hook that persists competitions to localStorage.
 * Falls back to mockCompetitions if localStorage is empty.
 */
export function usePersistedCompetitions() {
  const [competitions, setCompetitionsState] = useState<Competition[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Restore Date objects (JSON.parse converts them to strings)
        const restored = restoreDates(parsed);
        setCompetitionsState(restored);
      } else {
        // First time — seed with mock data and save
        const seed = mockCompetitions.map(deserialize);
        setCompetitionsState(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch {
      setCompetitionsState(mockCompetitions.map(deserialize));
    }
    setLoaded(true);
  }, []);

  // Setter that also writes to localStorage
  const setCompetitions = (updater: Competition[] | ((prev: Competition[]) => Competition[])) => {
    setCompetitionsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addCompetition = (comp: Competition) => {
    setCompetitions((prev) => [comp, ...prev]);
  };

  const deleteCompetition = (id: string) => {
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCompetition = (updated: Competition) => {
    setCompetitions((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  };

  return { competitions, setCompetitions, addCompetition, deleteCompetition, updateCompetition, loaded };
}

/** Recursively restore Date fields from ISO strings */
function restoreDates(obj: any): any {
  if (Array.isArray(obj)) return obj.map(restoreDates);
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      // Heuristic: keys that look like date fields
      if (
        typeof val === "string" &&
        /^\d{4}-\d{2}-\d{2}T/.test(val) &&
        (key.toLowerCase().includes("date") || key.toLowerCase().includes("at"))
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

/** Make a plain-object copy (for initial seeding) */
function deserialize(comp: any): any {
  return JSON.parse(JSON.stringify(comp, (_, v) =>
    v instanceof Date ? v.toISOString() : v
  ));
}
