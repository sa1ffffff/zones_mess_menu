import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarPicker } from "./Stars";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle, signInWithMicrosoft, useAuth, userDisplayName } from "@/lib/auth";
import { formatLongDate } from "@/lib/date-utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function RatingDialog({
  open,
  onOpenChange,
  date,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  date: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [stars, setStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const { data: existing } = useQuery({
    enabled: !!user && open,
    queryKey: ["my-rating", date, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("date", date)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existing) setStars(existing.stars);
    else if (open) setStars(0);
  }, [existing, open]);

  async function handleSubmit() {
    if (!user || stars < 1) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("ratings")
      .upsert(
        {
          date,
          user_id: user.id,
          user_name: userDisplayName(user),
          user_email: user.email ?? "",
          stars,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "date,user_id" },
      );
    setSubmitting(false);
    if (error) {
      toast.error("Could not save rating", { description: error.message });
      return;
    }
    toast.success(existing ? "Rating updated" : "Thanks for rating!");
    qc.invalidateQueries({ queryKey: ["ratings"] });
    qc.invalidateQueries({ queryKey: ["ratings", date] });
    qc.invalidateQueries({ queryKey: ["my-rating", date, user.id] });
    onOpenChange(false);
  }

  async function handleSignInGoogle() {
    setSigningIn(true);
    const res = await signInWithGoogle();
    setSigningIn(false);
    if (res?.error) toast.error("Sign-in failed");
  }

  async function handleSignInMicrosoft() {
    setSigningIn(true);
    const res = await signInWithMicrosoft();
    setSigningIn(false);
    if (res?.error) toast.error("Sign-in failed");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border bg-card p-7 sm:max-w-md">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Rate dinner
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {formatLongDate(date)}
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-col items-center gap-3 py-4 text-center"
          >
            <p className="text-sm text-muted-foreground pb-2">
              Sign in to submit a rating.
            </p>
            <Button
              onClick={handleSignInGoogle}
              disabled={signingIn}
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              {signingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
            <Button
              onClick={handleSignInMicrosoft}
              disabled={signingIn}
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              {signingIn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MicrosoftIcon className="mr-2 h-4 w-4" />
              )}
              Continue with Microsoft
            </Button>
          </motion.div>
        ) : (
          <div className="mt-2 flex flex-col items-center gap-6 py-4">
            <StarPicker value={stars} onChange={setStars} />
            <Button
              onClick={handleSubmit}
              disabled={stars < 1 || submitting}
              size="lg"
              className="w-full rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {existing ? "Update rating" : "Submit rating"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Signed in as {userDisplayName(user)}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.737 2.986-4.296 2.986-7.351Z"
      />
      <path
        fill="#fff"
        opacity=".85"
        d="M12 22c2.7 0 4.964-.896 6.618-2.422l-3.227-2.51c-.896.6-2.04.955-3.391.955-2.605 0-4.81-1.76-5.595-4.122H3.073v2.59A9.998 9.998 0 0 0 12 22Z"
      />
      <path
        fill="#fff"
        opacity=".7"
        d="M6.405 13.9A6 6 0 0 1 6.09 12c0-.659.114-1.3.314-1.9V7.51H3.073A9.997 9.997 0 0 0 2 12c0 1.614.386 3.14 1.073 4.49l3.332-2.59Z"
      />
      <path
        fill="#fff"
        opacity=".55"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.864-2.864C16.964 2.99 14.7 2 12 2A9.998 9.998 0 0 0 3.073 7.51l3.332 2.59C7.19 7.738 9.395 5.977 12 5.977Z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
