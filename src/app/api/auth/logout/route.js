import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, ACTIVE_COOKIE } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ACTIVE_COOKIE);
  return NextResponse.json({ message: "Logged out" });
}
