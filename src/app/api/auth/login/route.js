import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, ACTIVE_COOKIE, sessionCookieOptions } from "@/lib/session";

// Login sungguhan: simpan token dan mulai hitungan aktivitas 7 hari
export async function POST(request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { message: "No access token provided" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, accessToken, sessionCookieOptions);
    cookieStore.set(ACTIVE_COOKIE, "1", sessionCookieOptions);

    return NextResponse.json({ message: "Session created" });
  } catch (error) {
    console.error("Login cookie error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
