import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { UtensilsCrossed, MoonStar, Calendar } from "lucide-react";
import { StarRow } from "./Stars";
import { RatingDialog } from "./RatingDialog";
import { formatShortDate, todayISO, weekdayName, getMonthName } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Dinner, RatingSummary } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

/** Group an array of ISO date strings into week rows (Mon–Sun) */
function groupIntoWeeks(dates: string[]): string[][] {
  if (dates.length === 0) return [];

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // Pad the beginning of the first week
  const firstDate = dates[0];
  const [fy, fm, fd] = firstDate.split("-").map(Number);
  const firstDow = new Date(fy, fm - 1, fd).getDay(); // 0=Sun
  const offsetFromMon = (firstDow + 6) % 7; // Mon=0
  for (let i = 0; i < offsetFromMon; i++) {
    currentWeek.push(""); // empty placeholder
  }

  for (const date of dates) {
    const [y, m, d] = date.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    const dayIdx = (dow + 6) % 7; // Mon=0 .. Sun=6

    if (dayIdx === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }

  // Pad the end of the last week
  while (currentWeek.length < 7) {
    currentWeek.push("");
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
}

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthlyView({
  days,
  dinners,
  summaries,
  monthLabel,
}: {
  days: string[];
  dinners: Record<string, Dinner | null>;
  summaries: Record<string, RatingSummary>;
  monthLabel: string;
}) {
  const { user } = useAuth();
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

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
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const weeks = groupIntoWeeks(days);
  const today = todayISO();

  return (
    <>
      {/* Month Label */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-center gap-2"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {monthLabel}
        </span>
      </motion.div>

      {/* Weekday Headers */}
      <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-[10px] font-semibold uppercase tracking-widest",
              day === "Sat" || day === "Sun"
                ? "text-muted-foreground/50"
                : "text-muted-foreground",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1.5 sm:space-y-2">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {week.map((date, dayIdx) => {
              if (!date) {
                // Empty placeholder for padding
                return <div key={`empty-${weekIdx}-${dayIdx}`} className="min-h-[100px] sm:min-h-[120px]" />;
              }

              const dayName = weekdayName(date);
              const isWeekend = dayName === "Saturday" || dayName === "Sunday";
              const dinner = dinners[date] ?? null;
              const summary = summaries[date] ?? { average: 0, count: 0 };
              const isToday = date === today;
              const isPast = date < today;
              const dayNum = parseInt(date.split("-")[2], 10);
              const isExpanded = expandedDate === date;

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: (weekIdx * 7 + dayIdx) * 0.012,
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => !isWeekend && handleDayClick(date, !!dinner)}
                  className={cn(
                    "group relative flex min-h-[100px] flex-col rounded-xl border p-2 text-left transition-all duration-200 sm:min-h-[120px] sm:rounded-2xl sm:p-3",
                    isWeekend
                      ? "border-dashed border-border/40 bg-muted/20 cursor-default opacity-60"
                      : dinner
                        ? "surface-card cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
                        : "border-border/50 bg-card/50 cursor-default opacity-80",
                    isToday && "ring-2 ring-primary/30 border-primary/20 bg-primary/[0.04]",
                    isPast && !isWeekend && !isToday && "opacity-65",
                  )}
                >
                  {/* Day number + Today badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : isWeekend
                            ? "text-muted-foreground/60"
                            : "text-foreground",
                      )}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="hidden text-[9px] font-bold uppercase tracking-wider text-primary sm:inline">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-1.5 flex-1 sm:mt-2">
                    {isWeekend ? (
                      <div className="flex flex-col items-center justify-center py-2 text-center">
                        <MoonStar className="h-3.5 w-3.5 text-muted-foreground/40 sm:h-4 sm:w-4" />
                        <span className="mt-1 text-[9px] font-medium text-muted-foreground/50 sm:text-[10px]">
                          Off
                        </span>
                      </div>
                    ) : dinner && dinner.menu_items.length > 0 ? (
                      <ul className="space-y-0.5">
                        {dinner.menu_items
                          .slice(0, isExpanded ? undefined : 2)
                          .map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1 text-[10px] leading-tight text-foreground/90 sm:text-xs"
                            >
                              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                              <span className={cn(!isExpanded && "line-clamp-1")}>
                                {item}
                              </span>
                            </li>
                          ))}
                        {dinner.menu_items.length > 2 && (
                          <li>
                            <button
                              type="button"
                              onClick={(e) => toggleExpand(e, date)}
                              className="mt-0.5 pl-2 text-[9px] font-medium text-primary hover:underline focus:outline-none cursor-pointer sm:text-[10px]"
                            >
                              {isExpanded
                                ? "Less"
                                : `+${dinner.menu_items.length - 2}`}
                            </button>
                          </li>
                        )}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-center">
                        <UtensilsCrossed className="h-3 w-3 text-muted-foreground/40" />
                        <span className="mt-0.5 text-[8px] text-muted-foreground/50 sm:text-[9px]">
                          No menu
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating footer — only for non-weekend days with dinners */}
                  {!isWeekend && dinner && (
                    <div className="mt-auto border-t border-border/40 pt-1.5">
                      <div className="flex items-center gap-1">
                        <StarRow value={summary.average} size={10} />
                        {summary.count > 0 && (
                          <span className="text-[8px] text-muted-foreground sm:text-[9px]">
                            {summary.average.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <RatingDialog
        open={!!activeDate}
        onOpenChange={(o) => !o && setActiveDate(null)}
        date={activeDate || todayISO()}
      />
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Need to upload the next month's menu?{" "}
        <Link to="/admin" className="underline-offset-2 hover:underline">
          Open admin
        </Link>
      </p>
    </>
  );
}
