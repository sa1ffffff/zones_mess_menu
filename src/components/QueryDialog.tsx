import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueryDialog({ open, onOpenChange }: QueryDialogProps) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function resetForm() {
    setName("");
    setDepartment("");
    setFeedback("");
    setSubmitted(false);
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department.trim() || !feedback.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("queries").insert({
      name: name.trim(),
      department: department.trim(),
      feedback: feedback.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit query", { description: error.message });
      return;
    }
    setSubmitted(true);
    toast.success("Query submitted successfully!");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="surface-card relative overflow-hidden p-6 sm:p-8">
              {/* Header glow strip */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 60%, transparent), transparent)",
                }}
              />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="focus-ring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4 py-8 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Query Submitted!</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Thank you for your feedback. The admin will review it shortly.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Title */}
                    <div className="pr-8">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                          <MessageSquarePlus className="h-4 w-4 text-accent" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight">Submit a Query</h2>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Share your feedback or suggestions with the mess management.
                      </p>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="query-name" className="text-sm font-medium">
                        Your Name
                      </label>
                      <input
                        id="query-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ali Hassan"
                        required
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    {/* Department */}
                    <div className="space-y-1.5">
                      <label htmlFor="query-department" className="text-sm font-medium">
                        Department
                      </label>
                      <input
                        id="query-department"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Engineering, Research, Operations"
                        required
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    {/* Feedback */}
                    <div className="space-y-1.5">
                      <label htmlFor="query-feedback" className="text-sm font-medium">
                        Feedback / Query
                      </label>
                      <textarea
                        id="query-feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts, suggestions, or concerns about the mess..."
                        required
                        rows={4}
                        className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      id="submit-query-btn"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Query
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
