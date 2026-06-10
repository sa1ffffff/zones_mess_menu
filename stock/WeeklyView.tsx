import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, UtensilsCrossed } from "lucide-react";
import { StarRow } from "./Stars";
import { RatingDialog } from "./RatingDialog";
import { formatShortDate, todayISO, weekdayName } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Dinner, RatingSummary } from "@/lib/data";

export function WeeklyView({
  days,
  dinners,
  summaries,
}: {
  days: string[];
  dinners: Record<string, Dinner | null>;
  summaries: Record<string, RatingSummary>;
}) {
  const [activeDate, setActiveDate] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((date, i) => {
          const dinner = dinners[date] ?? null;
          const summary = summaries[date] ?? { average: 0, count: 0 };
          const isToday = date === todayISO();
          return (
            <motion.button
              type="button"
              key={date}
              onClick={() => dinner && setActiveDate(date)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-card surface-card-hover focus-ring group relative text-left p-5",
                isToday && "ring-1 ring-primary/30",
                !dinner && "cursor-default opacity-90",
              )}
            >
              {isToday && (
                <span className="chip-accent absolute right-4 top-4">Today</span>
              )}
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {weekdayName(date)}
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {formatShortDate(date)}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {dinner ? `${dinner.time_start} – ${dinner.time_end}` : "—"}
              </div>

              <div className="mt-5 min-h-[80px]">
                {dinner && dinner.menu_items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {dinner.menu_items.slice(0, 4).map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                    {dinner.menu_items.length > 4 && (
                      <li className="pl-3 text-xs text-muted-foreground">
                        +{dinner.menu_items.length - 4} more
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="flex h-full flex-col items-start justify-center text-xs text-muted-foreground">
                    <UtensilsCrossed className="mb-1 h-4 w-4 opacity-50" />
                    Menu not available
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                <StarRow value={summary.average} size={14} />
                <div className="text-xs text-muted-foreground">
                  {summary.count > 0 ? (
                    <>
                      <span className="font-semibold text-foreground">
                        {summary.average.toFixed(1)}
                      </span>{" "}
                      · {summary.count}
                    </>
                  ) : (
                    "No ratings yet"
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <RatingDialog
        open={!!activeDate}
        onOpenChange={(o) => !o && setActiveDate(null)}
        date={activeDate || todayISO()}
      />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Need to upload the next week's menu?{" "}
        <Link to="/admin" className="underline-offset-2 hover:underline">
          Open admin
        </Link>
      </p>
    </>
  );
}
