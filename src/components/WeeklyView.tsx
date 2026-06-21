import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, MoonStar } from "lucide-react";
import { StarRow } from "./Stars";
import { RatingDialog } from "./RatingDialog";
import { formatShortDate, todayISO, weekdayName } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Dinner, RatingSummary } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function WeeklyView({
  days,
  dinners,
  summaries,
}: {
  days: string[];
  dinners: Record<string, Dinner | null>;
  summaries: Record<string, RatingSummary>;
}) {
  const { user } = useAuth();
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const handleDayClick = (date: string, hasDinner: boolean) => {
    if (!hasDinner) return;
    if (!user) {
      toast.error("You need to sign in to be able to rate");
      return;
    }
    setActiveDate(date);
  };

  const toggleExpand = (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((date, i) => {
          const dayName = weekdayName(date);
          const isWeekend = dayName === "Saturday" || dayName === "Sunday";
          const dinner = dinners[date] ?? null;
          const summary = summaries[date] ?? { average: 0, count: 0 };
          const isToday = date === todayISO();
          const isExpanded = !!expandedDates[date];

          /* ── Weekend "Off" card ── */
          if (isWeekend) {
            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "surface-card relative text-left p-5 cursor-default opacity-60",
                  "border border-dashed border-border/50",
                  isToday && "ring-1 ring-primary/20",
                )}
              >
                {isToday && (
                  <span className="chip-accent absolute right-4 top-4">Today</span>
                )}
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {dayName}
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-muted-foreground/80">
                  {formatShortDate(date)}
                </div>

                <div className="mt-5 flex min-h-[80px] flex-col items-center justify-center text-center">
                  <MoonStar className="mb-2 h-6 w-6 text-muted-foreground/50" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Day Off
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground/60">
                    No dinner service
                  </span>
                </div>

                <div className="mt-5 border-t border-border/40 pt-4">
                  <span className="text-xs text-muted-foreground/50">
                    Mess is closed on weekends
                  </span>
                </div>
              </motion.div>
            );
          }

          /* ── Regular weekday card ── */
          return (
            <motion.div
              key={date}
              onClick={() => handleDayClick(date, !!dinner)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-card surface-card-hover focus-ring group relative text-left p-5 cursor-pointer",
                isToday && "ring-1 ring-primary/30",
                !dinner && "cursor-default opacity-90",
              )}
            >
              {isToday && (
                <span className="chip-accent absolute right-4 top-4">Today</span>
              )}
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {dayName}
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {formatShortDate(date)}
              </div>


              <div className="mt-5 min-h-[80px]">
                {dinner && dinner.menu_items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {dinner.menu_items
                      .slice(0, isExpanded ? undefined : 4)
                      .map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                          <span className={cn(!isExpanded && "line-clamp-1")}>{item}</span>
                        </li>
                      ))}
                    {dinner.menu_items.length > 4 && (
                      <li>
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(e, date)}
                          className="pl-3 text-xs text-primary font-medium hover:underline focus:outline-none cursor-pointer"
                        >
                          {isExpanded ? "Show less" : `+${dinner.menu_items.length - 4} more`}
                        </button>
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
            </motion.div>
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
