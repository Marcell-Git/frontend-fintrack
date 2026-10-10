import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, ACTIVE_COOKIE, sessionCookieOptions } from "@/lib/session";

// Sinkronisasi token hasil refresh otomatis Supabase ke cookie.
// Sengaja TIDAK memperpanjang penanda aktivitas: tab yang dibiarkan terbuka tanpa dipakai
// tetap kedaluwarsa setelah 7 hari.
export async function POST(request) {
  const cookieStore = await cookies();

  if (!cookieStore.get(ACTIVE_COOKIE)) {
    return NextResponse.json(
      { message: "Sesi berakhir karena tidak ada aktivitas.", code: "SESSION_INACTIVE" },
      { status: 401 }
    );
  }

  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ message: "No access token provided" }, { status: 400 });
    }

    cookieStore.set(SESSION_COOKIE, accessToken, sessionCookieOptions);
    return NextResponse.json({ message: "Session synced" });
  } catch (error) {
    console.error("Session sync error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
