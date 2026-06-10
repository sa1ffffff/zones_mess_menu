import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
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
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
  return result;
}

export async function signOut() {
  await supabase.auth.signOut();
}
