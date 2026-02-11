import { cookies } from "next/headers";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:7000";
const COOKIE_NAME = process.env.COOKIE_NAME || "fintrack_session";

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value;
}

export async function fetchWithAuth(endpoint, options = {}) {
  const token = await getAuthToken();
  
  // If no token, we can't authenticate. Return null or handle based on caller.
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure fresh data by default
    });

    if (res.status === 401 || res.status === 403) {
      return null; // Let the page handle redirect if needed
    }

    if (!res.ok) {
      // Allow handling specific errors if needed, or throw
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    return null;
  }
}
