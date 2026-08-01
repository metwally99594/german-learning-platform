"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = createClient();

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    } catch {
      // Supabase credentials are not configured yet; render in signed-out state.
      setUser(null);
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
