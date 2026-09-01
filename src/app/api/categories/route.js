import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://backend-fintrack-gules.vercel.app";
const COOKIE_NAME = process.env.COOKIE_NAME || "fintrack_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${BACKEND_API_URL}/api/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: "Failed to fetch categories" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error (GET categories):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_API_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.error || errorData.message || "Backend error" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error (POST categories):", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
