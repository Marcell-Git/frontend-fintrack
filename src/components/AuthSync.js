"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Supabase memperbarui access token di browser kira-kira tiap jam (juga saat tab kembali aktif).
// Komponen ini menyalin token baru ke cookie supaya server tetap bisa memakainya.
export default function AuthSync() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== "TOKEN_REFRESHED" || !session?.access_token) return;

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.access_token }),
      }).catch(() => null);

      // Penanda aktivitas sudah habis (tidak aktif 7 hari) → akhiri sesi di browser juga
      if (res?.status === 401) {
        await supabase.auth.signOut({ scope: "local" });
        window.location.replace("/login?expired=1");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
