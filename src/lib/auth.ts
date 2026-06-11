import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

import { toast } from "sonner";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDomain = async (s: Session | null) => {
      if (s?.user) {
        const provider = s.user.app_metadata?.provider;
        const email = s.user.email || "";
        
        // Strictly enforce @zones.com for Microsoft (azure) logins
        if (provider === "azure" && !email.toLowerCase().endsWith("@zones.com")) {
          await supabase.auth.signOut();
          toast.error("Access Denied", {
            description: "Only @zones.com emails are allowed to sign in via Microsoft."
          });
          setSession(null);
          setLoading(false);
          return;
        }
      }
      setSession(s);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      checkDomain(s);
    });
    
    supabase.auth.getSession().then(({ data }) => {
      checkDomain(data.session);
    });
    
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function userDisplayName(user: User | null | undefined) {
  if (!user) return "";
  const m = user.user_metadata || {};
  return (
    m.full_name || m.name || m.user_name || (user.email ? user.email.split("@")[0] : "User")
  );
}

export function userAvatar(user: User | null | undefined) {
  return (user?.user_metadata?.avatar_url as string | undefined) ?? undefined;
}

export async function signInWithGoogle() {
  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    }
  });
  return result;
}

export async function signInWithMicrosoft() {
  const result = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      scopes: "email profile",
      redirectTo: window.location.origin,
    }
  });
  return result;
}

export async function signOut() {
  await supabase.auth.signOut();
}
