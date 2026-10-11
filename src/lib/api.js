import { cookies } from "next/headers";

const API_BASE_URL = process.env.BACKEND_API_URL || "https://backend-fintrack-gules.vercel.app";
const COOKIE_NAME = process.env.COOKIE_NAME || "fintrack_session";

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value;
}

export async function fetchWithAuth(endpoint, options = {}) {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  // Hanya 401/403 yang berarti sesi tidak valid → halaman akan redirect ke /login
  if (res.status === 401 || res.status === 403) {
    return null;
  }

  // Error lain (backend/database bermasalah) dilempar ke src/app/error.js, bukan logout
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`Fetch error for ${endpoint}: ${res.status}`, errorData);
    throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
