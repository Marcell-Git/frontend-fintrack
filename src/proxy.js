import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  ACTIVE_COOKIE,
  sessionCookieOptions,
  isTokenFresh,
} from "@/lib/session";

const PUBLIC_PAGES = ["/login", "/register"];
const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/logout"];
const RESTORE_PAGE = "/auth/restore";
// Request latar belakang yang tidak dihitung sebagai aktivitas user
const BACKGROUND_API = ["/api/auth/session"];

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PAGES.includes(pathname) || PUBLIC_API.includes(pathname)) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/");
  const isActive = Boolean(request.cookies.get(ACTIVE_COOKIE)?.value);
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // Tidak ada aktivitas selama 7 hari (atau belum pernah login)
  if (!isActive) {
    if (isApi && !BACKGROUND_API.includes(pathname)) {
      return NextResponse.json(
        { message: "Sesi berakhir karena tidak ada aktivitas selama 7 hari.", code: "SESSION_INACTIVE" },
        { status: 401 }
      );
    }
    if (isApi) return NextResponse.next(); // route sync sendiri yang menolak

    const loginUrl = new URL("/login", request.url);
    if (token) loginUrl.searchParams.set("expired", "1");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (pathname === RESTORE_PAGE || BACKGROUND_API.includes(pathname)) {
    return NextResponse.next();
  }

  // Masih aktif tapi access token kedaluwarsa (app lama tertutup) → pulihkan sesi di browser
  if (!isApi && !isTokenFresh(token)) {
    const restoreUrl = new URL(RESTORE_PAGE, request.url);
    restoreUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(restoreUrl);
  }

  // Aktivitas user → perpanjang batas 7 hari
  const response = NextResponse.next();
  response.cookies.set(ACTIVE_COOKIE, "1", sessionCookieOptions);
  return response;
}

export const config = {
  // Semua halaman & API, kecuali aset Next.js dan file statis (yang punya ekstensi)
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
