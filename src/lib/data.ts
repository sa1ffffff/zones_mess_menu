import { supabase } from "@/integrations/supabase/client";

export type Dinner = {
  id: string;
  date: string;
  time_start: string;
  time_end: string;
  menu_items: string[];
};

export type Rating = {
  id: string;
  date: string;
  user_id: string;
  user_name: string;
  user_email: string;
  stars: number;
  created_at: string;
};

export type RatingSummary = { average: number; count: number };

import { HARDCODED_DINNERS } from "./menu-data";

export async function fetchDinnersInRange(start: string, end: string) {
  // Try Supabase first; fall back to hardcoded data on error or empty result
  try {
    const { data, error } = await supabase
      .from("dinners")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true });
    if (!error && data && data.length > 0) {
      return data as Dinner[];
    }
  } catch {
    // Supabase unavailable — fall back silently
  }
  return HARDCODED_DINNERS.filter((d) => d.date >= start && d.date <= end);
}

export async function fetchRatingsInRange(start: string, end: string) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Rating[];
}

export function summarize(ratings: Rating[]): RatingSummary {
  if (ratings.length === 0) return { average: 0, count: 0 };
  const sum = ratings.reduce((a, r) => a + r.stars, 0);
  return { average: sum / ratings.length, count: ratings.length };
}

export function indexByDate<T extends { date: string }>(rows: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const r of rows) out[r.date] = r;
  return out;
}

export function groupRatingsByDate(rows: Rating[]): Record<string, Rating[]> {
  const out: Record<string, Rating[]> = {};
  for (const r of rows) {
    (out[r.date] ||= []).push(r);
  }
  return out;
}

export type ShameEntry = {
  id: string;
  name: string;
  reason: string;
  date: string;
  created_at: string;
};

const DEFAULT_SHAME_ENTRIES: ShameEntry[] = [
  {
    id: "sample-1",
    name: "Tactical Water Guy",
    reason: "Claimed he was 'just getting a napkin' and took a full plate of biryani",
    date: "2026-07-26",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    name: "The Chatty Cutter",
    reason: "Distracted the front of the line with a story to slide right in",
    date: "2026-07-25",
    created_at: new Date().toISOString(),
  },
];

export async function fetchShameEntries(): Promise<ShameEntry[]> {
  try {
    const { data, error } = await supabase
      .from("hall_of_shame")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return data as ShameEntry[];
    }
  } catch {}

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("zones_hall_of_shame_list");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
  }
  return DEFAULT_SHAME_ENTRIES;
}

export async function addShameEntry(name: string, reason: string): Promise<ShameEntry> {
  const newEntry: ShameEntry = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: name.trim(),
    reason: reason.trim(),
    date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("hall_of_shame")
      .insert([newEntry])
      .select()
      .single();
    if (!error && data) {
      return data as ShameEntry;
    }
  } catch {}

  const current = await fetchShameEntries();
  const updated = [newEntry, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem("zones_hall_of_shame_list", JSON.stringify(updated));
  }
  return newEntry;
}

export async function deleteShameEntry(id: string): Promise<void> {
  try {
    await supabase.from("hall_of_shame").delete().eq("id", id);
  } catch {}

  const current = await fetchShameEntries();
  const updated = current.filter((e) => e.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem("zones_hall_of_shame_list", JSON.stringify(updated));
  }
}
