"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./browser-client";

export default function useSession() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const session = {
        user
      }
      setSession(session);
    };

    getSession();
  }, []);

  return session;
}
