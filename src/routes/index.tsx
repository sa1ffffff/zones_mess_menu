import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DinnerCard } from "@/components/DinnerCard";
import { WeeklyView } from "@/components/WeeklyView";
import { MonthlyView } from "@/components/MonthlyView";
import { QueryDialog } from "@/components/QueryDialog";
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
import {
  formatLongDate,
  getWeekDates,
  getMonthDates,
  getMonthName,
  getMonthStartEnd,
  todayISO,
} from "@/lib/date-utils";
import { MessageSquarePlus, CalendarDays, CalendarRange, Clock } from "lucide-react";

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

type ViewMode = "daily" | "weekly" | "monthly";

function HomePage() {
  const [view, setView] = useState<ViewMode>("daily");
  const [queryOpen, setQueryOpen] = useState(false);
  const today = todayISO();
  const week = useMemo(() => getWeekDates(today), [today]);
  const monthDates = useMemo(() => getMonthDates(today), [today]);
  const monthLabel = useMemo(() => getMonthName(today), [today]);
  const monthRange = useMemo(() => getMonthStartEnd(today), [today]);

  // For daily & weekly we fetch the week range; for monthly the entire month
  const start = view === "monthly" ? monthRange.start : week[0];
  const end = view === "monthly" ? monthRange.end : week[6];

  const dinnersQ = useQuery({
    queryKey: ["dinners", start, end],
    queryFn: () => fetchDinnersInRange(start, end),
  });
  const ratingsQ = useQuery({
    queryKey: ["ratings", start, end],
    queryFn: () => fetchRatingsInRange(start, end),
  });

  const activeDays = view === "monthly" ? monthDates : week;

  const dinnersByDate: Record<string, Dinner | null> = useMemo(() => {
    const idx = indexByDate(dinnersQ.data ?? []);
    const out: Record<string, Dinner | null> = {};
    for (const d of activeDays) out[d] = idx[d] ?? null;
    return out;
  }, [dinnersQ.data, activeDays]);

  const summaries: Record<string, RatingSummary> = useMemo(() => {
    const grouped = groupRatingsByDate(ratingsQ.data ?? []);
    const out: Record<string, RatingSummary> = {};
    for (const d of activeDays) out[d] = summarize(grouped[d] ?? []);
    return out;
  }, [ratingsQ.data, activeDays]);

  const loading = dinnersQ.isLoading || ratingsQ.isLoading;

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col">
      <div className="ambient-glow" />
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
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
              ) : view === "weekly" ? (
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
              ) : (
                <motion.div
                  key="monthly"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <MonthlyView
                    days={monthDates}
                    dinners={dinnersByDate}
                    summaries={summaries}
                    monthLabel={monthLabel}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Floating Submit Query Button */}
      <div className="fixed bottom-8 right-6 z-40 sm:bottom-10 sm:right-8">
        <motion.button
          id="open-query-dialog-btn"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setQueryOpen(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_8px_28px_-6px_oklch(from_var(--accent)_l_c_h_/_0.4)] transition-shadow hover:shadow-[0_8px_36px_-4px_oklch(from_var(--accent)_l_c_h_/_0.55)]"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Submit a Query
        </motion.button>
      </div>

      <QueryDialog open={queryOpen} onOpenChange={setQueryOpen} />
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const icons: Record<ViewMode, React.ReactNode> = {
    daily: <Clock className="h-3.5 w-3.5" />,
    weekly: <CalendarDays className="h-3.5 w-3.5" />,
    monthly: <CalendarRange className="h-3.5 w-3.5" />,
  };

  return (
    <div className="relative inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
      {(["daily", "weekly", "monthly"] as const).map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "focus-ring relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors sm:px-5",
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
            {icons[v]}
            {v}
          </button>
        );
      })}
    </div>
  );
}

function Skeleton({ view }: { view: ViewMode }) {
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
  if (view === "weekly") {
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
  // Monthly skeleton
  return (
    <div className="space-y-2">
      <div className="mb-4 flex justify-center">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-muted/50" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }).map((_, dayIdx) => (
            <div
              key={dayIdx}
              className="min-h-[100px] animate-pulse rounded-xl border border-border/30 bg-muted/20 p-2 sm:min-h-[120px] sm:rounded-2xl"
            >
              <div className="h-6 w-6 rounded-full bg-muted/40" />
              <div className="mt-3 space-y-1">
                <div className="h-2 w-full rounded bg-muted/30" />
                <div className="h-2 w-3/4 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
