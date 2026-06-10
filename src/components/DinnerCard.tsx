import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, UtensilsCrossed, Sparkles } from "lucide-react";
import { StarRow } from "./Stars";
import { Button } from "@/components/ui/button";
import { formatLongDate, todayISO } from "@/lib/date-utils";
import { RatingDialog } from "./RatingDialog";
import { RecentRatings } from "./RecentRatings";
import { cn } from "@/lib/utils";
import type { Dinner, RatingSummary } from "@/lib/data";

export function DinnerCard({
  date,
  dinner,
  summary,
}: {
  date: string;
  dinner: Dinner | null;
  summary: RatingSummary;
}) {
  const [open, setOpen] = useState(false);
  const isToday = date === todayISO();

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "surface-card relative overflow-hidden p-7 sm:p-10",
          isToday && "ring-1 ring-primary/25",
        )}
      >
        {isToday && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 60%, transparent), transparent)",
            }}
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="chip">
                <UtensilsCrossed className="h-3 w-3" />
                Dinner
              </span>
              {isToday && (
                <span className="chip-accent">
                  <Sparkles className="h-3 w-3" />
                  Today
                </span>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {formatLongDate(date)}
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {dinner ? `${dinner.time_start} – ${dinner.time_end}` : "7:30 PM – 9:00 PM"}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <StarRow value={summary.average} size={18} />
              <span className="text-lg font-semibold">{summary.average.toFixed(1)}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {summary.count} {summary.count === 1 ? "rating" : "ratings"}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {dinner && dinner.menu_items.length > 0 ? (
              <motion.ul
                key="items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-2 sm:grid-cols-2"
              >
                {dinner.menu_items.map((item, i) => (
                  <motion.li
                    key={item + i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <EmptyMenu />
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <RecentRatings date={date} />
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            disabled={!dinner}
            className="rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-primary/90"
          >
            Rate dinner
          </Button>
        </div>
      </motion.section>

      <RatingDialog open={open} onOpenChange={setOpen} date={date} />
    </>
  );
}

function EmptyMenu() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center"
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">Menu not available for this day</p>
      <p className="mt-1 text-xs text-muted-foreground">Check back soon — admin hasn't uploaded it yet.</p>
    </motion.div>
  );
}
