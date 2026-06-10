import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DinnerCard } from "@/components/DinnerCard";
import { WeeklyView } from "@/components/WeeklyView";
import { cn } from "@/lib/utils";
import {
  fetchDinnersInRange,
  fetchRatingsInRange,
  groupRatingsByDate,
  indexByDate,
  summarize,
  type Dinner,
  type RatingSummary,
} from "@/lib/data";
import { formatLongDate, getWeekDates, todayISO } from "@/lib/date-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zones Dinner Menu" },
      {
        name: "description",
        content:
          "The Zones Islamabad dinner menu: see what's for dinner today, browse the week, and rate the meals.",
      },
      { property: "og:title", content: "Zones Dinner Menu" },
      {
        property: "og:description",
        content: "What's for dinner at Zones tonight. Browse and rate today's menu.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const today = todayISO();
  const week = useMemo(() => getWeekDates(today), [today]);
  const start = week[0];
  const end = week[6];

  const dinnersQ = useQuery({
    queryKey: ["dinners", start, end],
    queryFn: () => fetchDinnersInRange(start, end),
  });
  const ratingsQ = useQuery({
    queryKey: ["ratings", start, end],
    queryFn: () => fetchRatingsInRange(start, end),
  });

  const dinnersByDate: Record<string, Dinner | null> = useMemo(() => {
    const idx = indexByDate(dinnersQ.data ?? []);
    const out: Record<string, Dinner | null> = {};
    for (const d of week) out[d] = idx[d] ?? null;
    return out;
  }, [dinnersQ.data, week]);

  const summaries: Record<string, RatingSummary> = useMemo(() => {
    const grouped = groupRatingsByDate(ratingsQ.data ?? []);
    const out: Record<string, RatingSummary> = {};
    for (const d of week) out[d] = summarize(grouped[d] ?? []);
    return out;
  }, [ratingsQ.data, week]);

  const loading = dinnersQ.isLoading || ratingsQ.isLoading;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="ambient-glow" />
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tonight at Zones
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              {formatLongDate(today)}
            </span>
          </h1>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <ViewToggle value={view} onChange={setView} />
        </div>

        <div className="mt-10">
          {loading ? (
            <Skeleton view={view} />
          ) : (
            <AnimatePresence mode="wait">
              {view === "daily" ? (
                <motion.div
                  key="daily"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <DinnerCard
                    date={today}
                    dinner={dinnersByDate[today]}
                    summary={summaries[today]}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <WeeklyView
                    days={week}
                    dinners={dinnersByDate}
                    summaries={summaries}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: "daily" | "weekly";
  onChange: (v: "daily" | "weekly") => void;
}) {
  return (
    <div className="relative inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
      {(["daily", "weekly"] as const).map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "focus-ring relative z-10 rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="toggle-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {v}
          </button>
        );
      })}
    </div>
  );
}

function Skeleton({ view }: { view: "daily" | "weekly" }) {
  if (view === "daily") {
    return (
      <div className="surface-card animate-pulse p-10">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="mt-4 h-8 w-2/3 rounded bg-muted" />
        <div className="mt-3 h-4 w-40 rounded bg-muted" />
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/70" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="surface-card h-56 animate-pulse p-5">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="mt-2 h-5 w-24 rounded bg-muted" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full rounded bg-muted/70" />
            <div className="h-3 w-5/6 rounded bg-muted/70" />
            <div className="h-3 w-4/6 rounded bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
