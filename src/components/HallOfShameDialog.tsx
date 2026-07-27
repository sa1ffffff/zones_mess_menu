import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, ShieldAlert, Sparkles, Utensils, Award } from "lucide-react";

export function HallOfShameDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show automatically on site visit unless explicitly controlled by props
    if (open !== undefined) {
      setIsOpen(open);
      return;
    }

    const hasSeen = sessionStorage.getItem("hasSeenHallOfShameModal");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [open]);

  const handleClose = () => {
    sessionStorage.setItem("hasSeenHallOfShameModal", "true");
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      sessionStorage.setItem("hasSeenHallOfShameModal", "true");
    }
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-accent/20 bg-background/95 p-0 backdrop-blur-2xl shadow-2xl sm:max-w-[460px]">
        {/* Decorative ambient top banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 px-6 pt-7 pb-6 text-center border-b border-border/50">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-64 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white shadow-lg shadow-accent/25"
          >
            <Award className="h-7 w-7" />
          </motion.div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Official Mess Announcement</span>
            <Flame className="h-3.5 w-3.5" />
          </div>

          <DialogTitle className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
            The Hall of Shame 🏆
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs font-medium text-muted-foreground">
            A tiny PSA regarding line etiquette & hungry bellies
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm leading-relaxed text-foreground/90">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="space-y-3"
          >
            <p className="font-semibold text-foreground">
              Greetings, hungry human! 👋
            </p>
            <p className="text-muted-foreground">
              We are excited (and slightly mischievous) to announce our upcoming feature: <strong className="text-foreground font-semibold">The Mess Hall of Shame</strong>! 📸✨
            </p>
            <p className="text-muted-foreground">
              Starting soon, anyone caught executing stealth queue jumps, "I'm just asking a quick question" cuts, or line-breaking wizardry will earn an exclusive VIP spot on our wall of fame.
            </p>
          </motion.div>

          {/* Sarcastic Callout Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="rounded-2xl border border-accent/20 bg-accent/5 p-3.5 text-xs text-foreground/80 flex items-start gap-3"
          >
            <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-accent">Friendly Reminder:</span> Please wait your turn in line. Food tastes 20% better when earned with patience! 😉
            </div>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="pt-2"
          >
            <Button
              id="continue-to-site-btn"
              onClick={handleClose}
              className="w-full h-12 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 shadow-md shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Utensils className="h-4 w-4" />
              I Promise to Wait My Turn — Take Me to Food!
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
