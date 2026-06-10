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

export async function fetchDinnersInRange(start: string, end: string) {
  const { data, error } = await supabase
    .from("dinners")
    .select("*")
    .gte("date", start)
    .lte("date", end);
  if (error) throw error;
  return (data ?? []) as Dinner[];
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
