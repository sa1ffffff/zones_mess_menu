import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Award, UserX, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchShameEntries, addShameEntry, deleteShameEntry, type ShameEntry } from "@/lib/data";
import { toast } from "sonner";

export function HallOfShameDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.email === "saifullahwasim1@gmail.com";

  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<ShameEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (isOpen) {
      loadEntries();
    }
  }, [isOpen]);

  async function loadEntries() {
    setLoading(true);
    const data = await fetchShameEntries();
    setEntries(data);
    setLoading(false);
  }

  const handleClose = () => {
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !reason.trim()) {
      toast.error("Please enter a name and reason");
      return;
    }
    setSubmitting(true);
    try {
      const added = await addShameEntry(name, reason);
      setEntries((prev) => [added, ...prev]);
      setName("");
      setReason("");
      setShowAddForm(false);
      toast.success(`${added.name} added to the Hall of Shame 📸`);
    } catch {
      toast.error("Failed to add person");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEntry(id: string, entryName: string) {
    try {
      await deleteShameEntry(id);
      setEntries((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Removed ${entryName} from Hall of Shame`);
    } catch {
      toast.error("Failed to remove entry");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-accent/20 bg-background/95 p-0 backdrop-blur-2xl shadow-2xl sm:max-w-[480px]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 px-6 pt-6 pb-5 text-center border-b border-border/50">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-28 w-60 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white shadow-lg shadow-accent/25"
          >
            <Award className="h-6 w-6" />
          </motion.div>

          <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-widest text-accent">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Line Etiquette</span>
          </div>

          <DialogTitle className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
            The Hall of Shame 🏆
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs font-medium text-muted-foreground">
            Line jumpers will be featured here for public appreciation.
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Natural, Brief, Human Copy */}
          <div className="rounded-2xl bg-muted/50 p-4 border border-border/60 space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
              Quick heads up 👋
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We're officially opening the <strong className="text-foreground">Zones Hall of Shame</strong>. If you skip the queue or use <em className="text-foreground font-medium">"I'm just grabbing water"</em> to sneak ahead, your name goes right on this wall.
            </p>
            <p className="text-xs text-accent font-medium pt-1">
              Please don't break the line. Wait your turn like everyone else 😉
            </p>
          </div>

          {/* Hall of Shame Entries Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UserX className="h-3.5 w-3.5 text-accent" />
                Current Wall of Fame ({entries.length})
              </span>
              {isAdmin && !showAddForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(true)}
                  className="h-7 text-xs rounded-full border-accent/40 text-accent hover:bg-accent/10 gap-1 px-3"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Person
                </Button>
              )}
            </div>

            {/* Admin Add Person Form */}
            {isAdmin && showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddEntry}
                className="rounded-2xl border border-accent/30 bg-accent/5 p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent">Admin: Add Person</span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Person's Name (e.g. John Doe)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  type="text"
                  placeholder="Offense / Reason (e.g. Cut 6 people for biryani)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-8 text-xs rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent/90"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add to Hall of Shame"}
                </Button>
              </motion.form>
            )}

            {/* List of Entries */}
            {loading ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading entries...
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No one in the Hall of Shame yet! Keep it that way by waiting in line. 🎉
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group relative flex items-start justify-between rounded-xl border border-border/70 bg-card p-3 shadow-sm hover:border-accent/30 transition-all"
                  >
                    <div className="space-y-0.5 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">{entry.name}</span>
                        <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{entry.reason}"</p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEntry(entry.id, entry.name)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              id="continue-to-site-btn"
              onClick={handleClose}
              className="w-full h-11 rounded-xl bg-accent text-accent-foreground font-semibold text-xs hover:bg-accent/90 shadow-md shadow-accent/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Got It, Take Me to the Menu ➡️
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
