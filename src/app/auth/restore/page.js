"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { safeNextPath } from "@/lib/session";

// Dibuka oleh src/proxy.js saat user masih aktif (< 7 hari) tapi access token di cookie sudah kedaluwarsa.
// Supabase di browser masih menyimpan refresh token, jadi sesi bisa dipulihkan tanpa login ulang.
function RestoreSession() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = safeNextPath(searchParams.get("next"));

    (async () => {
      // getSession() otomatis me-refresh token yang kedaluwarsa
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: session.access_token }),
        }).catch(() => null);

        if (res?.ok) {
          window.location.replace(next);
          return;
        }
      }

      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      window.location.replace("/login");
    })();
  }, [searchParams]);

  return <Splash />;
}

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-header text-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      <p className="text-sm font-medium text-white/80">Memulihkan sesi...</p>
    </div>
  );
}

export default function RestorePage() {
  return (
    <Suspense fallback={<Splash />}>
      <RestoreSession />
    </Suspense>
  );
}
