import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithMicrosoft } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [signingInGoogle, setSigningInGoogle] = useState(false);
  const [signingInMicrosoft, setSigningInMicrosoft] = useState(false);

  async function handleSignInGoogle() {
    setSigningInGoogle(true);
    await signInWithGoogle();
    setSigningInGoogle(false);
    onOpenChange(false);
  }

  async function handleSignInMicrosoft() {
    setSigningInMicrosoft(true);
    await signInWithMicrosoft();
    setSigningInMicrosoft(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border bg-[#18181b] p-8 sm:max-w-[400px]">
        <DialogHeader className="space-y-4 text-left mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary p-2 shadow-lg">
            <img src="/zones-logo.png" alt="Zones" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white/70 mb-1">
              Welcome back.
            </DialogTitle>
            <DialogDescription className="text-2xl font-bold text-white tracking-tight">
              Log in to your account
            </DialogDescription>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <Button
            onClick={handleSignInGoogle}
            disabled={signingInGoogle || signingInMicrosoft}
            variant="outline"
            className="h-12 w-full justify-center gap-3 rounded-lg border-white/10 bg-[#27272a] text-sm font-semibold text-white hover:bg-[#3f3f46] hover:text-white"
          >
            {signingInGoogle ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            Continue with Google
          </Button>

          <Button
            onClick={handleSignInMicrosoft}
            disabled={signingInGoogle || signingInMicrosoft}
            variant="outline"
            className="h-12 w-full justify-center gap-3 rounded-lg border-white/10 bg-[#27272a] text-sm font-semibold text-white hover:bg-[#3f3f46] hover:text-white"
          >
            {signingInMicrosoft ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MicrosoftIcon className="h-5 w-5" />
            )}
            Continue with Microsoft
          </Button>
        </motion.div>
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
