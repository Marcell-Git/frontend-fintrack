// Aturan sesi FinTrack:
// - fintrack_session : access token Supabase (diperbarui otomatis tiap ~1 jam oleh AuthSync)
// - fintrack_active  : penanda aktivitas, diperpanjang di setiap request user (lihat src/proxy.js).
//   Kalau user tidak beraktivitas selama INACTIVITY_LIMIT_SECONDS, cookie ini habis dan user harus login lagi.
export const SESSION_COOKIE = process.env.COOKIE_NAME || "fintrack_session";
export const ACTIVE_COOKIE = "fintrack_active";
export const INACTIVITY_LIMIT_SECONDS = 7 * 24 * 60 * 60; // 7 hari

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // "lax" supaya cookie tetap terkirim saat app dibuka dari link luar (mis. email konfirmasi)
  sameSite: "lax",
  path: "/",
  maxAge: INACTIVITY_LIMIT_SECONDS,
};

// Baca klaim `exp` JWT tanpa verifikasi — hanya untuk memutuskan perlu refresh atau tidak.
// Verifikasi sesungguhnya tetap dilakukan backend.
export function isTokenFresh(token, marginSeconds = 60) {
  if (!token) return false;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" && json.exp * 1000 - Date.now() > marginSeconds * 1000;
  } catch {
    return false;
  }
}

// Cegah open redirect: hanya path internal
export function safeNextPath(next) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
