import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Utensils, Leaf, Heart } from "lucide-react";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("hasSeenWelcomeModal");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("hasSeenWelcomeModal", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="overflow-hidden rounded-3xl border border-border/30 bg-background/95 p-0 backdrop-blur-2xl shadow-2xl sm:max-w-[460px]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/15 via-primary/10 to-teal-500/15 px-6 pt-7 pb-5 text-center border-b border-border/40">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
          >
            <Utensils className="h-7 w-7" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-500">
              <Leaf className="h-3.5 w-3.5" />
              <span>A Note Before You Dig In</span>
            </div>

            <DialogTitle className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground">
              Eat Smart. Waste Less. 🍽️
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs font-medium text-muted-foreground">
              A quick word from the Zones Mess team.
            </DialogDescription>
          </motion.div>
        </div>

        {/* Content Body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="p-6 space-y-4 text-sm"
        >
          {/* Main Message */}
          <div className="rounded-2xl bg-muted/50 p-4 border border-border/50 space-y-3">
            <p className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-emerald-500 shrink-0" />
              Welcome to the Zones Mess Menu!
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We work hard to put good food on your plate every day. All we ask is one simple thing:{" "}
              <strong className="text-foreground">only take what you'll actually eat.</strong>
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Food waste is a real problem — and honestly, the biryani deserves better than ending up in the bin. 🍛 Your plate isn't a buffet strategy; it's a commitment.
            </p>
            <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-3 py-2.5">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed">
                💡 Pro tip: Start with less, go back for more. The food isn't going anywhere — unless you waste it, in which case, it is. Into the trash. Sadly.
              </p>
            </div>
          </div>

          {/* Stats / Reminder Row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { emoji: "🥗", label: "Take only", sub: "what you need" },
              { emoji: "♻️", label: "Reduce", sub: "food waste" },
              { emoji: "😌", label: "Leave room", sub: "for seconds" },
            ].map(({ emoji, label, sub }) => (
              <div
                key={label}
                className="rounded-xl bg-muted/40 border border-border/50 px-2 py-3 space-y-0.5"
              >
                <div className="text-xl">{emoji}</div>
                <div className="text-[11px] font-semibold text-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            id="welcome-dialog-continue-btn"
            onClick={handleClose}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs hover:opacity-90 shadow-md shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Got It — Let's See the Menu! 🍴
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
